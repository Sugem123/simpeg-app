<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pegawai\StorePegawaiRequest;
use App\Http\Requests\Pegawai\UpdatePegawaiRequest;
use App\Services\PegawaiService;
use App\Traits\ApiResponse;
use App\Traits\ScopesIndividuData;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class PegawaiController extends Controller
{
    use ApiResponse;
    use ScopesIndividuData;

    /**
     * Fields an Individu (self-service) user is allowed to change on their own record.
     * Structural / HR-managed fields (NIP, jabatan, pangkat, golongan, status, dll.)
     * are intentionally excluded.
     *
     * @var array<int, string>
     */
    private const INDIVIDU_EDITABLE_FIELDS = [
        'nik',
        'nip',
        'nuptk',
        'nama',
        'gelar_depan',
        'gelar_belakang',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'agama_id',
        'email',
        'no_hp',
        'alamat',
        'foto',
    ];

    public function __construct(private readonly PegawaiService $pegawaiService) {}

    /**
     * GET /pegawai
     *
     * Individu users only see their own record (11-PERMISSION-MATRIX: "Own").
     */
    public function index(Request $request): JsonResponse
    {
        if ($this->isIndividuOnly()) {
            $own = $this->pegawaiService->getPegawai((string) $this->ownPegawaiId());
            $perPage = min((int) $request->query('per_page', 20), 100);
            $paginated = new LengthAwarePaginator(collect([$own]), 1, $perPage, 1);

            return $this->paginated($paginated, 'Data pegawai berhasil diambil.');
        }

        $pegawai = $this->pegawaiService->getAllPegawai($request->all());

        return $this->paginated($pegawai, 'Data pegawai berhasil diambil.');
    }

    /**
     * GET /pegawai/{id}
     */
    public function show(string $id): JsonResponse
    {
        $this->ensureOwnPegawai($id);

        $pegawai = $this->pegawaiService->getPegawai($id);

        return $this->success($pegawai, 'Detail pegawai berhasil diambil.');
    }

    /**
     * POST /pegawai — Super Admin / Fasilitator only.
     */
    public function store(StorePegawaiRequest $request): JsonResponse
    {
        abort_if($this->isIndividuOnly(), 403, 'Anda tidak berwenang menambah data pegawai.');

        $pegawai = $this->pegawaiService->createPegawai($request->validated());

        return $this->success($pegawai, 'Pegawai berhasil ditambahkan.', 201);
    }

    /**
     * PATCH /pegawai/{id}
     *
     * Individu may only update their own record and only the whitelisted fields.
     */
    public function update(UpdatePegawaiRequest $request, string $id): JsonResponse
    {
        $this->ensureOwnPegawai($id);

        $data = $request->validated();

        if ($this->isIndividuOnly()) {
            $existingPegawai = $this->pegawaiService->getPegawai($id);
            if (!empty($existingPegawai->nip)) {
                unset($data['nip']);
            }
            $data = array_intersect_key($data, array_flip(self::INDIVIDU_EDITABLE_FIELDS));
        }

        $pegawai = $this->pegawaiService->updatePegawai($id, $data);

        return $this->success($pegawai, 'Pegawai berhasil diperbarui.');
    }

    /**
     * DELETE /pegawai/{id} — Super Admin / Fasilitator only.
     */
    public function destroy(string $id): JsonResponse
    {
        abort_if($this->isIndividuOnly(), 403, 'Anda tidak berwenang menghapus data pegawai.');

        $this->pegawaiService->deletePegawai($id);

        return $this->success(null, 'Pegawai berhasil dihapus.');
    }

    /**
     * GET /pegawai-search?q=keyword
     */
    public function search(Request $request): JsonResponse
    {
        $keyword = $request->query('q', '');
        $limit   = (int) $request->query('per_page', 20);

        $result = $this->pegawaiService->searchPegawai($keyword, $limit);

        return $this->paginated($result, 'Hasil pencarian pegawai.');
    }

    /**
     * GET /pegawai-without-account
     *
     * Returns pegawai that don't have a user account yet.
     * Used by the "Sync from Pegawai" modal in User Management.
     */
    public function withoutAccount(Request $request): JsonResponse
    {
        $search = $request->query('search', '');
        $perPage = min((int) $request->query('per_page', 20), 100);

        $query = \App\Models\Pegawai::query()
            ->whereDoesntHave('user')
            ->select(['id', 'nip', 'nama', 'gelar_depan', 'gelar_belakang', 'email', 'jenis_kelamin'])
            ->orderBy('nama');

        if ($search) {
            $lowerSearch = strtolower($search);
            $query->whereRaw('LOWER(nama) LIKE ?', ["%{$lowerSearch}%"]);
        }

        $result = $query->paginate($perPage);

        return $this->paginated($result, 'Pegawai tanpa akun berhasil diambil.');
    }
}
