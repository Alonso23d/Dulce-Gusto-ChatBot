<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DeliveryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product:slug}', [ProductController::class, 'show']);

Route::get('/delivery/zones', [DeliveryController::class, 'zones']);

Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/track/{orderNumber}', [OrderController::class, 'track']);
Route::post('/orders/{order}/voucher', [OrderController::class, 'uploadVoucher']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Admin routes
    Route::middleware('admin')->group(function () {
        Route::get('/admin/dashboard', [DashboardController::class, 'stats']);

        // Categories admin
        Route::get('/admin/categories', [CategoryController::class, 'adminIndex']);
        Route::post('/admin/categories', [CategoryController::class, 'store']);
        Route::put('/admin/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/admin/categories/{category}', [CategoryController::class, 'destroy']);

        // Products admin
        Route::get('/admin/products', [ProductController::class, 'adminIndex']);
        Route::post('/admin/products', [ProductController::class, 'store']);
        Route::put('/admin/products/{product}', [ProductController::class, 'update']);
        Route::delete('/admin/products/{product}', [ProductController::class, 'destroy']);
        Route::patch('/admin/products/{product}/stock', [ProductController::class, 'updateStock']);

        // Orders admin
        Route::get('/admin/orders', [OrderController::class, 'index']);
        Route::get('/admin/orders/{order}', [OrderController::class, 'show']);
        Route::patch('/admin/orders/{order}/status', [OrderController::class, 'updateStatus']);

        // Delivery admin
        Route::get('/admin/deliveries', [DeliveryController::class, 'index']);
        Route::patch('/admin/deliveries/{delivery}/assign', [DeliveryController::class, 'assign']);
        Route::patch('/admin/deliveries/{delivery}/status', [DeliveryController::class, 'updateStatus']);
        Route::get('/admin/drivers', [DeliveryController::class, 'drivers']);

        Route::post('/admin/delivery-zones', [DeliveryController::class, 'storeZone']);
        Route::put('/admin/delivery-zones/{deliveryZone}', [DeliveryController::class, 'updateZone']);

        // Customers admin
        Route::get('/admin/customers', [CustomerController::class, 'index']);
        Route::get('/admin/customers/{email}/orders', [CustomerController::class, 'orders']);
    });

    // Driver routes
    Route::middleware('driver')->group(function () {
        Route::get('/driver/deliveries', [\App\Http\Controllers\Api\DriverController::class, 'index']);
        Route::get('/driver/deliveries/pending', [\App\Http\Controllers\Api\DriverController::class, 'pendingDeliveries']);
        Route::post('/driver/deliveries/{delivery}/accept', [\App\Http\Controllers\Api\DriverController::class, 'acceptDelivery']);
        Route::patch('/driver/deliveries/{delivery}/status', [\App\Http\Controllers\Api\DriverController::class, 'updateStatus']);
    });
});
