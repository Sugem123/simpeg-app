<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dokumen\StoreDokumenRequest;
use App\Http\Requests\Dokumen\UpdateDokumenRequest;
use App\Services\DokumenService;
use App\Traits\ApiResponse;
use App\Traits\ScopesIndividuData;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DokumenController extends Controller
{
    use ApiResponse;
    use ScopesIndividuData;

    public function __construct(private readonly DokumenService $dokumenService) {}

    /**
     * GET /pegawai/{pegawaiId}/dokumen
     */
    public function getByPegawai(Request $request, string $pegawaiId): JsonResponse
    {
        $this->ensureOwnPegawai($pegawaiId);

        $dokumen = $this->dokumenService->getDokumenByPegawai($pegawaiId, $request->all());

        return $this->paginated($dokumen, 'Dokumen pegawai berhasil diambil.');
    }

    /**
     * POST /pegawai/{pegawaiId}/dokumen
     *
     * Individu hanya boleh mengunggah dokumen untuk dirinya sendiri.
     */
    public function store(StoreDokumenRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($this->isIndividuOnly()) {
            $data['pegawai_id'] = $this->ownPegawaiId();
        }

        $dokumen = $this->dokumenService->uploadDokumen(
            $data,
            $request->file('file'),
        );

        return $this->success($dokumen, 'Dokumen berhasil diunggah.', 201);
    }

    /**
     * GET /dokumen/{id}
     */
    public function show(string $id): JsonResponse
    {
        $this->ensureOwnDokumen($id);

        $dokumen = $this->dokumenService->downloadDokumen($id);

        return $this->success($dokumen, 'Detail dokumen berhasil diambil.');
    }

    /**
     * POST /dokumen/{id} (POST for file upload support)
     */
    public function update(UpdateDokumenRequest $request, string $id): JsonResponse
    {
        $this->ensureOwnDokumen($id);

        $dokumen = $this->dokumenService->updateDokumen(
            $id,
            $request->validated(),
            $request->file('file'),
        );

        return $this->success($dokumen, 'Dokumen berhasil diperbarui.');
    }

    /**
     * DELETE /dokumen/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $this->ensureOwnDokumen($id);

        $this->dokumenService->deleteDokumen($id);

        return $this->success(null, 'Dokumen berhasil dihapus.');
    }

    /**
     * GET /dokumen/{id}/download
     */
    public function download(string $id): StreamedResponse
    {
        $this->ensureOwnDokumen($id);

        $dokumen = $this->dokumenService->downloadDokumen($id);
        $disk    = $this->dokumenService->resolveDisk($dokumen->path);

        return Storage::disk($disk)->download(
            $dokumen->path,
            $dokumen->nama_file,
            ['Content-Type' => $dokumen->mime_type],
        );
    }

    /**
     * GET /dokumen/{id}/preview — Serve file with inline Content-Disposition for browser preview.
     */
    public function preview(string $id): StreamedResponse
    {
        $this->ensureOwnDokumen($id);

        $dokumen = $this->dokumenService->downloadDokumen($id);
        $disk    = $this->dokumenService->resolveDisk($dokumen->path);

        return Storage::disk($disk)->response(
            $dokumen->path,
            $dokumen->nama_file,
            [
                'Content-Type' => $dokumen->mime_type ?? 'application/octet-stream',
                'Content-Disposition' => 'inline; filename="' . addslashes($dokumen->nama_file) . '"',
            ],
        );
    }
}
