<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cuti\ApproveCutiRequest;
use App\Http\Requests\Cuti\StoreCutiRequest;
use App\Http\Requests\Cuti\UpdateCutiRequest;
use App\Services\CutiService;
use App\Traits\ApiResponse;
use App\Traits\ScopesIndividuData;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CutiController extends Controller
{
    use ApiResponse;
    use ScopesIndividuData;

    public function __construct(private readonly CutiService $cutiService) {}

    /**
     * GET /cuti
     *
     * Individu hanya melihat pengajuan cuti miliknya sendiri.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->all();

        if ($this->isIndividuOnly()) {
            $filters['pegawai_id'] = $this->ownPegawaiId();
        }

        $cuti = $this->cutiService->getAllCuti($filters);

        return $this->paginated($cuti, 'Data cuti berhasil diambil.');
    }

    /**
     * GET /cuti/{id}
     */
    public function show(string $id): JsonResponse
    {
        $this->ensureOwnCuti($id);

        $cuti = $this->cutiService->getCuti($id);

        return $this->success($cuti, 'Detail cuti berhasil diambil.');
    }

    /**
     * POST /cuti
     *
     * Individu hanya dapat mengajukan cuti untuk dirinya sendiri.
     */
    public function store(StoreCutiRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($this->isIndividuOnly()) {
            $data['pegawai_id'] = $this->ownPegawaiId();
        }

        $cuti = $this->cutiService->createCuti($data);

        return $this->success($cuti, 'Pengajuan cuti berhasil dibuat.', 201);
    }

    /**
     * PATCH /cuti/{id}
     */
    public function update(UpdateCutiRequest $request, string $id): JsonResponse
    {
        $this->ensureOwnCuti($id);

        $cuti = $this->cutiService->updateCuti($id, $request->validated());

        return $this->success($cuti, 'Data cuti berhasil diperbarui.');
    }

    /**
     * PATCH /cuti/{id}/approve — Super Admin / Fasilitator only.
     */
    public function approve(ApproveCutiRequest $request, string $id): JsonResponse
    {
        abort_if($this->isIndividuOnly(), 403, 'Anda tidak berwenang menyetujui pengajuan cuti.');

        $cuti = $this->cutiService->approveCuti(
            $id,
            auth('api')->id(),
            $request->validated()['catatan_approval'] ?? null,
        );

        return $this->success($cuti, 'Cuti berhasil disetujui.');
    }

    /**
     * PATCH /cuti/{id}/reject — Super Admin / Fasilitator only.
     */
    public function reject(ApproveCutiRequest $request, string $id): JsonResponse
    {
        abort_if($this->isIndividuOnly(), 403, 'Anda tidak berwenang menolak pengajuan cuti.');

        $validated = $request->validated();

        if (empty($validated['catatan_approval'])) {
            return $this->error('Catatan wajib diisi saat menolak cuti.', 422);
        }

        $cuti = $this->cutiService->rejectCuti(
            $id,
            auth('api')->id(),
            $validated['catatan_approval'],
        );

        return $this->success($cuti, 'Cuti berhasil ditolak.');
    }
}
