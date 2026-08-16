<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Unit Kerja (work unit/department) reference model.
 *
 * @property string $id
 * @property string $kode
 * @property string $nama
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class UnitKerja extends Model
{
    use HasUuid;

    /**
     * @var string
     */
    protected $table = 'unit_kerja';

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
        'kode',
        'nama',
    ];

    /**
     * Get the employees in this work unit.
     *
     * @return HasMany<Pegawai, $this>
     */
    public function pegawai(): HasMany
    {
        return $this->hasMany(Pegawai::class);
    }
}
