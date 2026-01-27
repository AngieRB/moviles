<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected $apiUrl;
    protected $apiKey;
    protected $phoneNumberId;

    public function __construct()
    {
        $this->apiUrl = env('WHATSAPP_API_URL', 'https://graph.facebook.com/v18.0');
        $this->apiKey = env('WHATSAPP_API_KEY');
        $this->phoneNumberId = env('WHATSAPP_PHONE_NUMBER_ID');
    }

    /**
     * Enviar notificación de nuevo reporte al admin
     */
    public function notificarNuevoReporte($report)
    {
        $adminPhone = env('ADMIN_WHATSAPP_NUMBER');
        
        if (!$adminPhone) {
            Log::warning('Número de WhatsApp del admin no configurado');
            return false;
        }

        $reportador = $report->reportador;
        $reportado = $report->reportado;
        $motivo = $this->getMotivoTexto($report->motivo);
        $prioridad = $this->getPrioridadTexto($report->prioridad);

        $mensaje = "🚨 *NUEVO REPORTE #{$report->id}*\n\n";
        $mensaje .= "⚠️ Prioridad: *{$prioridad}*\n\n";
        $mensaje .= "👤 Reportador: {$reportador->nombre} ({$reportador->cedula})\n";
        $mensaje .= "🎯 Reportado: {$reportado->nombre} ({$reportado->cedula})\n";
        $mensaje .= "📋 Motivo: {$motivo}\n";
        $mensaje .= "📝 Tipo: {$report->tipo_reportado}\n\n";
        $mensaje .= "Descripción:\n{$report->descripcion}\n\n";
        
        if ($report->evidencias && count($report->evidencias) > 0) {
            $mensaje .= "📎 Evidencias: " . count($report->evidencias) . " archivo(s)\n\n";
        }

        $mensaje .= "Revisa el reporte en el panel de administración.";

        return $this->enviarMensaje($adminPhone, $mensaje);
    }

    /**
     * Notificar al usuario sobre actualización de su reporte
     */
    public function notificarActualizacionReporte($report, $accion)
    {
        $usuario = $report->reportador;
        
        if (!$usuario->telefono) {
            Log::warning("Usuario {$usuario->id} no tiene teléfono registrado");
            return false;
        }

        $mensaje = "📢 *ACTUALIZACIÓN DE REPORTE #{$report->id}*\n\n";
        $mensaje .= "Estado: *" . strtoupper($report->estado) . "*\n\n";

        switch ($report->estado) {
            case 'en_revision':
                $mensaje .= "Tu reporte está siendo revisado por nuestro equipo. Te notificaremos cuando tengamos una respuesta.\n\n";
                break;

            case 'resuelto':
                $mensaje .= "✅ Tu reporte ha sido resuelto.\n\n";
                if ($report->respuesta_admin) {
                    $mensaje .= "Respuesta del administrador:\n{$report->respuesta_admin}\n\n";
                }
                if ($accion && $accion !== 'ninguna') {
                    $mensaje .= "Acción tomada: " . $this->getAccionTexto($accion) . "\n\n";
                }
                break;

            case 'rechazado':
                $mensaje .= "❌ Tu reporte ha sido rechazado.\n\n";
                if ($report->respuesta_admin) {
                    $mensaje .= "Motivo:\n{$report->respuesta_admin}\n\n";
                }
                break;
        }

        $mensaje .= "Gracias por ayudarnos a mantener una comunidad segura.";

        return $this->enviarMensaje($this->formatearNumero($usuario->telefono), $mensaje);
    }

    /**
     * Notificar al reportado sobre acción administrativa
     */
    public function notificarAccionAdministrativa($usuario, $accion, $motivo)
    {
        if (!$usuario->telefono) {
            Log::warning("Usuario {$usuario->id} no tiene teléfono registrado");
            return false;
        }

        $mensaje = "⚠️ *NOTIFICACIÓN ADMINISTRATIVA*\n\n";

        switch ($accion) {
            case 'advertencia':
                $mensaje .= "Has recibido una advertencia oficial.\n\n";
                $mensaje .= "Motivo:\n{$motivo}\n\n";
                $mensaje .= "Por favor, ten en cuenta nuestras políticas de uso para evitar futuras sanciones.";
                break;

            case 'bloqueo_temporal':
                $mensaje .= "🚫 Tu cuenta ha sido bloqueada temporalmente.\n\n";
                $mensaje .= "Motivo:\n{$motivo}\n\n";
                if ($usuario->fecha_desbloqueo) {
                    $fecha = date('d/m/Y H:i', strtotime($usuario->fecha_desbloqueo));
                    $mensaje .= "Tu cuenta será desbloqueada el: {$fecha}\n\n";
                }
                $mensaje .= "Si tienes alguna duda, contacta con soporte.";
                break;

            case 'bloqueo_permanente':
                $mensaje .= "⛔ Tu cuenta ha sido bloqueada permanentemente.\n\n";
                $mensaje .= "Motivo:\n{$motivo}\n\n";
                $mensaje .= "Esta decisión es definitiva debido a violaciones graves de nuestros términos de servicio.";
                break;

            case 'reembolso':
                $mensaje .= "💰 Se ha procesado un reembolso en tu cuenta.\n\n";
                $mensaje .= "Motivo:\n{$motivo}\n\n";
                $mensaje .= "El dinero será acreditado en los próximos días hábiles.";
                break;

            case 'cancelacion_pedido':
                $mensaje .= "❌ Un pedido ha sido cancelado.\n\n";
                $mensaje .= "Motivo:\n{$motivo}\n\n";
                break;
        }

        return $this->enviarMensaje($this->formatearNumero($usuario->telefono), $mensaje);
    }

    /**
     * Enviar mensaje de WhatsApp usando la API
     */
    private function enviarMensaje($numero, $mensaje)
    {
        try {
            $response = Http::withoutVerifying()
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Content-Type' => 'application/json'
                ])->post("{$this->apiUrl}/{$this->phoneNumberId}/messages", [
                    'messaging_product' => 'whatsapp',
                    'to' => $numero,
                    'type' => 'text',
                    'text' => [
                        'body' => $mensaje
                    ]
                ]);

            if ($response->successful()) {
                Log::info("Mensaje WhatsApp enviado exitosamente a {$numero}");
                return true;
            } else {
                Log::error("Error al enviar WhatsApp: " . $response->body());
                return false;
            }
        } catch (\Exception $e) {
            Log::error("Excepción al enviar WhatsApp: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Formatear número de teléfono
     */
    private function formatearNumero($numero)
    {
        // Remover caracteres no numéricos
        $numero = preg_replace('/[^0-9]/', '', $numero);
        
        // Agregar código de país si no tiene
        if (strlen($numero) === 10) {
            $numero = '593' . $numero; // Ecuador
        }
        
        return $numero;
    }

    /**
     * Obtener texto descriptivo del motivo
     */
    private function getMotivoTexto($motivo)
    {
        $motivos = [
            'producto_defectuoso' => 'Producto defectuoso',
            'cobro_indebido' => 'Cobro indebido',
            'incumplimiento_entrega' => 'Incumplimiento de entrega',
            'producto_diferente' => 'Producto diferente al anunciado',
            'comportamiento_inadecuado' => 'Comportamiento inadecuado',
            'fraude_proveedor' => 'Fraude del proveedor',
            'pedido_fraudulento' => 'Pedido fraudulento',
            'pago_no_realizado' => 'Pago no realizado',
            'devolucion_injustificada' => 'Devolución injustificada',
            'abuso_consumidor' => 'Abuso del consumidor',
            'informacion_falsa' => 'Información falsa',
            'otro' => 'Otro'
        ];
        return $motivos[$motivo] ?? $motivo;
    }

    /**
     * Obtener texto de prioridad
     */
    private function getPrioridadTexto($prioridad)
    {
        switch ($prioridad) {
            case 2:
                return '🔴 ALTA';
            case 1:
                return '🟡 MEDIA';
            default:
                return '🟢 BAJA';
        }
    }

    /**
     * Obtener texto de acción
     */
    private function getAccionTexto($accion)
    {
        $acciones = [
            'advertencia' => 'Advertencia oficial',
            'bloqueo_temporal' => 'Bloqueo temporal de cuenta',
            'bloqueo_permanente' => 'Bloqueo permanente de cuenta',
            'reembolso' => 'Reembolso procesado',
            'cancelacion_pedido' => 'Pedido cancelado'
        ];
        return $acciones[$accion] ?? $accion;
    }
}
