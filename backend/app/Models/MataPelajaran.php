<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

/**
 * Mata Pelajaran (school subject) reference model.
 *
 * @property string $id
 * @property string $kode
 * @property string $nama
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class MataPelajaran extends Model
{
    use HasUuid;

    /**
     * @var string
     */
    protected $table = 'mata_pelajaran';

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
}
