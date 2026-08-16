<?php

namespace App\Providers;

use App\Repositories\Contracts\DokumenRepositoryInterface;
use App\Repositories\Contracts\MasterRepositoryInterface;
use App\Repositories\Contracts\PegawaiRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\DokumenRepository;
use App\Repositories\MasterRepository;
use App\Repositories\PegawaiRepository;
use App\Repositories\UserRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Interface → Implementation bindings.
     *
     * @var array<class-string, class-string>
     */
    public array $bindings = [
        UserRepositoryInterface::class    => UserRepository::class,
        PegawaiRepositoryInterface::class => PegawaiRepository::class,
        DokumenRepositoryInterface::class => DokumenRepository::class,
        // MasterRepositoryInterface is resolved dynamically by MasterDataService,
        // so we don't bind it here.
    ];

    public function register(): void
    {
        foreach ($this->bindings as $abstract => $concrete) {
            $this->app->bind($abstract, $concrete);
        }
    }
}
