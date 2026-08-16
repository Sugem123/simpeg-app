<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Riwayat Diklat (training history) model.
 *
 * @property string $id
 * @property string $pegawai_id
 * @property string $nama_diklat
 * @property string|null $penyelenggara
 * @property int|null $tahun
 * @property int|null $jam_pelajaran
 * @property string|null $nomor_sertifikat
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class RiwayatDiklat extends Model
{
    use HasUuid;

    /**
     * @var string
     */
    protected $table = 'riwayat_diklat';

    /**
     * @var string
     */
    protected $keyType = 'string';

    /**
     * @var bool
     */
    public $incrementing = false;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'pegawai_id',
        'nama_diklat',
        'penyelenggara',
        'tahun',
        'jam_pelajaran',
        'nomor_sertifikat',
    ];

    // =========================================================================
    // Relationships
    // =========================================================================

    /**
     * @return BelongsTo<Pegawai, $this>
     */
    public function pegawai(): BelongsTo
    {
        return $this->belongsTo(Pegawai::class);
    }
}
