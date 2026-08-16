<?php

namespace App\Services;

use App\Models\Cuti;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class CutiService
{
    public function __construct(
        private readonly AuditService $auditService,
    ) {}

    /**
     * Get all cuti (paginated, with filters).
     *
     * @param  array<string, mixed>  $filters
     */
    public function getAllCuti(array $filters = []): LengthAwarePaginator
    {
        $query = Cuti::with(['pegawai', 'approver']);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['jenis_cuti'])) {
            $query->where('jenis_cuti', $filters['jenis_cuti']);
        }

        if (! empty($filters['pegawai_id'])) {
            $query->where('pegawai_id', $filters['pegawai_id']);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('pegawai', function ($q) use ($search) {
                $q->where('nama', 'ilike', "%{$search}%");
            });
        }

        $query->orderBy($filters['sort_by'] ?? 'created_at', $filters['sort_dir'] ?? 'desc');

        $perPage = min((int) ($filters['per_page'] ?? 20), 100);

        return $query->paginate($perPage);
    }

    /**
     * Get cuti by pegawai.
     *
     * @return Collection<int, Cuti>
     */
    public function getCutiByPegawai(string $pegawaiId): Collection
    {
        return Cuti::with(['pegawai', 'approver'])
            ->where('pegawai_id', $pegawaiId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get a single cuti record.
     */
    public function getCuti(string $id): Cuti
    {
        return Cuti::with(['pegawai', 'approver'])->findOrFail($id);
    }

    /**
     * Create a new cuti request.
     *
     * @param  array<string, mixed>  $data
     */
    public function createCuti(array $data): Cuti
    {
        $data['status'] = 'menunggu';

        /** @var Cuti $cuti */
        $cuti = Cuti::create($data);

        $this->auditService->log(
            auth('api')->id(),
            'create',
            'cuti',
            "Created cuti request for pegawai: {$cuti->pegawai_id}",
        );

        return $cuti->load(['pegawai', 'approver']);
    }

    /**
     * Update an existing cuti request (only if status is draft or menunggu).
     *
     * @param  array<string, mixed>  $data
     */
    public function updateCuti(string $id, array $data): Cuti
    {
        $cuti = Cuti::findOrFail($id);

        if (! in_array($cuti->status->value, ['draft', 'menunggu'], true)) {
            throw new UnprocessableEntityHttpException('Cuti yang sudah diproses tidak dapat diubah.');
        }

        $cuti->update($data);

        $this->auditService->log(
            auth('api')->id(),
            'update',
            'cuti',
            "Updated cuti request: {$id}",
        );

        return $cuti->fresh()->load(['pegawai', 'approver']);
    }

    /**
     * Approve a cuti request.
     */
    public function approveCuti(string $id, string $approverId, ?string $catatan = null): Cuti
    {
        $cuti = Cuti::findOrFail($id);

        if ($cuti->status->value !== 'menunggu') {
            throw new UnprocessableEntityHttpException('Hanya cuti dengan status menunggu yang dapat disetujui.');
        }

        $cuti->update([
            'status'            => 'disetujui',
            'approved_by'       => $approverId,
            'approved_at'       => now(),
            'catatan_approval'  => $catatan,
        ]);

        $this->auditService->log(
            $approverId,
            'approve',
            'cuti',
            "Approved cuti request: {$id}",
        );

        return $cuti->fresh()->load(['pegawai', 'approver']);
    }

    /**
     * Reject a cuti request.
     */
    public function rejectCuti(string $id, string $approverId, string $catatan): Cuti
    {
        $cuti = Cuti::findOrFail($id);

        if ($cuti->status->value !== 'menunggu') {
            throw new UnprocessableEntityHttpException('Hanya cuti dengan status menunggu yang dapat ditolak.');
        }

        $cuti->update([
            'status'            => 'ditolak',
            'approved_by'       => $approverId,
            'approved_at'       => now(),
            'catatan_approval'  => $catatan,
        ]);

        $this->auditService->log(
            $approverId,
            'reject',
            'cuti',
            "Rejected cuti request: {$id}",
        );

        return $cuti->fresh()->load(['pegawai', 'approver']);
    }
}
