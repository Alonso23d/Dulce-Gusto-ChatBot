<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Delivery;
use App\Models\DeliveryZone;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@dulcegusto.pe'],
            [
                'name' => 'Admin Dulce Gusto',
                'phone' => '999000001',
                'role' => 'admin',
                'password' => Hash::make('admin123'),
            ]
        );

        User::firstOrCreate(
            ['email' => 'carlos@dulcegusto.pe'],
            [
                'name' => 'Carlos Repartidor',
                'phone' => '999000002',
                'role' => 'delivery',
                'password' => Hash::make('delivery123'),
            ]
        );

        User::firstOrCreate(
            ['email' => 'pedro@dulcegusto.pe'],
            [
                'name' => 'Pedro Repartidor',
                'phone' => '999000003',
                'role' => 'delivery',
                'password' => Hash::make('delivery123'),
            ]
        );

        $categories = [
            ['name' => 'Tortas', 'slug' => 'tortas', 'sort_order' => 1],
            ['name' => 'Cupcakes', 'slug' => 'cupcakes', 'sort_order' => 2],
            ['name' => 'Macarons', 'slug' => 'macarons', 'sort_order' => 3],
            ['name' => 'Cheesecake', 'slug' => 'cheesecake', 'sort_order' => 4],
            ['name' => 'Alfajores', 'slug' => 'alfajores', 'sort_order' => 5],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(['slug' => $cat['slug']], $cat);
        }

        $products = [
            ['category_id' => 1, 'name' => 'Torta Red Velvet', 'description' => 'Deliciosa torta red velvet con frosting de queso crema.', 'price' => 65.00, 'stock' => 8, 'is_featured' => true, 'rating' => 4.8, 'sizes' => ['6 porciones', '12 porciones', '20 porciones'], 'image' => 'https://images.unsplash.com/photo-1562440499-64c9a111f713?w=600&h=600&fit=crop&q=80'],
            ['category_id' => 1, 'name' => 'Torta Tres Leches', 'description' => 'Suave biscocho empapado en tres tipos de leche.', 'price' => 55.00, 'stock' => 6, 'is_featured' => true, 'rating' => 4.7, 'sizes' => ['6 porciones', '12 porciones'], 'image' => 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=600&fit=crop&q=80'],
            ['category_id' => 1, 'name' => 'Torta de Chocolate', 'description' => 'Intenso sabor a chocolate con ganache.', 'price' => 60.00, 'stock' => 5, 'rating' => 4.6, 'sizes' => ['6 porciones', '12 porciones', '20 porciones'], 'image' => 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&h=600&fit=crop&q=80'],
            ['category_id' => 1, 'name' => 'Torta Vainilla', 'description' => 'Clásica torta de vainilla con buttercream.', 'price' => 50.00, 'stock' => 7, 'rating' => 4.5, 'sizes' => ['6 porciones', '12 porciones'], 'image' => 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&h=600&fit=crop&q=80'],
            ['category_id' => 2, 'name' => 'Cupcakes x6', 'description' => 'Caja de 6 cupcakes decorados a mano.', 'price' => 28.00, 'stock' => 20, 'is_featured' => true, 'rating' => 4.9, 'sizes' => null, 'image' => 'https://th.bing.com/th/id/R.6e64d105d69d416ef89d7ff61f8ca9fb?rik=%2bKmaCwdmZ79KVw&pid=ImgRaw&r=0'],
            ['category_id' => 2, 'name' => 'Cupcakes x12', 'description' => 'Caja de 12 cupcakes surtidos.', 'price' => 52.00, 'stock' => 15, 'rating' => 4.8, 'sizes' => null, 'image' => 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600&h=600&fit=crop&q=80'],
            ['category_id' => 3, 'name' => 'Caja Macarons x12', 'description' => 'Macarons artesanales en distintos sabores.', 'price' => 38.00, 'stock' => 12, 'is_featured' => true, 'rating' => 4.7, 'sizes' => null, 'image' => 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=600&h=600&fit=crop&q=80'],
            ['category_id' => 3, 'name' => 'Caja Macarons x24', 'description' => 'Caja grande de macarons para eventos.', 'price' => 70.00, 'stock' => 8, 'rating' => 4.8, 'sizes' => null, 'image' => 'https://images.unsplash.com/photo-1587241321921-91a834d6d191?w=600&h=600&fit=crop&q=80'],
            ['category_id' => 4, 'name' => 'Cheesecake Fresa', 'description' => 'Cremoso cheesecake con coulis de fresa.', 'price' => 45.00, 'stock' => 5, 'is_featured' => true, 'rating' => 4.9, 'sizes' => null, 'image' => 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&h=600&fit=crop&q=80'],
            ['category_id' => 4, 'name' => 'Cheesecake Mango', 'description' => 'Cheesecake tropical de mango.', 'price' => 45.00, 'stock' => 4, 'rating' => 4.7, 'sizes' => null, 'image' => 'https://images.unsplash.com/photo-1565299543923-37dd37887442?w=600&h=600&fit=crop&q=80'],
            ['category_id' => 5, 'name' => 'Alfajores x12', 'description' => 'Alfajores de maizena rellenos de manjar.', 'price' => 32.00, 'stock' => 25, 'rating' => 4.6, 'sizes' => null, 'image' => 'https://images.unsplash.com/photo-1621236378699-8597faf6a176?w=600&h=600&fit=crop&q=80'],
            ['category_id' => 1, 'name' => 'Torta de Pecanas', 'description' => 'Bizcocho a base de pecanas, relleno y bañado con manjar blanco.', 'price' => 70.00, 'stock' => 5, 'is_featured' => true, 'rating' => 4.9, 'sizes' => ['6 porciones', '12 porciones', '20 porciones'], 'image' => 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&h=600&fit=crop'],
            ['category_id' => 1, 'name' => 'Carrot Cake', 'description' => 'Torta de zanahoria con especias y frosting de queso crema.', 'price' => 65.00, 'stock' => 6, 'rating' => 4.8, 'sizes' => ['6 porciones', '12 porciones'], 'image' => 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600&h=600&fit=crop'],
            ['category_id' => 2, 'name' => 'Cupcakes Red Velvet', 'description' => 'Caja de 6 cupcakes red velvet con queso crema.', 'price' => 30.00, 'stock' => 15, 'rating' => 4.9, 'sizes' => null, 'image' => 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=600&h=600&fit=crop'],
            ['category_id' => 2, 'name' => 'Cupcakes de Chocolate', 'description' => 'Caja de 6 cupcakes full chocolate.', 'price' => 28.00, 'stock' => 12, 'rating' => 4.7, 'sizes' => null, 'image' => 'https://images.unsplash.com/photo-1599785209707-a456fc1337cb?w=600&h=600&fit=crop'],
            ['category_id' => 3, 'name' => 'Caja Macarons x6', 'description' => 'Perfecto para un regalo especial.', 'price' => 22.00, 'stock' => 20, 'rating' => 4.6, 'sizes' => null, 'image' => 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=600&fit=crop'],
            ['category_id' => 3, 'name' => 'Macarons Premium', 'description' => 'Caja de 15 macarons con sabores exóticos.', 'price' => 55.00, 'stock' => 10, 'rating' => 4.9, 'sizes' => null, 'image' => 'https://images.unsplash.com/photo-1612201142855-7873bc1661b4?w=600&h=600&fit=crop'],
            ['category_id' => 4, 'name' => 'Cheesecake Maracuyá', 'description' => 'Cheesecake con salsa ácida y dulce de maracuyá.', 'price' => 48.00, 'stock' => 6, 'rating' => 4.8, 'sizes' => null, 'image' => 'https://images.unsplash.com/photo-1596538356170-c3d319fffd45?w=600&h=600&fit=crop'],
            ['category_id' => 4, 'name' => 'Cheesecake Arándanos', 'description' => 'Cheesecake clásico con mermelada de arándanos casera.', 'price' => 50.00, 'stock' => 5, 'rating' => 4.9, 'sizes' => null, 'image' => 'https://images.unsplash.com/photo-1565314050516-72cb612dbfcc?w=600&h=600&fit=crop'],
            ['category_id' => 5, 'name' => 'Alfajores de Chocolate', 'description' => 'Alfajores bañados en chocolate bitter.', 'price' => 38.00, 'stock' => 15, 'rating' => 4.8, 'sizes' => null, 'image' => 'https://images.unsplash.com/photo-1621236378699-8597faf6a176?w=600&h=600&fit=crop'],
            ['category_id' => 5, 'name' => 'Alfajores Mini x24', 'description' => 'Cajita de alfajores mini para picar.', 'price' => 25.00, 'stock' => 30, 'rating' => 4.7, 'sizes' => null, 'image' => 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&h=600&fit=crop'],
        ];

        foreach ($products as $prod) {
            Product::updateOrCreate(
                ['name' => $prod['name']],
                array_merge($prod, [
                    'slug' => Str::slug($prod['name']) . '-' . Str::random(4),
                    'sku' => 'DG-' . strtoupper(Str::random(6)),
                    'is_active' => true,
                    'is_featured' => $prod['is_featured'] ?? false,
                    'reviews_count' => rand(10, 50),
                ])
            );
        }

        $zones = [
            ['district' => 'Miraflores', 'delivery_cost' => 10.00, 'estimated_minutes' => 60],
            ['district' => 'San Isidro', 'delivery_cost' => 10.00, 'estimated_minutes' => 60],
            ['district' => 'Barranco', 'delivery_cost' => 12.00, 'estimated_minutes' => 75],
            ['district' => 'Surco', 'delivery_cost' => 12.00, 'estimated_minutes' => 75],
            ['district' => 'La Molina', 'delivery_cost' => 15.00, 'estimated_minutes' => 90],
            ['district' => 'San Borja', 'delivery_cost' => 10.00, 'estimated_minutes' => 60],
            ['district' => 'Lince', 'delivery_cost' => 10.00, 'estimated_minutes' => 60],
            ['district' => 'Pueblo Libre', 'delivery_cost' => 12.00, 'estimated_minutes' => 75],
            ['district' => 'Jesús María', 'delivery_cost' => 10.00, 'estimated_minutes' => 60],
            ['district' => 'Magdalena', 'delivery_cost' => 12.00, 'estimated_minutes' => 75],
            ['district' => 'San Miguel', 'delivery_cost' => 12.00, 'estimated_minutes' => 75],
            ['district' => 'Chorrillos', 'delivery_cost' => 15.00, 'estimated_minutes' => 90],
            ['district' => 'Villa María del Triunfo', 'delivery_cost' => 18.00, 'estimated_minutes' => 120],
            ['district' => 'Ate', 'delivery_cost' => 18.00, 'estimated_minutes' => 120],
            ['district' => 'Santa Anita', 'delivery_cost' => 18.00, 'estimated_minutes' => 120],
        ];

        foreach ($zones as $zone) {
            DeliveryZone::firstOrCreate(['district' => $zone['district']], $zone);
        }

        // Sample orders
        $this->seedOrders();
    }

    private function seedOrders(): void
    {
        $products = Product::all()->keyBy('id');
        $samples = [
            ['name'=>'María López',   'email'=>'maria@test.com',   'phone'=>'999111001','district'=>'Miraflores','status'=>'delivered','days'=>0,'pay'=>'paid',   'items'=>[[1,1],[5,2]]],
            ['name'=>'Carlos Ramos',  'email'=>'carlos@test.com',  'phone'=>'999111002','district'=>'San Isidro','status'=>'preparing','days'=>0,'pay'=>'pending', 'items'=>[[3,1],[7,1]]],
            ['name'=>'Ana Torres',    'email'=>'ana@test.com',     'phone'=>'999111003','district'=>'Surco',     'status'=>'pending',  'days'=>0,'pay'=>'pending', 'items'=>[[9,1]]],
            ['name'=>'Jorge Huamán',  'email'=>'jorge@test.com',   'phone'=>'999111004','district'=>'Barranco',  'status'=>'on_way',   'days'=>0,'pay'=>'paid',   'items'=>[[2,1],[6,1]]],
            ['name'=>'Sofía Mendoza', 'email'=>'sofia@test.com',   'phone'=>'999111005','district'=>'La Molina', 'status'=>'delivered','days'=>1,'pay'=>'paid',   'items'=>[[4,1],[11,2]]],
            ['name'=>'Luis Vargas',   'email'=>'luis@test.com',    'phone'=>'999111006','district'=>'San Borja', 'status'=>'delivered','days'=>1,'pay'=>'paid',   'items'=>[[8,1]]],
            ['name'=>'Patricia Díaz', 'email'=>'patricia@test.com','phone'=>'999111007','district'=>'Lince',     'status'=>'delivered','days'=>2,'pay'=>'paid',   'items'=>[[1,2],[5,1]]],
            ['name'=>'Roberto Silva', 'email'=>'roberto@test.com', 'phone'=>'999111008','district'=>'Chorrillos','status'=>'delivered','days'=>3,'pay'=>'paid',   'items'=>[[10,1],[7,1]]],
            ['name'=>'Lucía Quispe',  'email'=>'lucia@test.com',   'phone'=>'999111009','district'=>'Miraflores','status'=>'delivered','days'=>4,'pay'=>'paid',   'items'=>[[3,1],[9,1]]],
            ['name'=>'Miguel Flores', 'email'=>'miguel@test.com',  'phone'=>'999111010','district'=>'San Isidro','status'=>'delivered','days'=>5,'pay'=>'paid',   'items'=>[[6,2]]],
            ['name'=>'Carmen Rojas',  'email'=>'carmen@test.com',  'phone'=>'999111011','district'=>'Surco',     'status'=>'delivered','days'=>5,'pay'=>'paid',   'items'=>[[1,1],[8,1]]],
            ['name'=>'David Castillo','email'=>'david@test.com',   'phone'=>'999111012','district'=>'San Miguel','status'=>'delivered','days'=>6,'pay'=>'paid',   'items'=>[[2,1],[5,3]]],
        ];

        foreach ($samples as $idx => $o) {
            $zone = DeliveryZone::where('district', $o['district'])->first();
            $deliveryCost = $zone ? (float)$zone->delivery_cost : 15.0;
            $subtotal = 0.0;
            $itemsData = [];

            foreach ($o['items'] as [$pid, $qty]) {
                $p = $products[$pid] ?? null;
                if (!$p) continue;
                $sub = (float)$p->price * $qty;
                $subtotal += $sub;
                $itemsData[] = [
                    'product_id'    => $p->id,
                    'product_name'  => $p->name,
                    'quantity'      => $qty,
                    'unit_price'    => $p->price,
                    'subtotal'      => $sub,
                    'size'          => null,
                    'customization' => null,
                ];
            }

            $total = $subtotal + $deliveryCost;
            $ts = now()->subDays($o['days'])->setHour(rand(9,20))->setMinute(rand(0,59))->format('Y-m-d H:i:s');
            $orderNumber = 'DG-'.date('Y').'-'.str_pad($idx + 1, 4, '0', STR_PAD_LEFT);

            \DB::table('orders')->insert([
                'order_number'   => $orderNumber,
                'user_id'        => null,
                'customer_name'  => $o['name'],
                'customer_email' => $o['email'],
                'customer_phone' => $o['phone'],
                'district'       => $o['district'],
                'address'        => 'Av. Demo 123',
                'address_reference' => null,
                'delivery_date'  => now()->addDay()->toDateString(),
                'delivery_time'  => null,
                'subtotal'       => $subtotal,
                'delivery_cost'  => $deliveryCost,
                'discount'       => 0,
                'total'          => $total,
                'status'         => $o['status'],
                'payment_method' => 'yape',
                'payment_status' => $o['pay'],
                'voucher_path'   => null,
                'notes'          => null,
                'cancellation_reason' => null,
                'created_at'     => $ts,
                'updated_at'     => $ts,
            ]);

            $orderId = \DB::getPdo()->lastInsertId();

            foreach ($itemsData as $item) {
                \DB::table('order_items')->insert(array_merge($item, [
                    'order_id'   => $orderId,
                    'created_at' => $ts,
                    'updated_at' => $ts,
                ]));
            }

            \DB::table('deliveries')->insert([
                'order_id'    => $orderId,
                'driver_id'   => null,
                'driver_name' => null,
                'driver_phone'=> null,
                'status'      => $o['status'] === 'delivered' ? 'delivered' : ($o['status'] === 'on_way' ? 'on_way' : 'pending'),
                'assigned_at' => null,
                'picked_up_at'=> null,
                'delivered_at'=> $o['status'] === 'delivered' ? $ts : null,
                'notes'       => null,
                'created_at'  => $ts,
                'updated_at'  => $ts,
            ]);
        }
    }
}
