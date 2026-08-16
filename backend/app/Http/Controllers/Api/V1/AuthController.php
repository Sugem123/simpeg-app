<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\AuthService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly AuthService $authService) {}

    /**
     * POST /auth/login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->validated());

        if (! $result) {
            return $this->error('Username atau password salah.', 401);
        }

        return $this->success($result, 'Login berhasil.');
    }

    /**
     * POST /auth/logout
     */
    public function logout(): JsonResponse
    {
        $this->authService->logout();

        return $this->success(null, 'Logout berhasil.');
    }

    /**
     * POST /auth/refresh
     */
    public function refresh(): JsonResponse
    {
        $result = $this->authService->refresh();

        return $this->success($result, 'Token berhasil diperbarui.');
    }

    /**
     * GET /auth/me
     */
    public function me(): JsonResponse
    {
        $user = $this->authService->me();

        return $this->success($user, 'Data user berhasil diambil.');
    }

    /**
     * POST /auth/change-password
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $changed = $this->authService->changePassword(
            $request->user(),
            $request->validated('current_password'),
            $request->validated('password'),
        );

        if (! $changed) {
            return $this->error('Password saat ini tidak cocok.', 422);
        }

        return $this->success(null, 'Password berhasil diubah.');
    }
}
