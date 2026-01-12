<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class StripeController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(env('STRIPE_SECRET_KEY'));
    }

    /**
     * Crear un Payment Intent para procesar el pago
     */
    public function createPaymentIntent(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.50', // Mínimo $0.50 USD
        ]);

        try {
            // Stripe trabaja en centavos, multiplicamos por 100
            $amountInCents = intval($request->amount * 100);

            $paymentIntent = PaymentIntent::create([
                'amount' => $amountInCents,
                'currency' => 'usd', // Puedes cambiarlo a 'mxn', 'eur', etc.
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
                'metadata' => [
                    'user_id' => $request->user()->id,
                ],
            ]);

            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
                'paymentIntentId' => $paymentIntent->id,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Confirmar que el pago fue exitoso
     */
    public function confirmPayment(Request $request)
    {
        $request->validate([
            'paymentIntentId' => 'required|string',
        ]);

        try {
            $paymentIntent = PaymentIntent::retrieve($request->paymentIntentId);

            if ($paymentIntent->status === 'succeeded') {
                return response()->json([
                    'success' => true,
                    'message' => 'Pago confirmado exitosamente',
                    'paymentIntent' => [
                        'id' => $paymentIntent->id,
                        'amount' => $paymentIntent->amount / 100,
                        'status' => $paymentIntent->status,
                    ],
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'El pago no se ha completado',
                'status' => $paymentIntent->status,
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
