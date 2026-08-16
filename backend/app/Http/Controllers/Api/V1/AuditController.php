<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    use ApiResponse;

    /**
     * GET /audit
     */
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::with('user');

        if (! empty($request->query('user_id'))) {
            $query->where('user_id', $request->query('user_id'));
        }

        if (! empty($request->query('modul'))) {
            $query->where('modul', $request->query('modul'));
        }

        if (! empty($request->query('aksi'))) {
            $query->where('aksi', $request->query('aksi'));
        }

        if (! empty($request->query('tanggal_dari'))) {
            $query->where('created_at', '>=', $request->query('tanggal_dari'));
        }

        if (! empty($request->query('tanggal_sampai'))) {
            $query->where('created_at', '<=', $request->query('tanggal_sampai') . ' 23:59:59');
        }

        if (! empty($request->query('search'))) {
            $search = $request->query('search');
            $query->where('deskripsi', 'ilike', "%{$search}%");
        }

        $query->orderBy('created_at', 'desc');

        $perPage = min((int) ($request->query('per_page', 20)), 100);

        $logs = $query->paginate($perPage);

        return $this->paginated($logs, 'Audit log berhasil diambil.');
    }

    /**
     * GET /audit/{id}
     */
    public function show(string $id): JsonResponse
    {
        $log = AuditLog::with('user')->findOrFail($id);

        return $this->success($log, 'Detail audit log berhasil diambil.');
    }
}
