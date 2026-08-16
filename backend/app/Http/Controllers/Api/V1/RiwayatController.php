<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Riwayat\StoreRiwayatRequest;
use App\Services\RiwayatService;
use App\Traits\ApiResponse;
use App\Traits\ScopesIndividuData;
use Illuminate\Http\JsonResponse;

class RiwayatController extends Controller
{
    use ApiResponse;
    use ScopesIndividuData;

    public function __construct(private readonly RiwayatService $riwayatService) {}

    /**
     * GET /pegawai/{pegawaiId}/riwayat/{type}
     */
    public function index(string $pegawaiId, string $type): JsonResponse
    {
        $this->ensureOwnPegawai($pegawaiId);

        $data = $this->riwayatService->getRiwayatByPegawai($pegawaiId, $type);

        return $this->success($data, "Riwayat {$type} berhasil diambil.");
    }

    /**
     * POST /pegawai/{pegawaiId}/riwayat/{type}
     */
    public function store(StoreRiwayatRequest $request, string $pegawaiId, string $type): JsonResponse
    {
        $this->ensureOwnPegawai($pegawaiId);

        $data = $request->validated();
        $data['pegawai_id'] = $this->isIndividuOnly()
            ? $this->ownPegawaiId()
            : $pegawaiId;

        $record = $this->riwayatService->createRiwayat($type, $data);

        return $this->success($record, "Riwayat {$type} berhasil ditambahkan.", 201);
    }

    /**
     * PATCH /pegawai/{pegawaiId}/riwayat/{type}/{id}
     */
    public function update(StoreRiwayatRequest $request, string $pegawaiId, string $type, string $id): JsonResponse
    {
        $this->ensureOwnPegawai($pegawaiId);

        $data = $request->validated();

        $record = $this->riwayatService->updateRiwayat($type, $id, $data);

        return $this->success($record, "Riwayat {$type} berhasil diperbarui.");
    }
}
