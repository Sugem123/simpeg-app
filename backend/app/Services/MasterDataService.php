<?php

namespace App\Services;

use App\Repositories\MasterRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Generic CRUD service for all master-data tables.
 *
 * Resolves the correct Eloquent model from a slug (e.g. "agama", "unit-kerja")
 * and delegates to MasterRepository.
 */
class MasterDataService
{
    /**
     * Map of URL slug → fully-qualified model class.
     *
     * @var array<string, class-string<Model>>
     */
    private const MODEL_MAP = [
        'agama'               => \App\Models\Agama::class,
        'jenis-pegawai'       => \App\Models\JenisPegawai::class,
        'status-kepegawaian'  => \App\Models\StatusKepegawaian::class,
        'jabatan'             => \App\Models\Jabatan::class,
        'pangkat'             => \App\Models\Pangkat::class,
        'golongan'            => \App\Models\Golongan::class,
        'unit-kerja'          => \App\Models\UnitKerja::class,
        'mata-pelajaran'      => \App\Models\MataPelajaran::class,
        'pendidikan'          => \App\Models\Pendidikan::class,
    ];

    public function __construct(private readonly AuditService $auditService) {}

    /**
     * Resolve a master slug to a repository instance.
     */
    public function resolveRepository(string $type): MasterRepository
    {
        $modelClass = self::MODEL_MAP[$type] ?? null;

        if (! $modelClass) {
            abort(404, "Master data '{$type}' tidak ditemukan.");
        }

        return new MasterRepository(new $modelClass());
    }

    /**
     * Get all records for the given master type (paginated).
     *
     * @param  array<string, mixed>  $filters
     */
    public function getAll(string $type, array $filters = []): LengthAwarePaginator
    {
        return $this->resolveRepository($type)->all($filters);
    }

    /**
     * Get a single record by UUID.
     */
    public function getById(string $type, string $id): Model
    {
        return $this->resolveRepository($type)->findOrFail($id);
    }

    /**
     * Create a new master record.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(string $type, array $data): Model
    {
        $record = $this->resolveRepository($type)->create($data);

        $this->auditService->log(
            auth('api')->id(),
            'create',
            "master.{$type}",
            "Created {$type}: " . ($data['nama'] ?? $data['jenjang'] ?? $data['kode'] ?? $record->id),
        );

        return $record;
    }

    /**
     * Update an existing master record.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(string $type, string $id, array $data): Model
    {
        $record = $this->resolveRepository($type)->update($id, $data);

        $this->auditService->log(
            auth('api')->id(),
            'update',
            "master.{$type}",
            "Updated {$type}: {$id}",
        );

        return $record;
    }

    /**
     * Delete a master record.
     *
     * Checks if the record is still referenced by pegawai before deleting.
     */
    public function delete(string $type, string $id): bool
    {
        $repo   = $this->resolveRepository($type);
        $record = $repo->findOrFail($id);

        // Check referential usage — if the model has a `pegawai` relationship.
        if (method_exists($record, 'pegawai') && $record->pegawai()->exists()) {
            abort(409, "Data {$type} ini masih digunakan oleh pegawai dan tidak dapat dihapus.");
        }

        $this->auditService->log(
            auth('api')->id(),
            'delete',
            "master.{$type}",
            "Deleted {$type}: {$id}",
        );

        return $repo->delete($id);
    }

    /**
     * Get the list of supported master-data slugs.
     *
     * @return list<string>
     */
    public static function supportedTypes(): array
    {
        return array_keys(self::MODEL_MAP);
    }
}
