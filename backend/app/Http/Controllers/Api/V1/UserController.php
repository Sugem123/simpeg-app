<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Models\Role;
use App\Services\UserService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly UserService $userService) {}

    /**
     * GET /users
     */
    public function index(Request $request): JsonResponse
    {
        $users = $this->userService->getAllUsers($request->all());

        return $this->paginated($users, 'Data user berhasil diambil.');
    }

    /**
     * GET /users/{id}
     */
    public function show(string $id): JsonResponse
    {
        $user = $this->userService->getUser($id);

        return $this->success($user, 'Detail user berhasil diambil.');
    }

    /**
     * POST /users
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->userService->createUser($request->validated());

        return $this->success($user, 'User berhasil dibuat.', 201);
    }

    /**
     * PATCH /users/{id}
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = $this->userService->updateUser($id, $request->all());

        return $this->success($user, 'User berhasil diperbarui.');
    }

    /**
     * DELETE /users/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $this->userService->deleteUser($id);

        return $this->success(null, 'User berhasil dihapus.');
    }

    /**
     * PATCH /users/{id}/reset-password
     */
    public function resetPassword(\App\Http\Requests\User\ResetPasswordRequest $request, string $id): JsonResponse
    {
        $this->userService->resetPassword($id, $request->validated('new_password'));

        return $this->success(null, 'Password berhasil direset.');
    }

    /**
     * PATCH /users/{id}/activate
     */
    public function activate(string $id): JsonResponse
    {
        $user = $this->userService->activate($id);

        return $this->success($user, 'User berhasil diaktifkan.');
    }

    /**
     * PATCH /users/{id}/deactivate
     */
    public function deactivate(string $id): JsonResponse
    {
        $user = $this->userService->deactivate($id);

        return $this->success($user, 'User berhasil dinonaktifkan.');
    }

    /**
     * POST /users/sync-from-pegawai
     *
     * Create a user account synced from a pegawai record.
     */
    public function syncFromPegawai(\App\Http\Requests\User\SyncFromPegawaiRequest $request): JsonResponse
    {
        try {
            $user = $this->userService->syncFromPegawai($request->validated());

            return $this->success($user, 'User berhasil disinkronkan dari data pegawai.', 201);
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    /**
     * GET /roles
     *
     * Return all roles for user-creation/select dropdowns.
     */
    public function roles(): JsonResponse
    {
        $roles = Role::select('id', 'nama', 'deskripsi')
            ->orderBy('nama')
            ->get();

        return $this->success($roles, 'Daftar role berhasil diambil.');
    }
}
