<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\DeliveryZone;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_name' => 'required|string|max:200',
            'customer_email' => 'required|email',
            'customer_phone' => 'required|string|max:20',
            'district' => 'required|string',
            'address' => 'required|string',
            'address_reference' => 'nullable|string',
            'delivery_date' => 'required|date|after_or_equal:today',
            'delivery_time' => 'nullable|string',
            'payment_method' => 'required|in:yape,plin,visa,bcp,transfer,cash',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.size' => 'nullable|string',
            'items.*.customization' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($data, $request) {
            $zone = DeliveryZone::where('district', $data['district'])->where('is_active', true)->first();
            $deliveryCost = $zone ? $zone->delivery_cost : 15.00;

            $subtotal = 0;
            $orderItems = [];

            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                if ($product->stock < $item['quantity']) {
                    return response()->json([
                        'message' => "Stock insuficiente para {$product->name}.",
                    ], 422);
                }
                $itemSubtotal = $product->price * $item['quantity'];
                $subtotal += $itemSubtotal;
                $orderItems[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'size' => $item['size'] ?? null,
                    'customization' => $item['customization'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->price,
                    'subtotal' => $itemSubtotal,
                ];
                $product->decrement('stock', $item['quantity']);
            }

            $total = $subtotal + $deliveryCost;

            $order = Order::create([
                'user_id' => $request->user()?->id,
                'customer_name' => $data['customer_name'],
                'customer_email' => $data['customer_email'],
                'customer_phone' => $data['customer_phone'],
                'district' => $data['district'],
                'address' => $data['address'],
                'address_reference' => $data['address_reference'] ?? null,
                'delivery_date' => $data['delivery_date'],
                'delivery_time' => $data['delivery_time'] ?? null,
                'subtotal' => $subtotal,
                'delivery_cost' => $deliveryCost,
                'discount' => 0,
                'total' => $total,
                'payment_method' => $data['payment_method'],
                'notes' => $data['notes'] ?? null,
            ]);

            $order->items()->createMany($orderItems);
            Delivery::create(['order_id' => $order->id]);

            return response()->json($order->load('items'), 201);
        });
    }

    public function track(string $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)
            ->with(['items.product', 'delivery.driver'])
            ->firstOrFail();

        return response()->json($order);
    }

    public function index(Request $request)
    {
        $query = Order::with(['items', 'delivery.driver']);

        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('order_number', 'like', "%{$request->search}%")
                  ->orWhere('customer_name', 'like', "%{$request->search}%")
                  ->orWhere('customer_phone', 'like', "%{$request->search}%");
            });
        }
        if ($request->date) {
            $query->whereDate('created_at', $request->date);
        }

        return response()->json(
            $query->orderBy('created_at', 'desc')->paginate(20)
        );
    }

    public function show(Order $order)
    {
        return response()->json($order->load(['items.product', 'delivery.driver']));
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,preparing,ready,on_way,delivered,cancelled',
            'cancellation_reason' => 'required_if:status,cancelled|nullable|string',
        ]);

        $order->update([
            'status' => $request->status,
            'cancellation_reason' => $request->cancellation_reason,
        ]);

        if ($request->status === 'delivered') {
            $order->delivery?->update(['status' => 'delivered', 'delivered_at' => now()]);
        }

        return response()->json($order->load(['items', 'delivery']));
    }

    public function uploadVoucher(Request $request, Order $order)
    {
        $request->validate(['voucher' => 'required|image|max:5120']);
        $path = $request->file('voucher')->store('vouchers', 'public');
        $order->update(['voucher_path' => $path, 'payment_status' => 'paid']);
        return response()->json(['voucher_path' => $path]);
    }
}
