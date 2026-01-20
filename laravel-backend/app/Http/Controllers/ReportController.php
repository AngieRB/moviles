<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ReportController extends Controller
{
    // Crear un nuevo reporte
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reportado_id' => 'nullable|exists:users,id',
            'producto_id' => 'nullable|exists:productos,id',
            'pedido_id' => 'nullable|exists:pedidos,id',
            'tipo_reportado' => 'required|in:usuario,producto,pedido',
            'motivo' => 'required|in:contenido_inapropiado,fraude,producto_falso,mala_calidad,no_entregado,comportamiento_abusivo,spam,otro',
            'descripcion' => 'required|string|max:1000',
            'evidencias.*' => 'nullable|image|mimes:jpeg,png,jpg|max:5120'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Guardar evidencias (fotos)
        $evidenciasUrls = [];
        if ($request->hasFile('evidencias')) {
            foreach ($request->file('evidencias') as $index => $evidencia) {
                $cedula = auth()->user()->cedula;
                $timestamp = now()->timestamp;
                $filename = "{$cedula}_reporte_{$timestamp}_{$index}.jpg";
                $path = $evidencia->storeAs('reportes', $filename, 'public');
                $evidenciasUrls[] = $path;
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
            'evidencias' => $evidenciasUrls,
            'estado' => 'pendiente'
        ]);

        $report->load(['reportador', 'reportado', 'producto', 'pedido']);

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
            'respuesta_admin' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $report = Report::findOrFail($id);
        $report->update([
            'estado' => $request->estado,
            'respuesta_admin' => $request->respuesta_admin,
            'fecha_revision' => now(),
            'revisado_por' => auth()->id()
        ]);

        $report->load(['reportador', 'reportado', 'producto', 'pedido', 'revisor']);

        return response()->json([
            'message' => 'Estado actualizado',
            'report' => $report
        ]);
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
