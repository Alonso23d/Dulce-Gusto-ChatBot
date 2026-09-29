<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::active()->with('category');

        if ($request->category) {
            $query->whereHas('category', fn($q) => $q->where('slug', $request->category));
        }
        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }
        if ($request->featured) {
            $query->featured();
        }
        if ($request->min_price) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->max_price) {
            $query->where('price', '<=', $request->max_price);
        }

        $sortBy = $request->get('sort', 'created_at');
        $sortDir = $request->get('dir', 'desc');
        $allowedSorts = ['price', 'name', 'rating', 'created_at'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir);
        }

        $products = $query->paginate($request->get('per_page', 12));
        return response()->json($products);
    }

    public function adminIndex(Request $request)
    {
        $query = Product::with('category');

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->has('is_active') && $request->is_active !== '') {
            $query->where('is_active', $request->is_active);
        }

        return response()->json($query->orderBy('created_at', 'desc')->paginate(15));
    }

    public function show(Product $product)
    {
        return response()->json($product->load('category'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:200',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|string',
            'images' => 'nullable|array',
            'sizes' => 'nullable|array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'sku' => 'nullable|string|unique:products,sku',
        ]);

        $data['slug'] = Str::slug($data['name']) . '-' . Str::random(5);
        $product = Product::create($data);

        return response()->json($product->load('category'), 201);
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'name' => 'sometimes|string|max:200',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'image' => 'nullable|string',
            'images' => 'nullable|array',
            'sizes' => 'nullable|array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'sku' => 'nullable|string|unique:products,sku,' . $product->id,
        ]);

        $product->update($data);
        return response()->json($product->load('category'));
    }

    public function destroy(Product $product)
    {
        $product->update(['is_active' => false]);
        return response()->json(null, 204);
    }

    public function updateStock(Request $request, Product $product)
    {
        $request->validate(['stock' => 'required|integer|min:0']);
        $product->update(['stock' => $request->stock]);
        return response()->json($product);
    }
}
