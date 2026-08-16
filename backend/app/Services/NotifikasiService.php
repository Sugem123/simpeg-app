<?php

namespace App\Services;

use App\Models\Notifikasi;
use Illuminate\Pagination\LengthAwarePaginator;

class NotifikasiService
{
    /**
     * Get notifications for a user (paginated).
     *
     * @param  array<string, mixed>  $filters
     */
    public function getByUser(string $userId, array $filters = []): LengthAwarePaginator
    {
        $query = Notifikasi::where('user_id', $userId);

        if (isset($filters['is_read'])) {
            $query->where('is_read', filter_var($filters['is_read'], FILTER_VALIDATE_BOOLEAN));
        }

        if (! empty($filters['jenis'])) {
            $query->where('jenis', $filters['jenis']);
        }

        $query->orderBy('created_at', 'desc');

        $perPage = min((int) ($filters['per_page'] ?? 20), 100);

        return $query->paginate($perPage);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(string $id): Notifikasi
    {
        $notifikasi = Notifikasi::findOrFail($id);

        $notifikasi->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return $notifikasi->fresh();
    }

    /**
     * Mark all notifications as read for a user.
     */
    public function markAllAsRead(string $userId): int
    {
        return Notifikasi::where('user_id', $userId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }

    /**
     * Create a new notification.
     *
     * @param  array<string, mixed>|null  $data
     */
    public function createNotifikasi(
        string $userId,
        string $judul,
        string $pesan,
        string $jenis,
        ?array $data = null,
    ): Notifikasi {
        return Notifikasi::create([
            'user_id' => $userId,
            'judul'   => $judul,
            'pesan'   => $pesan,
            'jenis'   => $jenis,
            'is_read' => false,
            'data'    => $data,
        ]);
    }

    /**
     * Get unread notification count for a user.
     */
    public function getUnreadCount(string $userId): int
    {
        return Notifikasi::where('user_id', $userId)
            ->where('is_read', false)
            ->count();
    }
}
