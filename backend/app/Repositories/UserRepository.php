<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class UserRepository extends BaseRepository implements UserRepositoryInterface
{
    /** @var list<string> */
    protected array $searchable = ['username', 'email'];

    public function __construct(User $model)
    {
        parent::__construct($model);
    }

    /** {@inheritDoc} */
    public function all(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->newQuery()
            ->with(['roles', 'pegawai']);

        $this->applySearch($query, $filters);
        $this->applyFilters($query, $filters);
        $this->applySort($query, $filters);

        $perPage = min((int) ($filters['per_page'] ?? $perPage), 100);

        return $query->paginate($perPage);
    }

    /** {@inheritDoc} */
    public function findByUsername(string $username): ?User
    {
        return $this->model->where('username', $username)->first();
    }

    /** {@inheritDoc} */
    public function findByEmail(string $email): ?User
    {
        return $this->model->where('email', $email)->first();
    }

    /**
     * Override to also search on pegawai.nama.
     */
    protected function applySearch(Builder $query, array $filters): void
    {
        $search = $filters['search'] ?? null;

        if ($search) {
            $lowerSearch = strtolower($search);
            $query->where(function (Builder $q) use ($lowerSearch) {
                foreach ($this->searchable as $column) {
                    $q->orWhereRaw("LOWER({$column}) LIKE ?", ["%{$lowerSearch}%"]);
                }
                $q->orWhereHas('pegawai', function (Builder $pq) use ($lowerSearch) {
                    $pq->whereRaw('LOWER(nama) LIKE ?', ["%{$lowerSearch}%"]);
                });
            });
        }
    }
}
