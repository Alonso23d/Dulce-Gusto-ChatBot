<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DeliveryZone extends Model
{
    use HasFactory;

    protected $fillable = ['district', 'delivery_cost', 'estimated_minutes', 'is_active'];

    protected $casts = [
        'delivery_cost' => 'decimal:2',
        'is_active' => 'boolean',
    ];
}
