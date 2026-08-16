<?php

namespace App\Services;

use App\Models\AktivitasLogin;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
        private readonly AuditService $auditService,
    ) {}

    /**
     * Authenticate by username + password and return JWT tokens.
     *
     * @param  array{username: string, password: string}  $credentials
     * @return array{access_token: string, token_type: string, expires_in: int, user: User}|null
     */
    public function login(array $credentials): ?array
    {
        $token = auth('api')->attempt($credentials);

        if (! $token) {
            return null;
        }

        /** @var User $user */
        $user = auth('api')->user();

        if (! $user->is_active) {
            auth('api')->logout();

            return null;
        }

        // Record login activity.
        AktivitasLogin::create([
            'user_id'    => $user->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'login_at'   => now(),
        ]);

        // Update last_login_at on User.
        $user->update(['last_login_at' => now()]);

        $this->auditService->log($user->id, 'login', 'auth', 'User logged in');

        return $this->respondWithToken($token, $user);
    }

    /**
     * Invalidate the current JWT and record logout.
     */
    public function logout(): void
    {
        /** @var User $user */
        $user = auth('api')->user();

        // Mark most recent login activity as logged-out.
        AktivitasLogin::where('user_id', $user->id)
            ->whereNull('logout_at')
            ->latest('login_at')
            ->first()
            ?->update(['logout_at' => now()]);

        $this->auditService->log($user->id, 'logout', 'auth', 'User logged out');

        auth('api')->logout();
    }

    /**
     * Refresh the current JWT.
     *
     * @return array{access_token: string, token_type: string, expires_in: int}
     */
    public function refresh(): array
    {
        $token = auth('api')->refresh();

        return [
            'access_token' => $token,
            'token_type'   => 'bearer',
            'expires_in'   => auth('api')->factory()->getTTL() * 60,
        ];
    }

    /**
     * Get the authenticated user with roles and pegawai data.
     */
    public function me(): User
    {
        /** @var User $user */
        $user = auth('api')->user();
        $user->load(['roles.permissions', 'pegawai']);

        return $user;
    }

    /**
     * Change password for the given user.
     */
    public function changePassword(User $user, string $currentPassword, string $newPassword): bool
    {
        if (! Hash::check($currentPassword, $user->password)) {
            return false;
        }

        $user->update([
            'password'             => $newPassword,
            'must_change_password' => false,
        ]);

        $this->auditService->log($user->id, 'change_password', 'auth', 'User changed password');

        return true;
    }

    /**
     * Format token response payload.
     *
     * @return array{access_token: string, token_type: string, expires_in: int, user: User}
     */
    private function respondWithToken(string $token, User $user): array
    {
        $user->load(['roles.permissions', 'pegawai']);

        return [
            'access_token' => $token,
            'token_type'   => 'bearer',
            'expires_in'   => auth('api')->factory()->getTTL() * 60,
            'user'         => $user,
        ];
    }
}
