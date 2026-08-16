<?php

namespace App\Services;

use App\Models\RiwayatDiklat;
use App\Models\RiwayatJabatan;
use App\Models\RiwayatKgb;
use App\Models\RiwayatMutasi;
use App\Models\RiwayatPangkat;
use App\Models\RiwayatPendidikan;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class RiwayatService
{
    public function __construct(
        private readonly AuditService $auditService,
    ) {}

    /**
     * Map type string to Model class.
     *
     * @return class-string<Model>
     */
    protected function resolveModel(string $type): string
    {
        $map = [
            'jabatan'    => RiwayatJabatan::class,
            'pangkat'    => RiwayatPangkat::class,
            'pendidikan' => RiwayatPendidikan::class,
            'kgb'        => RiwayatKgb::class,
            'diklat'     => RiwayatDiklat::class,
            'mutasi'     => RiwayatMutasi::class,
        ];

        if (! isset($map[$type])) {
            throw new NotFoundHttpException("Tipe riwayat '{$type}' tidak valid.");
        }

        return $map[$type];
    }

    /**
     * Get riwayat records for a pegawai by type.
     *
     * @return Collection<int, Model>
     */
    public function getRiwayatByPegawai(string $pegawaiId, string $type): Collection
    {
        $modelClass = $this->resolveModel($type);

        return $modelClass::where('pegawai_id', $pegawaiId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Create a new riwayat record.
     *
     * @param  array<string, mixed>  $data
     */
    public function createRiwayat(string $type, array $data): Model
    {
        $modelClass = $this->resolveModel($type);

        /** @var Model $record */
        $record = $modelClass::create($data);

        $this->auditService->log(
            auth('api')->id(),
            'create',
            "riwayat_{$type}",
            "Created riwayat {$type} for pegawai: {$data['pegawai_id']}",
        );

        return $record->fresh();
    }

    /**
     * Update an existing riwayat record.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateRiwayat(string $type, string $id, array $data): Model
    {
        $modelClass = $this->resolveModel($type);

        /** @var Model $record */
        $record = $modelClass::findOrFail($id);
        $record->update($data);

        $this->auditService->log(
            auth('api')->id(),
            'update',
            "riwayat_{$type}",
            "Updated riwayat {$type}: {$id}",
        );

        return $record->fresh();
    }
}
