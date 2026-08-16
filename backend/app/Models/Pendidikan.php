<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

/**
 * Pendidikan (education level) reference model.
 *
 * @property string $id
 * @property string $jenjang
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class Pendidikan extends Model
{
    use HasUuid;

    /**
     * @var string
     */
    protected $table = 'pendidikan';

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
        'jenjang',
    ];
}
