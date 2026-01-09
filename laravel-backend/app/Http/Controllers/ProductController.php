<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    public function addProduct(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|regex:/^[a-zA-Z\s]+$/',
            'descripcion' => 'required|regex:/^[a-zA-Z\s]+$/',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $product = Product::create([
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'user_id' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Producto agregado exitosamente',
            'product' => $product,
        ], 201);
    }
}
