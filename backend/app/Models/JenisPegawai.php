<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Jenis Pegawai (employee type) reference model.
 *
 * @property string $id
 * @property string $nama
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class JenisPegawai extends Model
{
    use HasUuid;

    /**
     * @var string
     */
    protected $table = 'jenis_pegawai';

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
        'nama',
    ];

    /**
     * Get the employees of this type.
     *
     * @return HasMany<Pegawai, $this>
     */
    public function pegawai(): HasMany
    {
        return $this->hasMany(Pegawai::class);
    }
}
