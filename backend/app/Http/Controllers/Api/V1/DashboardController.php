<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\StatusCuti;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Cuti;
use App\Models\Dokumen;
use App\Models\Pegawai;
use App\Models\Surat;
use App\Traits\ApiResponse;
use App\Traits\ScopesIndividuData;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    use ApiResponse;
    use ScopesIndividuData;

    /**
     * GET /dashboard
     *
     * Return aggregate statistics, charts, and activity feeds for the dashboard.
     * Individu users only receive a personal summary (12-BUSINESS-RULES:
     * "Individu hanya melihat ringkasan miliknya").
     */
    public function index(): JsonResponse
    {
        if ($this->isIndividuOnly()) {
            return $this->individuDashboard();
        }

        // ─── Core counts ─────────────────────────────────────────
        $totalPegawai = Pegawai::count();
        $pegawaiAktif = Pegawai::where('status_aktif', true)->count();

        // ─── Grouped distributions ───────────────────────────────
        $byJenisPegawai = Pegawai::query()
            ->join('jenis_pegawai', 'pegawai.jenis_pegawai_id', '=', 'jenis_pegawai.id')
            ->selectRaw('jenis_pegawai.nama as label, count(*) as value')
            ->groupBy('jenis_pegawai.nama')
            ->orderByDesc('value')
            ->get();

        $byStatusKepegawaian = Pegawai::query()
            ->join('status_kepegawaian', 'pegawai.status_kepegawaian_id', '=', 'status_kepegawaian.id')
            ->selectRaw('status_kepegawaian.nama as label, count(*) as value')
            ->groupBy('status_kepegawaian.nama')
            ->orderByDesc('value')
            ->get();

        $byJenisKelamin = Pegawai::query()
            ->selectRaw('jenis_kelamin as label, count(*) as value')
            ->groupBy('jenis_kelamin')
            ->get()
            ->map(fn ($row) => [
                'label' => $row->label === 'L' ? 'Laki-laki' : 'Perempuan',
                'value' => (int) $row->value,
            ]);

        $byGolongan = Pegawai::query()
            ->join('golongan', 'pegawai.golongan_id', '=', 'golongan.id')
            ->selectRaw('golongan.kode as label, count(*) as value')
            ->groupBy('golongan.kode')
            ->orderBy('label')
            ->get();

        // ─── Cumulative growth (last 6 months) ───────────────────
        $growth = collect();
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $growth->push([
                'label' => $month->locale('id')->translatedFormat('M'),
                'value' => Pegawai::where('created_at', '<=', $month->copy()->endOfMonth())->count(),
            ]);
        }

        // ─── KPI helpers ─────────────────────────────────────────
        $countByNama = fn ($collection, string $nama) =>
            (int) ($collection->firstWhere('label', $nama)->value ?? 0);

        $stats = [
            'total_pegawai'       => $totalPegawai,
            'pegawai_aktif'       => $pegawaiAktif,
            'pegawai_tidak_aktif' => $totalPegawai - $pegawaiAktif,
            'total_guru'          => $countByNama($byJenisPegawai, 'Guru'),
            'total_staf'          => $countByNama($byJenisPegawai, 'Staf'),
            'total_pns'           => $countByNama($byStatusKepegawaian, 'PNS'),
            'total_pppk'          => $countByNama($byStatusKepegawaian, 'PPPK'),
            'total_gtt'           => $countByNama($byStatusKepegawaian, 'GTT'),
            'total_ptt'           => $countByNama($byStatusKepegawaian, 'PTT'),
            'total_dokumen'       => Dokumen::count(),
            'total_surat'         => Surat::count(),
            'cuti_menunggu'       => Cuti::where('status', StatusCuti::MENUNGGU)->count(),
            'pegawai_baru_bulan_ini' => Pegawai::whereYear('created_at', now()->year)
                ->whereMonth('created_at', now()->month)
                ->count(),
        ];

        // ─── Recent activities (audit log) ───────────────────────
        $recentActivities = AuditLog::with('user')
            ->orderByDesc('created_at')
            ->limit(8)
            ->get()
            ->map(fn (AuditLog $log) => [
                'id'          => $log->id,
                'description' => $log->deskripsi ?? ($log->aksi . ' ' . $log->modul),
                'user'        => $log->user?->username ?? 'Sistem',
                'modul'       => $log->modul,
                'aksi'        => $log->aksi,
                'timestamp'   => $log->created_at?->toIso8601String(),
            ]);

        // ─── Pending leave requests ──────────────────────────────
        $cutiMenunggu = Cuti::with('pegawai:id,nama')
            ->where('status', StatusCuti::MENUNGGU)
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn (Cuti $cuti) => [
                'id'              => $cuti->id,
                'pegawai'         => $cuti->pegawai?->nama ?? '-',
                'jenis_cuti'      => $cuti->jenis_cuti?->label() ?? '-',
                'tanggal_mulai'   => $cuti->tanggal_mulai?->toDateString(),
                'tanggal_selesai' => $cuti->tanggal_selesai?->toDateString(),
            ]);

        // ─── Birthdays this month ────────────────────────────────
        $ultahBulanIni = Pegawai::query()
            ->whereNotNull('tanggal_lahir')
            ->whereMonth('tanggal_lahir', now()->month)
            ->orderByRaw($this->dayOrderExpression())
            ->limit(5)
            ->get(['id', 'nama', 'tanggal_lahir'])
            ->map(fn (Pegawai $p) => [
                'id'            => $p->id,
                'nama'          => $p->nama,
                'tanggal_lahir' => $p->tanggal_lahir?->toDateString(),
            ]);

        return $this->success([
            'stats'                     => $stats,
            'chart_status_kepegawaian'  => $byStatusKepegawaian,
            'chart_jenis_pegawai'       => $byJenisPegawai,
            'chart_jenis_kelamin'       => $byJenisKelamin,
            'chart_golongan'            => $byGolongan,
            'chart_pertumbuhan'         => $growth,
            'recent_activities'         => $recentActivities,
            'cuti_menunggu'             => $cutiMenunggu,
            'ultah_bulan_ini'           => $ultahBulanIni,
        ], 'Data dashboard berhasil diambil.');
    }

    /**
     * Personal dashboard payload for Individu (self-service) users.
     */
    private function individuDashboard(): JsonResponse
    {
        $ownId = (string) $this->ownPegawaiId();

        $pegawai = Pegawai::with([
            'agama:id,nama',
            'jenisPegawai:id,nama',
            'statusKepegawaian:id,nama',
            'jabatan:id,nama',
            'pangkat:id,nama',
            'golongan:id,kode,nama',
            'unitKerja:id,nama',
        ])->find($ownId);

        $totalDokumen = Dokumen::where('pegawai_id', $ownId)->count();
        $totalSurat   = Surat::where('pegawai_id', $ownId)->count();
        $cutiMenunggu = Cuti::where('pegawai_id', $ownId)
            ->where('status', StatusCuti::MENUNGGU)
            ->count();
        $cutiDisetujuiTahunIni = Cuti::where('pegawai_id', $ownId)
            ->where('status', StatusCuti::DISETUJUI)
            ->whereYear('created_at', now()->year)
            ->count();

        $cutiTerdekat = Cuti::where('pegawai_id', $ownId)
            ->whereIn('status', [StatusCuti::MENUNGGU, StatusCuti::DISETUJUI])
            ->orderBy('tanggal_mulai')
            ->limit(5)
            ->get()
            ->map(fn (Cuti $cuti) => [
                'id'              => $cuti->id,
                'jenis_cuti'      => $cuti->jenis_cuti?->label() ?? '-',
                'status'          => $cuti->status?->label() ?? '-',
                'tanggal_mulai'   => $cuti->tanggal_mulai?->toDateString(),
                'tanggal_selesai' => $cuti->tanggal_selesai?->toDateString(),
            ]);

        $ultahBulanIni = collect();
        if ($pegawai && $pegawai->tanggal_lahir && $pegawai->tanggal_lahir->month === now()->month) {
            $ultahBulanIni = collect([[
                'id'            => $pegawai->id,
                'nama'          => $pegawai->nama,
                'tanggal_lahir' => $pegawai->tanggal_lahir?->toDateString(),
            ]]);
        }

        return $this->success([
            'scope'             => 'individu',
            'pegawai'           => $pegawai,
            'stats'             => [
                'total_dokumen'            => $totalDokumen,
                'total_surat'              => $totalSurat,
                'cuti_menunggu'            => $cutiMenunggu,
                'cuti_disetujui_tahun_ini' => $cutiDisetujuiTahunIni,
            ],
            'cuti_terdekat'     => $cutiTerdekat,
            'ultah_bulan_ini'   => $ultahBulanIni,
        ], 'Ringkasan berhasil diambil.');
    }

    /**
     * DB-agnostic "order by day of month" expression.
     */
    private function dayOrderExpression(): string
    {
        return match (config('database.default')) {
            'sqlite'  => "strftime('%d', tanggal_lahir)",
            'pgsql'   => "EXTRACT(DAY FROM tanggal_lahir)",
            default   => 'DAY(tanggal_lahir)',
        };
    }
}
