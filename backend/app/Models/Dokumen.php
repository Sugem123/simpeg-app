<?php

namespace App\Models;

use App\Enums\KategoriDokumen;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Dokumen (employee document) model.
 *
 * @property string $id
 * @property string $pegawai_id
 * @property KategoriDokumen $kategori
 * @property string $nama_file
 * @property string $path
 * @property string|null $mime_type
 * @property int|null $ukuran
 * @property string|null $uploaded_by
 * @property string|null $keterangan
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 */
class Dokumen extends Model
{
    use HasUuid;
    use SoftDeletes;

    protected $table = 'dokumen';

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
        'kategori',
        'nama_file',
        'path',
        'mime_type',
        'ukuran',
        'uploaded_by',
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
            'kategori' => KategoriDokumen::class,
            'ukuran' => 'integer',
        ];
    }

    // =========================================================================
    // Relationships
    // =========================================================================

    /**
     * The employee this document belongs to.
     *
     * @return BelongsTo<Pegawai, $this>
     */
    public function pegawai(): BelongsTo
    {
        return $this->belongsTo(Pegawai::class);
    }

    /**
     * The user who uploaded this document.
     *
     * @return BelongsTo<User, $this>
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
