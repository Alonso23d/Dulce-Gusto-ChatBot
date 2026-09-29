<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        $todayStart  = now()->startOfDay();
        $todayEnd    = now()->endOfDay();
        $weekStart   = now()->startOfWeek();
        $weekEnd     = now()->endOfWeek();
        $monthStart  = now()->startOfMonth();
        $monthEnd    = now()->endOfMonth();
        $days30Start = now()->subDays(29)->startOfDay();

        // 'pending' excluido — solo cuenta como venta desde que el admin confirma el pago
        $notCancelled = ['confirmed','preparing','ready','on_way','delivered'];

        $todaySales = Order::whereBetween('created_at', [$todayStart, $todayEnd])
            ->whereIn('status', $notCancelled)->sum('total');

        $todayOrders = Order::whereBetween('created_at', [$todayStart, $todayEnd])->count();

        $monthSales = Order::whereBetween('created_at', [$monthStart, $monthEnd])
            ->whereIn('status', $notCancelled)->sum('total');

        $totalRevenue = Order::whereIn('status', $notCancelled)->sum('total');

        $pendingOrders = Order::whereIn('status', ['pending', 'confirmed', 'preparing'])->count();
        $onWayOrders   = Order::where('status', 'on_way')->count();

        // Gráficos de tendencia incluyen pending para mostrar actividad real
        $notCancelledChart = ['pending','confirmed','preparing','ready','on_way','delivered'];

        $weekSales = Order::whereBetween('created_at', [$weekStart, $weekEnd])
            ->whereIn('status', $notCancelledChart)
            ->selectRaw('DAYOFWEEK(created_at) as day, SUM(total) as total')
            ->groupBy('day')
            ->pluck('total', 'day');

        $last30 = Order::whereBetween('created_at', [$days30Start, $todayEnd])
            ->whereIn('status', $notCancelledChart)
            ->selectRaw('DATE(created_at) as date, SUM(total) as total, COUNT(*) as orders')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $ordersByStatus = Order::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')->pluck('count', 'status');

        $topProducts = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereIn('orders.status', $notCancelled)
            ->selectRaw('product_name, SUM(order_items.quantity) as qty, SUM(order_items.subtotal) as revenue')
            ->groupBy('product_name')
            ->orderByDesc('revenue')
            ->limit(5)->get();

        $recentOrders = Order::with('delivery')->latest()->limit(10)->get();

        $lowStock = Product::where('is_active', true)
            ->where('stock', '<=', 10)
            ->orderBy('stock')
            ->get(['id', 'name', 'stock']);

        return response()->json([
            'today_sales'      => $todaySales,
            'today_orders'     => $todayOrders,
            'month_sales'      => $monthSales,
            'total_revenue'    => $totalRevenue,
            'pending_orders'   => $pendingOrders,
            'on_way_orders'    => $onWayOrders,
            'week_sales'       => $weekSales,
            'last_30_days'     => $last30,
            'orders_by_status' => $ordersByStatus,
            'top_products'     => $topProducts,
            'recent_orders'    => $recentOrders,
            'low_stock'        => $lowStock,
        ]);
    }
}
