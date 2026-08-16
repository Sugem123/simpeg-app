<?php

namespace App\Traits;

use Illuminate\Support\Str;

/**
 * Trait to auto-generate UUID as primary key on model creation.
 *
 * Apply this trait to any Eloquent model that uses UUID primary keys.
 * It automatically sets `$incrementing = false` and `$keyType = 'string'`.
 */
trait HasUuid
{
    /**
     * Boot the HasUuid trait.
     *
     * Automatically generates a UUID for the model's primary key
     * when creating a new record, if the key is not already set.
     */
    public static function bootHasUuid(): void
    {
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = Str::uuid()->toString();
            }
        });
    }

    /**
     * Indicates that the model's ID is not auto-incrementing.
     */
    public function getIncrementing(): bool
    {
        return false;
    }

    /**
     * Returns the type of the primary key (string for UUID).
     */
    public function getKeyType(): string
    {
        return 'string';
    }
}
