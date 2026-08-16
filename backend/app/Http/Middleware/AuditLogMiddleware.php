<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Log important API activities to the audit_logs table.
 *
 * Usage: middleware('audit:pegawai') — logs the module name.
 * Only logs mutating requests (POST, PUT, PATCH, DELETE).
 */
class AuditLogMiddleware
{
    /**
     * HTTP methods that are considered mutating and worth logging.
     */
    private const LOGGED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

    public function handle(Request $request, Closure $next, string $module = 'general'): Response
    {
        $response = $next($request);

        // Only log mutating requests that resulted in a successful response.
        if (
            in_array($request->method(), self::LOGGED_METHODS, true)
            && $response->getStatusCode() < 400
            && $request->user()
        ) {
            $this->logActivity($request, $module);
        }

        return $response;
    }

    private function logActivity(Request $request, string $module): void
    {
        $methodActions = [
            'POST'   => 'create',
            'PUT'    => 'update',
            'PATCH'  => 'update',
            'DELETE' => 'delete',
        ];

        $aksi = $methodActions[$request->method()] ?? $request->method();

        AuditLog::create([
            'user_id'    => $request->user()->id,
            'aksi'       => $aksi,
            'modul'      => $module,
            'deskripsi'  => sprintf('%s %s', $request->method(), $request->path()),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata'   => [
                'method'     => $request->method(),
                'url'        => $request->fullUrl(),
                'route'      => $request->route()?->getName(),
                'params'     => $request->route()?->parameters(),
            ],
            'created_at' => now(),
        ]);
    }
}
