<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class UserService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
        private readonly AuditService $auditService,
    ) {}

    /**
     * Get all users (paginated).
     *
     * @param  array<string, mixed>  $filters
     */
    public function getAllUsers(array $filters = []): LengthAwarePaginator
    {
        return $this->userRepository->all($filters);
    }

    /**
     * Get a single user by UUID.
     */
    public function getUser(string $id): User
    {
        /** @var User */
        $user = $this->userRepository->findOrFail($id);
        $user->load(['roles', 'pegawai']);

        return $user;
    }

    /**
     * Create a new user with role assignment and hashed password.
     *
     * @param  array<string, mixed>  $data  Must contain role_id.
     */
    public function createUser(array $data): User
    {
        $roleId = $data['role_id'];
        unset($data['role_id']);

        $data['is_active'] = $data['is_active'] ?? true;
        $data['must_change_password'] = $data['must_change_password'] ?? true;

        /** @var User $user */
        $user = $this->userRepository->create($data);
        $user->roles()->attach($roleId);
        $user->load(['roles', 'pegawai']);

        $this->auditService->log(
            auth('api')->id(),
            'create',
            'users',
            "Created user: {$user->username}",
        );

        return $user;
    }

    /**
     * Update an existing user.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateUser(string $id, array $data): User
    {
        $roleId = $data['role_id'] ?? null;
        unset($data['role_id']);

        // Don't allow password update through this method.
        unset($data['password']);

        /** @var User $user */
        $user = $this->userRepository->update($id, $data);

        if ($roleId) {
            $user->roles()->sync([$roleId]);
        }

        $user->load(['roles', 'pegawai']);

        $this->auditService->log(
            auth('api')->id(),
            'update',
            'users',
            "Updated user: {$user->username}",
        );

        return $user;
    }

    /**
     * Delete a user by UUID.
     */
    public function deleteUser(string $id): bool
    {
        $user = $this->userRepository->findOrFail($id);

        $this->auditService->log(
            auth('api')->id(),
            'delete',
            'users',
            "Deleted user: {$user->username}",
        );

        return $this->userRepository->delete($id);
    }

    /**
     * Reset user password to a random string.
     *
     * @return string The new password.
     */
    public function resetPassword(string $id, ?string $newPassword = null): string
    {
        $password = $newPassword !== null && $newPassword !== ''
            ? $newPassword
            : Str::password(16);

        /** @var User $user */
        $user = $this->userRepository->update($id, [
            'password'             => $password,
            'must_change_password' => true,
        ]);

        $this->auditService->log(
            auth('api')->id(),
            'reset_password',
            'users',
            "Reset password for user: {$user->username}",
        );

        return $password;
    }

    /**
     * Activate a user account.
     */
    public function activate(string $id): User
    {
        /** @var User $user */
        $user = $this->userRepository->update($id, ['is_active' => true]);

        $this->auditService->log(
            auth('api')->id(),
            'activate',
            'users',
            "Activated user: {$user->username}",
        );

        return $user->load(['roles', 'pegawai']);
    }

    /**
     * Deactivate a user account.
     */
    public function deactivate(string $id): User
    {
        /** @var User $user */
        $user = $this->userRepository->update($id, ['is_active' => false]);

        $this->auditService->log(
            auth('api')->id(),
            'deactivate',
            'users',
            "Deactivated user: {$user->username}",
        );

        return $user->load(['roles', 'pegawai']);
    }

    /**
     * Create user account synced from pegawai data.
     *
     * @param  array<string, mixed>  $data
     */
    public function syncFromPegawai(array $data): User
    {
        $pegawaiId = $data['pegawai_id'];
        $roleId = $data['role_id'];

        // Check if pegawai already has an account
        $existing = User::where('pegawai_id', $pegawaiId)->first();
        if ($existing) {
            throw new \Exception('Pegawai ini sudah memiliki akun user.');
        }

        // Auto-generate username from pegawai if requested
        if ($data['generate_username'] ?? false) {
            $pegawai = \App\Models\Pegawai::findOrFail($pegawaiId);
            $data['username'] = $this->generateUsernameFromNama($pegawai->nama);
        }

        unset($data['generate_username'], $data['role_id']);

        $data['is_active'] = $data['is_active'] ?? true;
        $data['must_change_password'] = true;

        /** @var User $user */
        $user = $this->userRepository->create($data);
        $user->roles()->attach($roleId);
        $user->load(['roles', 'pegawai']);

        $this->auditService->log(
            auth('api')->id(),
            'sync_from_pegawai',
            'users',
            "Synced user from pegawai: {$user->pegawai->nama} -> {$user->username}",
        );

        return $user;
    }

    /**
     * Generate username from nama (lowercase, remove spaces, add number if needed).
     */
    private function generateUsernameFromNama(string $nama): string
    {
        $base = Str::slug(Str::lower($nama), '');
        $username = $base;
        $counter = 1;

        while (User::where('username', $username)->exists()) {
            $username = $base . $counter;
            $counter++;
        }

        return $username;
    }
}
