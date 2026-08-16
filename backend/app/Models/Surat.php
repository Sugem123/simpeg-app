<?php

namespace App\Models;

use App\Enums\JenisSurat;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Surat (letter/official document) model.
 *
 * @property string $id
 * @property string $nomor
 * @property JenisSurat $jenis
 * @property string $pegawai_id
 * @property string $perihal
 * @property \Illuminate\Support\Carbon $tanggal
 * @property string|null $file_pdf
 * @property string|null $created_by
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 */
class Surat extends Model
{
    use HasUuid;
    use SoftDeletes;

    protected $table = 'surat';

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
        'nomor',
        'jenis',
        'pegawai_id',
        'perihal',
        'tanggal',
        'file_pdf',
        'created_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'jenis' => JenisSurat::class,
            'tanggal' => 'date',
        ];
    }

    // =========================================================================
    // Relationships
    // =========================================================================

    /**
     * The employee this letter is associated with.
     *
     * @return BelongsTo<Pegawai, $this>
     */
    public function pegawai(): BelongsTo
    {
        return $this->belongsTo(Pegawai::class);
    }

    /**
     * The user who created this letter.
     *
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
