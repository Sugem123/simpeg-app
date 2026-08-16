<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface DokumenRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Get documents for a specific pegawai.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getByPegawai(string $pegawaiId, array $filters = []): LengthAwarePaginator;

    /**
     * Get documents by pegawai and kategori.
     *
     * @return Collection<int, \App\Models\Dokumen>
     */
    public function getByKategori(string $pegawaiId, string $kategori): Collection;
}
