<?php

namespace App\Models;

use App\Enums\JenisKelamin;
use App\Enums\StatusAktif;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Pegawai (employee) — the central model of the SIMPEG application.
 *
 * @property string $id
 * @property string|null $nip
 * @property string|null $nuptk
 * @property string|null $nik
 * @property string $nama
 * @property string|null $gelar_depan
 * @property string|null $gelar_belakang
 * @property string|null $tempat_lahir
 * @property \Illuminate\Support\Carbon|null $tanggal_lahir
 * @property JenisKelamin $jenis_kelamin
 * @property string|null $agama_id
 * @property string|null $jenis_pegawai_id
 * @property string|null $status_kepegawaian_id
 * @property string|null $jabatan_id
 * @property string|null $pangkat_id
 * @property string|null $golongan_id
 * @property string|null $unit_kerja_id
 * @property string|null $alamat
 * @property string|null $no_hp
 * @property string|null $email
 * @property string|null $foto
 * @property bool $status_aktif
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read string $nama_lengkap
 */
class Pegawai extends Model
{
    use HasUuid;
    use SoftDeletes;

    protected $table = 'pegawai';

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
        'nip',
        'nuptk',
        'nik',
        'nama',
        'gelar_depan',
        'gelar_belakang',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'agama_id',
        'jenis_pegawai_id',
        'status_kepegawaian_id',
        'jabatan_id',
        'pangkat_id',
        'golongan_id',
        'unit_kerja_id',
        'alamat',
        'no_hp',
        'email',
        'foto',
        'status_aktif',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tanggal_lahir' => 'date',
            'jenis_kelamin' => JenisKelamin::class,
            'status_aktif' => 'boolean',
        ];
    }

    // =========================================================================
    // Accessors
    // =========================================================================

    /**
     * Get the full name with titles (gelar_depan + nama + gelar_belakang).
     */
    protected function namaLengkap(): Attribute
    {
        return Attribute::get(function (): string {
            return trim(
                ($this->gelar_depan ? $this->gelar_depan . ' ' : '')
                . $this->nama
                . ($this->gelar_belakang ? ', ' . $this->gelar_belakang : '')
            );
        });
    }

    // =========================================================================
    // Relationships — BelongsTo (reference tables)
    // =========================================================================

    /**
     * @return BelongsTo<Agama, $this>
     */
    public function agama(): BelongsTo
    {
        return $this->belongsTo(Agama::class);
    }

    /**
     * @return BelongsTo<JenisPegawai, $this>
     */
    public function jenisPegawai(): BelongsTo
    {
        return $this->belongsTo(JenisPegawai::class);
    }

    /**
     * @return BelongsTo<StatusKepegawaian, $this>
     */
    public function statusKepegawaian(): BelongsTo
    {
        return $this->belongsTo(StatusKepegawaian::class);
    }

    /**
     * @return BelongsTo<Jabatan, $this>
     */
    public function jabatan(): BelongsTo
    {
        return $this->belongsTo(Jabatan::class);
    }

    /**
     * @return BelongsTo<Pangkat, $this>
     */
    public function pangkat(): BelongsTo
    {
        return $this->belongsTo(Pangkat::class);
    }

    /**
     * @return BelongsTo<Golongan, $this>
     */
    public function golongan(): BelongsTo
    {
        return $this->belongsTo(Golongan::class);
    }

    /**
     * @return BelongsTo<UnitKerja, $this>
     */
    public function unitKerja(): BelongsTo
    {
        return $this->belongsTo(UnitKerja::class);
    }

    // =========================================================================
    // Relationships — HasOne / HasMany
    // =========================================================================

    /**
     * @return HasOne<User, $this>
     */
    public function user(): HasOne
    {
        return $this->hasOne(User::class);
    }

    /**
     * @return HasMany<Dokumen, $this>
     */
    public function dokumen(): HasMany
    {
        return $this->hasMany(Dokumen::class);
    }

    /**
     * @return HasMany<RiwayatJabatan, $this>
     */
    public function riwayatJabatan(): HasMany
    {
        return $this->hasMany(RiwayatJabatan::class);
    }

    /**
     * @return HasMany<RiwayatPangkat, $this>
     */
    public function riwayatPangkat(): HasMany
    {
        return $this->hasMany(RiwayatPangkat::class);
    }

    /**
     * @return HasMany<RiwayatPendidikan, $this>
     */
    public function riwayatPendidikan(): HasMany
    {
        return $this->hasMany(RiwayatPendidikan::class);
    }

    /**
     * @return HasMany<RiwayatKgb, $this>
     */
    public function riwayatKgb(): HasMany
    {
        return $this->hasMany(RiwayatKgb::class);
    }

    /**
     * @return HasMany<RiwayatDiklat, $this>
     */
    public function riwayatDiklat(): HasMany
    {
        return $this->hasMany(RiwayatDiklat::class);
    }

    /**
     * @return HasMany<RiwayatMutasi, $this>
     */
    public function riwayatMutasi(): HasMany
    {
        return $this->hasMany(RiwayatMutasi::class);
    }

    /**
     * @return HasMany<Surat, $this>
     */
    public function surat(): HasMany
    {
        return $this->hasMany(Surat::class);
    }

    /**
     * @return HasMany<Cuti, $this>
     */
    public function cuti(): HasMany
    {
        return $this->hasMany(Cuti::class);
    }
}
