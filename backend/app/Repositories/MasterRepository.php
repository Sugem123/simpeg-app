<?php

namespace App\Repositories;

use App\Repositories\Contracts\MasterRepositoryInterface;
use Illuminate\Database\Eloquent\Model;

/**
 * Generic repository for master-data tables.
 *
 * A model class is injected via the constructor so a single repository
 * class can handle any master-data model (Agama, Jabatan, etc.).
 */
class MasterRepository extends BaseRepository implements MasterRepositoryInterface
{
    /** @var list<string> */
    protected array $searchable = ['nama', 'kode', 'jenjang'];

    public function __construct(Model $model)
    {
        parent::__construct($model);
    }
}
