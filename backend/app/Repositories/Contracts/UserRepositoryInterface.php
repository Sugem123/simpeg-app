<?php

namespace App\Repositories\Contracts;

use App\Models\User;

interface UserRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find a user by username.
     */
    public function findByUsername(string $username): ?User;

    /**
     * Find a user by email.
     */
    public function findByEmail(string $email): ?User;
}
