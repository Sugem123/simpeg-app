<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\NotifikasiService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotifikasiController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly NotifikasiService $notifikasiService) {}

    /**
     * GET /notifications
     */
    public function index(Request $request): JsonResponse
    {
        $userId = auth('api')->id();

        $notifications = $this->notifikasiService->getByUser($userId, $request->all());

        return $this->paginated($notifications, 'Notifikasi berhasil diambil.');
    }

    /**
     * PATCH /notifications/{id}/read
     */
    public function markRead(string $id): JsonResponse
    {
        $notifikasi = $this->notifikasiService->markAsRead($id);

        return $this->success($notifikasi, 'Notifikasi ditandai sebagai dibaca.');
    }

    /**
     * PATCH /notifications/read-all
     */
    public function markAllRead(): JsonResponse
    {
        $userId = auth('api')->id();

        $count = $this->notifikasiService->markAllAsRead($userId);

        return $this->success(
            ['updated_count' => $count],
            'Semua notifikasi ditandai sebagai dibaca.',
        );
    }

    /**
     * GET /notifications/unread-count
     */
    public function unreadCount(): JsonResponse
    {
        $userId = auth('api')->id();

        $count = $this->notifikasiService->getUnreadCount($userId);

        return $this->success(
            ['unread_count' => $count],
            'Jumlah notifikasi belum dibaca.',
        );
    }
}
