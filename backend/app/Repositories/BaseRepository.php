<?php

namespace App\Repositories;

use App\Repositories\Contracts\BaseRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Generic Eloquent repository implementation.
 *
 * Provides pagination, search (by searchable columns), sorting, and
 * filtering by any fillable column.
 */
class BaseRepository implements BaseRepositoryInterface
{
    /**
     * Columns that support free-text search via `?search=`.
     *
     * Override in child repositories to enable searching.
     *
     * @var list<string>
     */
    protected array $searchable = [];

    public function __construct(protected Model $model) {}

    /** {@inheritDoc} */
    public function all(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->newQuery();

        $this->applySearch($query, $filters);
        $this->applyFilters($query, $filters);
        $this->applySort($query, $filters);

        $perPage = min((int) ($filters['per_page'] ?? $perPage), 100);

        return $query->paginate($perPage);
    }

    /** {@inheritDoc} */
    public function find(string $id): ?Model
    {
        return $this->model->find($id);
    }

    /** {@inheritDoc} */
    public function findOrFail(string $id): Model
    {
        return $this->model->findOrFail($id);
    }

    /** {@inheritDoc} */
    public function create(array $data): Model
    {
        return $this->model->create($data);
    }

    /** {@inheritDoc} */
    public function update(string $id, array $data): Model
    {
        $record = $this->model->findOrFail($id);
        $record->update($data);

        return $record->fresh();
    }

    /** {@inheritDoc} */
    public function delete(string $id): bool
    {
        $record = $this->model->findOrFail($id);

        return (bool) $record->delete();
    }

    // =========================================================================
    // Query Helpers
    // =========================================================================

    /**
     * Apply free-text search across searchable columns.
     */
    protected function applySearch(Builder $query, array $filters): void
    {
        $search = $filters['search'] ?? null;

        if ($search && count($this->searchable) > 0) {
            $lowerSearch = strtolower($search);
            $query->where(function (Builder $q) use ($lowerSearch) {
                foreach ($this->searchable as $column) {
                    $q->orWhereRaw("LOWER({$column}) LIKE ?", ["%{$lowerSearch}%"]);
                }
            });
        }
    }

    /**
     * Apply exact-match filters for fillable columns present in $filters.
     */
    protected function applyFilters(Builder $query, array $filters): void
    {
        $fillable = $this->model->getFillable();

        foreach ($filters as $key => $value) {
            if (
                in_array($key, $fillable, true)
                && ! in_array($key, ['search', 'sort_by', 'sort_dir', 'per_page', 'page'], true)
                && $value !== null
                && $value !== ''
            ) {
                $query->where($key, $value);
            }
        }
    }

    /**
     * Apply column sorting (default: created_at desc).
     */
    protected function applySort(Builder $query, array $filters): void
    {
        $sortBy  = $filters['sort_by'] ?? 'created_at';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        $sortDir = in_array(strtolower($sortDir), ['asc', 'desc'], true) ? $sortDir : 'desc';

        $query->orderBy($sortBy, $sortDir);
    }
}
