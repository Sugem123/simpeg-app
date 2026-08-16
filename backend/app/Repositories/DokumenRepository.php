<?php

namespace App\Repositories;

use App\Models\Dokumen;
use App\Repositories\Contracts\DokumenRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class DokumenRepository extends BaseRepository implements DokumenRepositoryInterface
{
    /** @var list<string> */
    protected array $searchable = ['nama_file', 'keterangan'];

    /**
     * Relations to eager-load.
     *
     * @var list<string>
     */
    protected array $eagerLoad = ['pegawai', 'uploader'];

    public function __construct(Dokumen $model)
    {
        parent::__construct($model);
    }

    /** {@inheritDoc} */
    public function all(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->newQuery()
            ->with($this->eagerLoad);

        $this->applySearch($query, $filters);
        $this->applyFilters($query, $filters);
        $this->applySort($query, $filters);

        $perPage = min((int) ($filters['per_page'] ?? $perPage), 100);

        return $query->paginate($perPage);
    }

    /** {@inheritDoc} */
    public function findOrFail(string $id): Dokumen
    {
        return $this->model->with($this->eagerLoad)->findOrFail($id);
    }

    /** {@inheritDoc} */
    public function getByPegawai(string $pegawaiId, array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->newQuery()
            ->with($this->eagerLoad)
            ->where('pegawai_id', $pegawaiId);

        $this->applySearch($query, $filters);

        if (! empty($filters['kategori'])) {
            $query->where('kategori', $filters['kategori']);
        }

        $this->applySort($query, $filters);

        $perPage = min((int) ($filters['per_page'] ?? 20), 100);

        return $query->paginate($perPage);
    }

    /** {@inheritDoc} */
    public function getByKategori(string $pegawaiId, string $kategori): Collection
    {
        return $this->model->newQuery()
            ->with($this->eagerLoad)
            ->where('pegawai_id', $pegawaiId)
            ->where('kategori', $kategori)
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
