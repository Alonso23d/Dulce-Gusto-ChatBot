<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Delivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id', 'driver_id', 'status', 'driver_name', 'driver_phone',
        'assigned_at', 'picked_up_at', 'delivered_at', 'notes',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'picked_up_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function order() { return $this->belongsTo(Order::class); }
    public function driver() { return $this->belongsTo(User::class, 'driver_id'); }
}
