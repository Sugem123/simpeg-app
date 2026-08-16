<?php

namespace App\Services;

use App\Models\Surat;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

class SuratService
{
    public function __construct(
        private readonly AuditService $auditService,
    ) {}

    /**
     * Get all surat (paginated, with filters).
     *
     * @param  array<string, mixed>  $filters
     */
    public function getAllSurat(array $filters = []): LengthAwarePaginator
    {
        $query = Surat::with(['pegawai', 'creator']);

        if (! empty($filters['jenis'])) {
            $query->where('jenis', $filters['jenis']);
        }

        if (! empty($filters['pegawai_id'])) {
            $query->where('pegawai_id', $filters['pegawai_id']);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('nomor', 'ilike', "%{$search}%")
                  ->orWhere('perihal', 'ilike', "%{$search}%");
            });
        }

        $query->orderBy($filters['sort_by'] ?? 'tanggal', $filters['sort_dir'] ?? 'desc');

        $perPage = min((int) ($filters['per_page'] ?? 20), 100);

        return $query->paginate($perPage);
    }

    /**
     * Get a single surat.
     */
    public function getSurat(string $id): Surat
    {
        return Surat::with(['pegawai', 'creator'])->findOrFail($id);
    }

    /**
     * Create a new surat.
     *
     * @param  array<string, mixed>  $data
     */
    public function createSurat(array $data, ?UploadedFile $file = null): Surat
    {
        $data['created_by'] = auth('api')->id();

        if ($file) {
            $path = $file->store('surat', 'local');
            $data['file_pdf'] = $path;
        }

        /** @var Surat $surat */
        $surat = Surat::create($data);

        $this->auditService->log(
            auth('api')->id(),
            'create',
            'surat',
            "Created surat: {$surat->nomor}",
        );

        return $surat->load(['pegawai', 'creator']);
    }

    /**
     * Update an existing surat.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateSurat(string $id, array $data, ?UploadedFile $file = null): Surat
    {
        $surat = Surat::findOrFail($id);

        if ($file) {
            // Delete old file
            if ($surat->file_pdf && Storage::disk('local')->exists($surat->file_pdf)) {
                Storage::disk('local')->delete($surat->file_pdf);
            }

            $path = $file->store('surat', 'local');
            $data['file_pdf'] = $path;
        }

        $surat->update($data);

        $this->auditService->log(
            auth('api')->id(),
            'update',
            'surat',
            "Updated surat: {$surat->nomor}",
        );

        return $surat->fresh()->load(['pegawai', 'creator']);
    }

    /**
     * Soft-delete a surat.
     */
    public function deleteSurat(string $id): bool
    {
        $surat = Surat::findOrFail($id);

        $this->auditService->log(
            auth('api')->id(),
            'delete',
            'surat',
            "Deleted surat: {$surat->nomor}",
        );

        return (bool) $surat->delete();
    }

    /**
     * Get surat for download.
     */
    public function downloadSurat(string $id): Surat
    {
        $surat = Surat::findOrFail($id);

        if (! $surat->file_pdf || ! Storage::disk('local')->exists($surat->file_pdf)) {
            abort(404, 'File PDF tidak ditemukan.');
        }

        return $surat;
    }
}
