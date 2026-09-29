<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone');
            $table->string('district');
            $table->text('address');
            $table->string('address_reference')->nullable();
            $table->date('delivery_date');
            $table->string('delivery_time')->nullable();
            $table->decimal('subtotal', 10, 2);
            $table->decimal('delivery_cost', 10, 2)->default(0);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            $table->enum('status', ['pending','confirmed','preparing','ready','on_way','delivered','cancelled'])->default('pending');
            $table->enum('payment_method', ['yape','plin','visa','bcp','transfer','cash'])->default('cash');
            $table->enum('payment_status', ['pending','paid','refunded'])->default('pending');
            $table->string('voucher_path')->nullable();
            $table->text('notes')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
