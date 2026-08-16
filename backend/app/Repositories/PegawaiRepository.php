<?php

namespace App\Repositories;

use App\Models\Pegawai;
use App\Repositories\Contracts\PegawaiRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class PegawaiRepository extends BaseRepository implements PegawaiRepositoryInterface
{
    /** @var list<string> */
    protected array $searchable = ['nama', 'nip', 'nik', 'email'];

    /**
     * Relations to eager-load on list / detail queries.
     *
     * @var list<string>
     */
    protected array $eagerLoad = [
        'agama',
        'jenisPegawai',
        'statusKepegawaian',
        'jabatan',
        'pangkat',
        'golongan',
        'unitKerja',
    ];

    public function __construct(Pegawai $model)
    {
        parent::__construct($model);
    }

    /** {@inheritDoc} */
    public function all(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->newQuery()
            ->with($this->eagerLoad);

        $this->applySearch($query, $filters);
        $this->applyRelationFilters($query, $filters);
        $this->applyFilters($query, $filters);
        $this->applySort($query, $filters);

        $perPage = min((int) ($filters['per_page'] ?? $perPage), 100);

        return $query->paginate($perPage);
    }

    /** {@inheritDoc} */
    public function findOrFail(string $id): Pegawai
    {
        return $this->model->with($this->eagerLoad)->findOrFail($id);
    }

    /** {@inheritDoc} */
    public function findByNip(string $nip): ?Pegawai
    {
        return $this->model->where('nip', $nip)->first();
    }

    /** {@inheritDoc} */
    public function findByNik(string $nik): ?Pegawai
    {
        return $this->model->where('nik', $nik)->first();
    }

    /** {@inheritDoc} */
    public function search(string $keyword, int $limit = 20): LengthAwarePaginator
    {
        return $this->model->newQuery()
            ->with($this->eagerLoad)
            ->where(function (Builder $q) use ($keyword) {
                foreach ($this->searchable as $col) {
                    $q->orWhere($col, 'ilike', "%{$keyword}%");
                }
            })
            ->orderBy('nama')
            ->paginate($limit);
    }

    /** {@inheritDoc} */
    public function export(array $filters = []): Collection
    {
        $query = $this->model->newQuery()
            ->with($this->eagerLoad);

        $this->applySearch($query, $filters);
        $this->applyRelationFilters($query, $filters);
        $this->applyFilters($query, $filters);
        $this->applySort($query, $filters);

        return $query->get();
    }

    /**
     * Apply relation-based filters (FK columns).
     */
    protected function applyRelationFilters(Builder $query, array $filters): void
    {
        $relationFilters = [
            'status_kepegawaian_id',
            'jabatan_id',
            'unit_kerja_id',
            'jenis_pegawai_id',
            'agama_id',
            'pangkat_id',
            'golongan_id',
        ];

        foreach ($relationFilters as $column) {
            if (! empty($filters[$column])) {
                $query->where($column, $filters[$column]);
            }
        }
    }
}
