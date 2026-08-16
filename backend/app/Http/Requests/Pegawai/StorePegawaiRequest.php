<?php

namespace App\Http\Requests\Pegawai;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePegawaiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nik'                    => ['required', 'string', 'size:16', 'unique:pegawai,nik'],
            'nip'                    => ['nullable', 'string', 'max:30', 'unique:pegawai,nip'],
            'nuptk'                  => ['nullable', 'string', 'max:30', 'unique:pegawai,nuptk'],
            'nama'                   => ['required', 'string', 'max:200'],
            'gelar_depan'            => ['nullable', 'string', 'max:50'],
            'gelar_belakang'         => ['nullable', 'string', 'max:50'],
            'tempat_lahir'           => ['nullable', 'string', 'max:100'],
            'tanggal_lahir'          => ['nullable', 'date'],
            'jenis_kelamin'          => ['required', 'string', 'in:L,P'],
            'agama_id'               => ['nullable', 'uuid', 'exists:agama,id'],
            'jenis_pegawai_id'       => ['nullable', 'uuid', 'exists:jenis_pegawai,id'],
            'status_kepegawaian_id'  => ['nullable', 'uuid', 'exists:status_kepegawaian,id'],
            'jabatan_id'             => ['nullable', 'uuid', 'exists:jabatan,id'],
            'pangkat_id'             => ['nullable', 'uuid', 'exists:pangkat,id'],
            'golongan_id'            => ['nullable', 'uuid', 'exists:golongan,id'],
            'unit_kerja_id'          => ['nullable', 'uuid', 'exists:unit_kerja,id'],
            'alamat'                 => ['nullable', 'string', 'max:500'],
            'no_hp'                  => ['nullable', 'string', 'max:20'],
            'email'                  => ['nullable', 'email', 'max:200', 'unique:pegawai,email'],
            'foto'                   => ['nullable', 'string', 'max:255'],
            'status_aktif'           => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nik.required'    => 'NIK wajib diisi.',
            'nik.size'        => 'NIK harus 16 karakter.',
            'nik.unique'      => 'NIK sudah terdaftar.',
            'nip.unique'      => 'NIP sudah terdaftar.',
            'nuptk.unique'    => 'NUPTK sudah terdaftar.',
            'nama.required'   => 'Nama wajib diisi.',
            'email.unique'    => 'Email sudah terdaftar.',
            'email.email'     => 'Format email tidak valid.',
        ];
    }
}
