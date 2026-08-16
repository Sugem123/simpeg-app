<?php

namespace App\Traits;

use App\Models\Cuti;
use App\Models\Dokumen;
use App\Models\Pegawai;
use App\Models\Surat;
use App\Models\User;

/**
 * Scopes data access for the "Individu" role (self-service).
 *
 * A user is considered an "Individu only" user when they hold the
 * Individu role and do NOT hold Super Admin or Fasilitator roles.
 * Such users may only read/write data belonging to their own pegawai
 * record (see 11-PERMISSION-MATRIX.md / 12-BUSINESS-RULES: "Individu
 * hanya mengakses data miliknya sendiri").
 *
 * Super Admin and Fasilitator bypass every ownership restriction.
 */
trait ScopesIndividuData
{
    protected function authUser(): ?User
    {
        /** @var ?User */
        return auth('api')->user();
    }

    /**
     * True when the authenticated user is a pure Individu (self-service) user.
     */
    protected function isIndividuOnly(): bool
    {
        $user = $this->authUser();

        if (! $user) {
            return false;
        }

        return $user->hasRole('Individu')
            && ! $user->hasRole('Super Admin')
            && ! $user->hasRole('Fasilitator');
    }

    protected function ownPegawaiId(): ?string
    {
        return $this->authUser()?->pegawai_id;
    }

    /**
     * Abort with 403 unless the given pegawai id belongs to the current user.
     * No-op for admin/fasilitator users.
     */
    protected function ensureOwnPegawai(?string $pegawaiId): void
    {
        if (! $this->isIndividuOnly()) {
            return;
        }

        if ($pegawaiId !== $this->ownPegawaiId()) {
            abort(403, 'Anda hanya dapat mengakses data milik Anda sendiri.');
        }
    }

    /**
     * Abort with 403 when an Individu tries to access a pegawai they do not own.
     */
    protected function ensureOwnPegawaiRecord(?Pegawai $pegawai): void
    {
        if (! $this->isIndividuOnly()) {
            return;
        }

        if (! $pegawai || $pegawai->id !== $this->ownPegawaiId()) {
            abort(403, 'Anda hanya dapat mengakses data milik Anda sendiri.');
        }
    }

    protected function ensureOwnDokumen(string $dokumenId): void
    {
        if (! $this->isIndividuOnly()) {
            return;
        }

        $dokumen = Dokumen::find($dokumenId);
        if (! $dokumen || $dokumen->pegawai_id !== $this->ownPegawaiId()) {
            abort(403, 'Anda hanya dapat mengakses dokumen milik Anda sendiri.');
        }
    }

    protected function ensureOwnCuti(string $cutiId): void
    {
        if (! $this->isIndividuOnly()) {
            return;
        }

        $cuti = Cuti::find($cutiId);
        if (! $cuti || $cuti->pegawai_id !== $this->ownPegawaiId()) {
            abort(403, 'Anda hanya dapat mengakses pengajuan cuti milik Anda sendiri.');
        }
    }

    protected function ensureOwnSurat(string $suratId): void
    {
        if (! $this->isIndividuOnly()) {
            return;
        }

        $surat = Surat::find($suratId);
        if (! $surat || $surat->pegawai_id !== $this->ownPegawaiId()) {
            abort(403, 'Anda hanya dapat mengakses surat milik Anda sendiri.');
        }
    }
}
