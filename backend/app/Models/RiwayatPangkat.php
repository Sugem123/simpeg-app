<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Riwayat Pangkat (rank history) model.
 *
 * @property string $id
 * @property string $pegawai_id
 * @property string $pangkat_id
 * @property string|null $golongan_id
 * @property string|null $nomor_sk
 * @property \Illuminate\Support\Carbon|null $tanggal_sk
 * @property \Illuminate\Support\Carbon|null $tmt
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class RiwayatPangkat extends Model
{
    use HasUuid;

    /**
     * @var string
     */
    protected $table = 'riwayat_pangkat';

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
        'pangkat_id',
        'golongan_id',
        'nomor_sk',
        'tanggal_sk',
        'tmt',
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

    /**
     * @return BelongsTo<Pangkat, $this>
     */
    public function pangkat(): BelongsTo
    {
        return $this->belongsTo(Pangkat::class);
    }

    /**
     * @return BelongsTo<Golongan, $this>
     */
    public function golongan(): BelongsTo
    {
        return $this->belongsTo(Golongan::class);
    }
}
