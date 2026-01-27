<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use App\Services\ImageService;
use App\Services\WhatsAppService;

class ReportController extends Controller
{
    protected $imageService;
    protected $whatsappService;

    public function __construct(ImageService $imageService, WhatsAppService $whatsappService)
    {
        $this->imageService = $imageService;
        $this->whatsappService = $whatsappService;
    }

    // Crear un nuevo reporte
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reportado_id' => 'nullable|exists:users,id',
            'producto_id' => 'nullable|exists:productos,id',
            'pedido_id' => 'nullable|exists:pedidos,id',
            'tipo_reportado' => 'required|in:usuario,producto,pedido',
            'motivo' => 'required|in:producto_defectuoso,cobro_indebido,incumplimiento_entrega,producto_diferente,comportamiento_inadecuado,fraude_proveedor,pedido_fraudulento,pago_no_realizado,devolucion_injustificada,abuso_consumidor,informacion_falsa,otro',
            'descripcion' => 'required|string|max:1000',
            'evidencias.*' => 'nullable|image|mimes:jpeg,png,jpg|max:5120'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Calcular prioridad según tipo de motivo
        $motivosAlta = ['fraude_proveedor', 'pedido_fraudulento', 'cobro_indebido'];
        $motivosMedia = ['producto_defectuoso', 'incumplimiento_entrega', 'pago_no_realizado'];
        
        $prioridad = in_array($request->motivo, $motivosAlta) ? 2 : 
                    (in_array($request->motivo, $motivosMedia) ? 1 : 0);

        // Guardar evidencias con ImageService
        $evidenciasUrls = [];
        if ($request->hasFile('evidencias')) {
            $cedula = auth()->user()->cedula;
            $directorio = "reportes/{$cedula}";
            
            // Crear directorio si no existe
            if (!Storage::disk('public')->exists($directorio)) {
                Storage::disk('public')->makeDirectory($directorio);
            }
            
            foreach ($request->file('evidencias') as $index => $evidencia) {
                try {
                    $timestamp = now()->timestamp;
                    $filename = "reporte_{$timestamp}_{$index}." . $evidencia->getClientOriginalExtension();
                    $path = $evidencia->storeAs($directorio, $filename, 'public');
                    $evidenciasUrls[] = $path;
                } catch (\Exception $e) {
                    // Si falla una evidencia, continuar con las demás
                    continue;
                }
            }
        }

        $report = Report::create([
            'reportador_id' => auth()->id(),
            'reportado_id' => $request->reportado_id,
            'producto_id' => $request->producto_id,
            'pedido_id' => $request->pedido_id,
            'tipo_reportado' => $request->tipo_reportado,
            'motivo' => $request->motivo,
            'descripcion' => $request->descripcion,
            'prioridad' => $prioridad,
            'evidencias' => $evidenciasUrls,
            'estado' => 'pendiente'
        ]);

        $report->load(['reportador', 'reportado', 'producto', 'pedido']);

        // Enviar notificación de WhatsApp al admin
        try {
            $this->whatsappService->notificarNuevoReporte($report);
        } catch (\Exception $e) {
            Log::error('Error al enviar notificación WhatsApp: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Reporte creado exitosamente',
            'report' => $report
        ], 201);
    }

    // Listar todos los reportes (solo admin)
    public function index(Request $request)
    {
        if (auth()->user()->role !== 'administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $query = Report::with(['reportador', 'reportado', 'producto', 'pedido', 'revisor'])
            ->orderBy('created_at', 'desc');

        // Filtros
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->has('tipo_reportado')) {
            $query->where('tipo_reportado', $request->tipo_reportado);
        }

        if ($request->has('motivo')) {
            $query->where('motivo', $request->motivo);
        }

        $reports = $query->paginate(20);

        return response()->json($reports);
    }

    // Ver detalle de un reporte
    public function show($id)
    {
        $report = Report::with(['reportador', 'reportado', 'producto', 'pedido', 'revisor'])->findOrFail($id);

        // Solo el reportador o admin pueden ver
        if (auth()->user()->role !== 'administrador' && $report->reportador_id !== auth()->id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json($report);
    }

    // Actualizar estado de reporte (solo admin)
    public function updateEstado(Request $request, $id)
    {
        if (auth()->user()->role !== 'administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $validator = Validator::make($request->all(), [
            'estado' => 'required|in:pendiente,en_revision,resuelto,rechazado',
            'respuesta_admin' => 'nullable|string|max:1000',
            'accion_admin' => 'nullable|in:ninguna,advertencia,bloqueo_temporal,bloqueo_permanente,reembolso,cancelacion_pedido'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $report = Report::findOrFail($id);
        
        // Registrar acción en historial
        $historial = is_array($report->historial_acciones) ? $report->historial_acciones : (json_decode($report->historial_acciones, true) ?? []);
        $nuevaAccion = [
            'admin_id' => auth()->id(),
            'admin_nombre' => auth()->user()->nombre,
            'accion' => $request->accion_admin ?? 'ninguna',
            'estado' => $request->estado,
            'respuesta' => $request->respuesta_admin,
            'fecha' => now()->toDateTimeString()
        ];
        $historial[] = $nuevaAccion;
        
        $report->update([
            'estado' => $request->estado,
            'respuesta_admin' => $request->respuesta_admin,
            'accion_admin' => $request->accion_admin ?? 'ninguna',
            'historial_acciones' => json_encode($historial),
            'fecha_revision' => now(),
            'revisado_por' => auth()->id()
        ]);

        // Ejecutar acción administrativa si se especificó
        if ($request->accion_admin && $request->accion_admin !== 'ninguna') {
            $this->ejecutarAccionAdmin($report, $request->accion_admin, $request->respuesta_admin);
        }

        // Enviar notificaciones de WhatsApp
        try {
            // Notificar al reportador
            $this->whatsappService->notificarActualizacionReporte($report, $request->accion_admin);
            
            // Si hay acción admin, notificar también al reportado
            if ($request->accion_admin && $request->accion_admin !== 'ninguna') {
                $reportado = User::find($report->reportado_id);
                if ($reportado) {
                    $this->whatsappService->notificarAccionAdministrativa(
                        $reportado,
                        $request->accion_admin,
                        $request->respuesta_admin
                    );
                }
            }
        } catch (\Exception $e) {
            Log::error('Error al enviar notificaciones WhatsApp: ' . $e->getMessage());
        }

        $report->load(['reportador', 'reportado', 'producto', 'pedido', 'revisor']);

        return response()->json([
            'message' => 'Estado actualizado',
            'report' => $report
        ]);
    }

    // Ejecutar acciones administrativas
    private function ejecutarAccionAdmin($report, $accion, $motivo)
    {
        $reportado = User::find($report->reportado_id);
        
        if (!$reportado) {
            return;
        }

        switch ($accion) {
            case 'advertencia':
                // Registrar advertencia en el usuario
                $advertencias = json_decode($reportado->advertencias ?? '[]', true);
                $advertencias[] = [
                    'reporte_id' => $report->id,
                    'motivo' => $motivo,
                    'fecha' => now()->toDateTimeString(),
                    'admin_id' => auth()->id()
                ];
                $reportado->update(['advertencias' => json_encode($advertencias)]);
                break;

            case 'bloqueo_temporal':
                $reportado->update([
                    'bloqueado' => true,
                    'tipo_bloqueo' => 'temporal',
                    'motivo_bloqueo' => $motivo,
                    'fecha_bloqueo' => now(),
                    'fecha_desbloqueo' => now()->addDays(7), // 7 días por defecto
                    'bloqueado_por' => auth()->id()
                ]);
                break;

            case 'bloqueo_permanente':
                $reportado->update([
                    'bloqueado' => true,
                    'tipo_bloqueo' => 'permanente',
                    'motivo_bloqueo' => $motivo,
                    'fecha_bloqueo' => now(),
                    'fecha_desbloqueo' => null,
                    'bloqueado_por' => auth()->id()
                ]);
                break;

            case 'reembolso':
                // Aquí se implementaría lógica de reembolso según el sistema de pago
                // Por ahora solo registramos en el historial
                break;

            case 'cancelacion_pedido':
                // Cancelar pedido si existe
                if ($report->pedido_id) {
                    $pedido = \App\Models\Pedido::find($report->pedido_id);
                    if ($pedido) {
                        $pedido->update([
                            'estado' => 'cancelado',
                            'motivo_cancelacion' => $motivo,
                            'cancelado_por' => auth()->id()
                        ]);
                    }
                }
                break;
        }
    }

    // Mis reportes (reportes creados por el usuario autenticado)
    public function misReportes()
    {
        $reports = Report::with(['reportado', 'producto', 'pedido'])
            ->where('reportador_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($reports);
    }

    // Bloquear/Desbloquear usuario (solo admin)
    public function toggleBloqueo(Request $request, $userId)
    {
        if (auth()->user()->role !== 'administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $validator = Validator::make($request->all(), [
            'bloquear' => 'required|boolean',
            'tipo_bloqueo' => 'required_if:bloquear,true|in:temporal,permanente',
            'motivo_bloqueo' => 'required_if:bloquear,true|string|max:500',
            'dias_bloqueo' => 'required_if:tipo_bloqueo,temporal|integer|min:1|max:365'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::findOrFail($userId);

        if ($request->bloquear) {
            $fechaDesbloqueo = null;
            if ($request->tipo_bloqueo === 'temporal') {
                $fechaDesbloqueo = Carbon::now()->addDays($request->dias_bloqueo);
            }

            $user->update([
                'bloqueado' => true,
                'tipo_bloqueo' => $request->tipo_bloqueo,
                'motivo_bloqueo' => $request->motivo_bloqueo,
                'fecha_bloqueo' => now(),
                'fecha_desbloqueo' => $fechaDesbloqueo,
                'bloqueado_por' => auth()->id()
            ]);

            $mensaje = $request->tipo_bloqueo === 'permanente'
                ? 'Usuario bloqueado permanentemente'
                : "Usuario bloqueado por {$request->dias_bloqueo} días";
        } else {
            $user->update([
                'bloqueado' => false,
                'tipo_bloqueo' => null,
                'motivo_bloqueo' => null,
                'fecha_bloqueo' => null,
                'fecha_desbloqueo' => null,
                'bloqueado_por' => null
            ]);

            $mensaje = 'Usuario desbloqueado';
        }

        return response()->json([
            'message' => $mensaje,
            'user' => $user
        ]);
    }
}
