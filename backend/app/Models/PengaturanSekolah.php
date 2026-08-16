<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $id
 * @property string $nama
 * @property string|null $npsn
 * @property string|null $alamat
 * @property string|null $telepon
 * @property string|null $email
 * @property string|null $website
 * @property string|null $logo_path
 * @property string|null $kepala_sekolah
 * @property string|null $nip_kepala
 */
class PengaturanSekolah extends Model
{
    use HasUuid;

    protected $table = 'pengaturan_sekolah';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'nama',
        'npsn',
        'alamat',
        'telepon',
        'email',
        'website',
        'logo_path',
        'kepala_sekolah',
        'nip_kepala',
    ];

    /**
     * Get the singleton record (first row).
     */
    public static function current(): ?self
    {
        return static::first();
    }

    /**
     * Get the logo URL.
     */
    public function logoUrl(): ?string
    {
        if (! $this->logo_path) {
            return null;
        }

        return asset("storage/{$this->logo_path}");
    }
}
