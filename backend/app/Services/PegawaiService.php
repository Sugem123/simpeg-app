<?php

namespace App\Services;

use App\Models\Pegawai;
use App\Repositories\Contracts\PegawaiRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class PegawaiService
{
    public function __construct(
        private readonly PegawaiRepositoryInterface $pegawaiRepository,
        private readonly AuditService $auditService,
    ) {}

    /**
     * Get all pegawai (paginated, with filters).
     *
     * @param  array<string, mixed>  $filters
     */
    public function getAllPegawai(array $filters = []): LengthAwarePaginator
    {
        return $this->pegawaiRepository->all($filters);
    }

    /**
     * Get a single pegawai by UUID.
     */
    public function getPegawai(string $id): Pegawai
    {
        return $this->pegawaiRepository->findOrFail($id);
    }

    /**
     * Create a new pegawai record.
     *
     * @param  array<string, mixed>  $data
     */
    public function createPegawai(array $data): Pegawai
    {
        $data['status_aktif'] = $data['status_aktif'] ?? true;

        /** @var Pegawai $pegawai */
        $pegawai = $this->pegawaiRepository->create($data);

        $this->auditService->log(
            auth('api')->id(),
            'create',
            'pegawai',
            "Created pegawai: {$pegawai->nama}",
        );

        return $this->pegawaiRepository->findOrFail($pegawai->id);
    }

    /**
     * Update an existing pegawai record.
     *
     * @param  array<string, mixed>  $data
     */
    public function updatePegawai(string $id, array $data): Pegawai
    {
        /** @var Pegawai $pegawai */
        $pegawai = $this->pegawaiRepository->update($id, $data);

        $this->auditService->log(
            auth('api')->id(),
            'update',
            'pegawai',
            "Updated pegawai: {$pegawai->nama}",
        );

        return $this->pegawaiRepository->findOrFail($pegawai->id);
    }

    /**
     * Soft-delete a pegawai record.
     */
    public function deletePegawai(string $id): bool
    {
        $pegawai = $this->pegawaiRepository->findOrFail($id);

        $this->auditService->log(
            auth('api')->id(),
            'delete',
            'pegawai',
            "Deleted pegawai: {$pegawai->nama}",
        );

        return $this->pegawaiRepository->delete($id);
    }

    /**
     * Search pegawai by keyword.
     */
    public function searchPegawai(string $keyword, int $limit = 20): LengthAwarePaginator
    {
        return $this->pegawaiRepository->search($keyword, $limit);
    }

    /**
     * Get all pegawai for export (no pagination).
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Pegawai>
     */
    public function exportPegawai(array $filters = []): Collection
    {
        return $this->pegawaiRepository->export($filters);
    }
}
