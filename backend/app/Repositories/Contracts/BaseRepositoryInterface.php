<?php

namespace App\Repositories\Contracts;

use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

interface BaseRepositoryInterface
{
    /**
     * Get all records with optional filtering, search, and pagination.
     *
     * @param  array<string, mixed>  $filters
     */
    public function all(array $filters = [], int $perPage = 20): LengthAwarePaginator;

    /**
     * Find a single record by UUID.
     */
    public function find(string $id): ?Model;

    /**
     * Find a record by UUID or throw ModelNotFoundException.
     */
    public function findOrFail(string $id): Model;

    /**
     * Create a new record.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Model;

    /**
     * Update an existing record by UUID.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(string $id, array $data): Model;

    /**
     * Delete a record by UUID.
     */
    public function delete(string $id): bool;
}
