<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Riwayat KGB (periodic salary increase history) model.
 *
 * @property string $id
 * @property string $pegawai_id
 * @property string|null $nomor_sk
 * @property \Illuminate\Support\Carbon|null $tanggal_sk
 * @property \Illuminate\Support\Carbon|null $tmt
 * @property float|null $gaji_pokok_lama
 * @property float|null $gaji_pokok_baru
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class RiwayatKgb extends Model
{
    use HasUuid;

    /**
     * @var string
     */
    protected $table = 'riwayat_kgb';

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
        'nomor_sk',
        'tanggal_sk',
        'tmt',
        'gaji_pokok_lama',
        'gaji_pokok_baru',
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
            'gaji_pokok_lama' => 'decimal:2',
            'gaji_pokok_baru' => 'decimal:2',
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
