<?php

namespace App\Repositories\Contracts;

use App\Models\Pegawai;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface PegawaiRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find a pegawai by NIP.
     */
    public function findByNip(string $nip): ?Pegawai;

    /**
     * Find a pegawai by NIK.
     */
    public function findByNik(string $nik): ?Pegawai;

    /**
     * Search pegawai by keyword (nama, nip, nik, email).
     */
    public function search(string $keyword, int $limit = 20): LengthAwarePaginator;

    /**
     * Get all pegawai for export (no pagination).
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Pegawai>
     */
    public function export(array $filters = []): Collection;
}
