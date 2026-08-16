<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Riwayat Mutasi (transfer/mutation history) model.
 *
 * @property string $id
 * @property string $pegawai_id
 * @property string $asal
 * @property string $tujuan
 * @property string|null $nomor_sk
 * @property \Illuminate\Support\Carbon|null $tanggal_sk
 * @property \Illuminate\Support\Carbon|null $tmt
 * @property string|null $keterangan
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class RiwayatMutasi extends Model
{
    use HasUuid;

    /**
     * @var string
     */
    protected $table = 'riwayat_mutasi';

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
        'asal',
        'tujuan',
        'nomor_sk',
        'tanggal_sk',
        'tmt',
        'keterangan',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tanggal_sk' => 'date',
            'tmt' => 'date',
        ];
    }

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
