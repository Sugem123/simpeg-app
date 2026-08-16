<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\StoreMasterRequest;
use App\Services\MasterDataService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MasterDataController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly MasterDataService $masterDataService) {}

    /**
     * GET /master/{type}
     */
    public function index(Request $request, string $type): JsonResponse
    {
        $data = $this->masterDataService->getAll($type, $request->all());

        return $this->paginated($data, "Data {$type} berhasil diambil.");
    }

    /**
     * GET /master/{type}/{id}
     */
    public function show(string $type, string $id): JsonResponse
    {
        $record = $this->masterDataService->getById($type, $id);

        return $this->success($record, "Detail {$type} berhasil diambil.");
    }

    /**
     * POST /master/{type}
     */
    public function store(StoreMasterRequest $request, string $type): JsonResponse
    {
        $record = $this->masterDataService->create($type, $request->validated());

        return $this->success($record, "Data {$type} berhasil ditambahkan.", 201);
    }

    /**
     * PATCH /master/{type}/{id}
     */
    public function update(StoreMasterRequest $request, string $type, string $id): JsonResponse
    {
        $record = $this->masterDataService->update($type, $id, $request->validated());

        return $this->success($record, "Data {$type} berhasil diperbarui.");
    }

    /**
     * DELETE /master/{type}/{id}
     */
    public function destroy(string $type, string $id): JsonResponse
    {
        $this->masterDataService->delete($type, $id);

        return $this->success(null, "Data {$type} berhasil dihapus.");
    }
}
