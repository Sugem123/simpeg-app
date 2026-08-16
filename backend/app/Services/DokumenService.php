<?php

namespace App\Services;

use App\Models\Dokumen;
use App\Repositories\Contracts\DokumenRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

class DokumenService
{
    public function __construct(
        private readonly DokumenRepositoryInterface $dokumenRepository,
        private readonly AuditService $auditService,
    ) {}

    /**
     * Resolve the filesystem disk for a dokumen path.
     * eMaster documents use 'public' disk, user-uploaded use 'local'.
     */
    public function resolveDisk(string $path): string
    {
        return str_starts_with($path, 'dokumen-emaster/') ? 'public' : 'local';
    }

    /**
     * Get all dokumen (paginated, with filters).
     *
     * @param  array<string, mixed>  $filters
     */
    public function getAllDokumen(array $filters = []): LengthAwarePaginator
    {
        return $this->dokumenRepository->all($filters);
    }

    /**
     * Get dokumen by pegawai.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getDokumenByPegawai(string $pegawaiId, array $filters = []): LengthAwarePaginator
    {
        return $this->dokumenRepository->getByPegawai($pegawaiId, $filters);
    }

    /**
     * Upload a new dokumen.
     *
     * @param  array<string, mixed>  $data
     */
    public function uploadDokumen(array $data, UploadedFile $file): Dokumen
    {
        $pegawaiId = $data['pegawai_id'];
        $kategori  = $data['kategori'];

        $directory = "dokumen/{$pegawaiId}/{$kategori}";
        $path      = $file->store($directory, 'local');

        /** @var Dokumen $dokumen */
        $dokumen = $this->dokumenRepository->create([
            'pegawai_id'  => $pegawaiId,
            'kategori'    => $kategori,
            'nama_file'   => $file->getClientOriginalName(),
            'path'        => $path,
            'mime_type'   => $file->getClientMimeType(),
            'ukuran'      => $file->getSize(),
            'uploaded_by' => auth('api')->id(),
            'keterangan'  => $data['keterangan'] ?? null,
        ]);

        $this->auditService->log(
            auth('api')->id(),
            'create',
            'dokumen',
            "Uploaded dokumen: {$dokumen->nama_file}",
        );

        return $this->dokumenRepository->findOrFail($dokumen->id);
    }

    /**
     * Update an existing dokumen.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateDokumen(string $id, array $data, ?UploadedFile $file = null): Dokumen
    {
        $dokumen = $this->dokumenRepository->findOrFail($id);

        $updateData = array_filter([
            'kategori'   => $data['kategori'] ?? null,
            'keterangan' => array_key_exists('keterangan', $data) ? $data['keterangan'] : null,
        ], fn ($value) => $value !== null);

        if ($file) {
            // Delete old file using resolved disk
            if ($dokumen->path) {
                $oldDisk = $this->resolveDisk($dokumen->path);
                if (Storage::disk($oldDisk)->exists($dokumen->path)) {
                    Storage::disk($oldDisk)->delete($dokumen->path);
                }
            }

            $kategori  = $data['kategori'] ?? $dokumen->kategori->value;
            $directory = "dokumen/{$dokumen->pegawai_id}/{$kategori}";
            $path      = $file->store($directory, 'local');

            $updateData['nama_file']  = $file->getClientOriginalName();
            $updateData['path']       = $path;
            $updateData['mime_type']  = $file->getClientMimeType();
            $updateData['ukuran']     = $file->getSize();
        }

        /** @var Dokumen $updated */
        $updated = $this->dokumenRepository->update($id, $updateData);

        $this->auditService->log(
            auth('api')->id(),
            'update',
            'dokumen',
            "Updated dokumen: {$updated->nama_file}",
        );

        return $this->dokumenRepository->findOrFail($updated->id);
    }

    /**
     * Soft-delete a dokumen.
     */
    public function deleteDokumen(string $id): bool
    {
        $dokumen = $this->dokumenRepository->findOrFail($id);

        $this->auditService->log(
            auth('api')->id(),
            'delete',
            'dokumen',
            "Deleted dokumen: {$dokumen->nama_file}",
        );

        return $this->dokumenRepository->delete($id);
    }

    /**
     * Get file path for download.
     */
    public function downloadDokumen(string $id): Dokumen
    {
        $dokumen = $this->dokumenRepository->findOrFail($id);
        $disk    = $this->resolveDisk($dokumen->path);

        if (! Storage::disk($disk)->exists($dokumen->path)) {
            abort(404, 'File tidak ditemukan di storage.');
        }

        return $dokumen;
    }
}
