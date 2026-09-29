<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    /**
     * Get deliveries assigned to the authenticated driver.
     */
    public function index(Request $request)
    {
        $driverId = $request->user()->id;
        
        $query = Delivery::with(['order', 'driver'])
            ->where('driver_id', $driverId);

        if ($request->status === 'history') {
            $query->whereIn('status', ['delivered', 'failed']);
        } elseif ($request->status) {
            $query->where('status', $request->status);
        } else {
            // By default, only show active deliveries
            $query->whereIn('status', ['accepted', 'picked_up', 'on_way']);
        }

        return response()->json($query->latest()->get());
    }

    /**
     * Get pending deliveries that haven't been assigned yet.
     */
    public function pendingDeliveries(Request $request)
    {
        $deliveries = Delivery::with(['order'])
            ->where('driver_id', $request->user()->id)
            ->where('status', 'assigned')
            ->latest()
            ->get();
            
        return response()->json($deliveries);
    }

    /**
     * Accept a pending delivery.
     */
    public function acceptDelivery(Request $request, Delivery $delivery)
    {
        if ($delivery->driver_id !== $request->user()->id || $delivery->status !== 'assigned') {
            return response()->json(['message' => 'Pedido no disponible para aceptar.'], 400);
        }

        $delivery->update(['status' => 'accepted']);

        return response()->json($delivery->load(['order', 'driver']));
    }

    /**
     * Update the status of a delivery.
     */
    public function updateStatus(Request $request, Delivery $delivery)
    {
        if ($delivery->driver_id !== $request->user()->id) {
            return response()->json(['message' => 'No puedes modificar un pedido que no te pertenece.'], 403);
        }

        $request->validate([
            'status' => 'required|in:picked_up,on_way,delivered,failed',
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
}
