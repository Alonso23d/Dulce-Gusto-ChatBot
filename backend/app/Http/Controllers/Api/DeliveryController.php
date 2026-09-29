<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\DeliveryZone;
use App\Models\User;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    public function index(Request $request)
    {
        $query = Delivery::with(['order', 'driver']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function assign(Request $request, Delivery $delivery)
    {
        $request->validate(['driver_id' => 'required|exists:users,id']);

        $driver = User::findOrFail($request->driver_id);

        $delivery->update([
            'driver_id' => $driver->id,
            'driver_name' => $driver->name,
            'driver_phone' => $driver->phone,
            'status' => 'assigned',
            'assigned_at' => now(),
        ]);

        $delivery->order->update(['status' => 'on_way']);

        return response()->json($delivery->load(['order', 'driver']));
    }

    public function updateStatus(Request $request, Delivery $delivery)
    {
        $request->validate([
            'status' => 'required|in:pending,assigned,accepted,picked_up,on_way,delivered,failed',
        ]);

        $timestamps = [];
        if ($request->status === 'picked_up') $timestamps['picked_up_at'] = now();
        if ($request->status === 'delivered') $timestamps['delivered_at'] = now();

        $delivery->update(['status' => $request->status, ...$timestamps]);

        if ($request->status === 'delivered') {
            $delivery->order->update(['status' => 'delivered']);
        }

        return response()->json($delivery->load(['order', 'driver']));
    }

    public function drivers()
    {
        $drivers = User::where('role', 'delivery')->where('is_active', true)->get();
        return response()->json($drivers);
    }

    public function zones()
    {
        return response()->json(DeliveryZone::where('is_active', true)->orderBy('district')->get());
    }

    public function storeZone(Request $request)
    {
        $data = $request->validate([
            'district' => 'required|string|unique:delivery_zones,district',
            'delivery_cost' => 'required|numeric|min:0',
            'estimated_minutes' => 'required|integer|min:0',
        ]);
        return response()->json(DeliveryZone::create($data), 201);
    }

    public function updateZone(Request $request, DeliveryZone $deliveryZone)
    {
        $data = $request->validate([
            'delivery_cost' => 'sometimes|numeric|min:0',
            'estimated_minutes' => 'sometimes|integer|min:0',
            'is_active' => 'boolean',
        ]);
        $deliveryZone->update($data);
        return response()->json($deliveryZone);
    }
}
