<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::selectRaw('
                customer_email,
                MAX(customer_name)    as customer_name,
                MAX(customer_phone)   as customer_phone,
                MAX(district)         as district,
                COUNT(*)              as total_orders,
                SUM(total)            as total_spent,
                MAX(created_at)       as last_order_at
            ')
            ->groupBy('customer_email');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('customer_name', 'like', "%{$request->search}%")
                  ->orWhere('customer_email', 'like', "%{$request->search}%")
                  ->orWhere('customer_phone', 'like', "%{$request->search}%");
            });
        }

        $customers = $query->orderBy('last_order_at', 'desc')->paginate(20);

        return response()->json($customers);
    }

    public function orders(Request $request, string $email)
    {
        $orders = Order::where('customer_email', $email)
            ->with('items')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }
}
