<?php

use App\Http\Controllers\Api\V1\AuditController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CutiController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\DokumenController;
use App\Http\Controllers\Api\V1\EmasterSyncController;
use App\Http\Controllers\Api\V1\MasterDataController;
use App\Http\Controllers\Api\V1\NotifikasiController;
use App\Http\Controllers\Api\V1\PegawaiController;
use App\Http\Controllers\Api\V1\PengaturanSekolahController;
use App\Http\Controllers\Api\V1\RiwayatController;
use App\Http\Controllers\Api\V1\SuratController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — /api/v1
|--------------------------------------------------------------------------
|
| The apiPrefix is already set to 'api/v1' in bootstrap/app.php, so all
| routes registered here are automatically prefixed with /api/v1.
|
*/

// =========================================================================
// Public routes
// =========================================================================
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
});

// Public school profile (nama + logo) for landing & login pages
Route::get('sekolah', [PengaturanSekolahController::class, 'index']);

// =========================================================================
// Authenticated routes
// =========================================================================
Route::middleware('auth:api')->group(function () {

    // --- Auth (protected) ------------------------------------------------
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::get('me', [AuthController::class, 'me']);
        Route::post('change-password', [AuthController::class, 'changePassword']);
    });

    // --- Dashboard -------------------------------------------------------
    Route::get('dashboard', [DashboardController::class, 'index']);

    // --- Roles (for user-creation dropdowns) -----------------------------
    Route::get('roles', [UserController::class, 'roles']);

    // --- Users (Super Admin only) ----------------------------------------
    Route::middleware('role:Super Admin')->group(function () {
        Route::post('users/sync-from-pegawai', [UserController::class, 'syncFromPegawai']);
        Route::apiResource('users', UserController::class);
        Route::patch('users/{id}/reset-password', [UserController::class, 'resetPassword']);
        Route::patch('users/{id}/activate', [UserController::class, 'activate']);
        Route::patch('users/{id}/deactivate', [UserController::class, 'deactivate']);
    });

    // --- eMaster Sync (Super Admin only) ----------------------------------
    Route::middleware('role:Super Admin')->group(function () {
        Route::post('emaster/sync', [EmasterSyncController::class, 'sync']);
        Route::post('emaster/sync-batch', [EmasterSyncController::class, 'syncBatch']);
        Route::post('emaster/sync-documents', [EmasterSyncController::class, 'syncDocuments']);
        Route::post('emaster/sync-details', [EmasterSyncController::class, 'syncDetails']);
        Route::post('emaster/sync-all', [EmasterSyncController::class, 'syncAll']);
    });

    // --- Pegawai ----------------------------------------------------------
    Route::apiResource('pegawai', PegawaiController::class);
    Route::get('pegawai-search', [PegawaiController::class, 'search']);
    Route::get('pegawai-without-account', [PegawaiController::class, 'withoutAccount']);

    // --- Master Data ------------------------------------------------------
    Route::prefix('master')->middleware('audit:master')->group(function () {
        Route::get('{type}', [MasterDataController::class, 'index']);
        Route::get('{type}/{id}', [MasterDataController::class, 'show']);
        Route::post('{type}', [MasterDataController::class, 'store']);
        Route::patch('{type}/{id}', [MasterDataController::class, 'update']);
        Route::delete('{type}/{id}', [MasterDataController::class, 'destroy']);
    });

    // --- Dokumen ----------------------------------------------------------
    Route::get('pegawai/{pegawaiId}/dokumen', [DokumenController::class, 'getByPegawai']);
    Route::post('pegawai/{pegawaiId}/dokumen', [DokumenController::class, 'store']);
    Route::get('dokumen/{id}', [DokumenController::class, 'show']);
    Route::post('dokumen/{id}', [DokumenController::class, 'update']); // POST for file upload
    Route::delete('dokumen/{id}', [DokumenController::class, 'destroy']);
    Route::get('dokumen/{id}/download', [DokumenController::class, 'download']);
    Route::get('dokumen/{id}/preview', [DokumenController::class, 'preview']);

    // --- Riwayat ----------------------------------------------------------
    Route::get('pegawai/{pegawaiId}/riwayat/{type}', [RiwayatController::class, 'index']);
    Route::post('pegawai/{pegawaiId}/riwayat/{type}', [RiwayatController::class, 'store']);
    Route::patch('pegawai/{pegawaiId}/riwayat/{type}/{id}', [RiwayatController::class, 'update']);

    // --- Cuti -------------------------------------------------------------
    Route::apiResource('cuti', CutiController::class);
    Route::patch('cuti/{id}/approve', [CutiController::class, 'approve']);
    Route::patch('cuti/{id}/reject', [CutiController::class, 'reject']);

    // --- Surat ------------------------------------------------------------
    Route::apiResource('surat', SuratController::class);
    Route::get('surat/{id}/download', [SuratController::class, 'download']);

    // --- Notifikasi -------------------------------------------------------
    Route::get('notifications', [NotifikasiController::class, 'index']);
    Route::get('notifications/unread-count', [NotifikasiController::class, 'unreadCount']);
    Route::patch('notifications/{id}/read', [NotifikasiController::class, 'markRead']);
    Route::patch('notifications/read-all', [NotifikasiController::class, 'markAllRead']);

    // --- Audit (Super Admin & Fasilitator only) ---------------------------
    Route::middleware('role:Super Admin,Fasilitator')->group(function () {
        Route::get('audit', [AuditController::class, 'index']);
        Route::get('audit/{id}', [AuditController::class, 'show']);
    });

    // --- Pengaturan Sekolah -----------------------------------------------
    Route::get('pengaturan-sekolah', [PengaturanSekolahController::class, 'index']);
    Route::middleware('role:Super Admin')->group(function () {
        Route::match(['put', 'post'], 'pengaturan-sekolah', [PengaturanSekolahController::class, 'update']);
        Route::post('pengaturan-sekolah/logo', [PengaturanSekolahController::class, 'uploadLogo']);
    });
});
