<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Riwayat Pendidikan (education history) model.
 *
 * @property string $id
 * @property string $pegawai_id
 * @property string $jenjang
 * @property string $institusi
 * @property string|null $jurusan
 * @property int|null $tahun_lulus
 * @property string|null $nomor_ijazah
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class RiwayatPendidikan extends Model
{
    use HasUuid;

    /**
     * @var string
     */
    protected $table = 'riwayat_pendidikan';

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
        'jenjang',
        'institusi',
        'jurusan',
        'tahun_lulus',
        'nomor_ijazah',
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
