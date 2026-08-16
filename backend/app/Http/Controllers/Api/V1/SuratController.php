<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Surat\StoreSuratRequest;
use App\Services\SuratService;
use App\Traits\ApiResponse;
use App\Traits\ScopesIndividuData;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SuratController extends Controller
{
    use ApiResponse;
    use ScopesIndividuData;

    public function __construct(private readonly SuratService $suratService) {}

    /**
     * GET /surat
     *
     * Individu hanya melihat surat miliknya sendiri (11-PERMISSION-MATRIX: "View Own").
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->all();

        if ($this->isIndividuOnly()) {
            $filters['pegawai_id'] = $this->ownPegawaiId();
        }

        $surat = $this->suratService->getAllSurat($filters);

        return $this->paginated($surat, 'Data surat berhasil diambil.');
    }

    /**
     * GET /surat/{id}
     */
    public function show(string $id): JsonResponse
    {
        $this->ensureOwnSurat($id);

        $surat = $this->suratService->getSurat($id);

        return $this->success($surat, 'Detail surat berhasil diambil.');
    }

    /**
     * POST /surat — Super Admin / Fasilitator only.
     */
    public function store(StoreSuratRequest $request): JsonResponse
    {
        abort_if($this->isIndividuOnly(), 403, 'Anda tidak berwenang membuat surat.');

        $surat = $this->suratService->createSurat(
            $request->safe()->except('file_pdf'),
            $request->file('file_pdf'),
        );

        return $this->success($surat, 'Surat berhasil ditambahkan.', 201);
    }

    /**
     * PATCH /surat/{id} — Super Admin / Fasilitator only.
     */
    public function update(StoreSuratRequest $request, string $id): JsonResponse
    {
        abort_if($this->isIndividuOnly(), 403, 'Anda tidak berwenang memperbarui surat.');

        $surat = $this->suratService->updateSurat(
            $id,
            $request->safe()->except('file_pdf'),
            $request->file('file_pdf'),
        );

        return $this->success($surat, 'Surat berhasil diperbarui.');
    }

    /**
     * DELETE /surat/{id} — Super Admin / Fasilitator only.
     */
    public function destroy(string $id): JsonResponse
    {
        abort_if($this->isIndividuOnly(), 403, 'Anda tidak berwenang menghapus surat.');

        $this->suratService->deleteSurat($id);

        return $this->success(null, 'Surat berhasil dihapus.');
    }

    /**
     * GET /surat/{id}/download
     */
    public function download(string $id): StreamedResponse
    {
        $this->ensureOwnSurat($id);

        $surat = $this->suratService->downloadSurat($id);

        return Storage::disk('local')->download(
            $surat->file_pdf,
            "surat_{$surat->nomor}.pdf",
            ['Content-Type' => 'application/pdf'],
        );
    }
}
