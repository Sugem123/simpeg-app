<?php

namespace App\Http\Requests\Riwayat;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreRiwayatRequest extends FormRequest
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
        $type = $this->route('type');

        $baseRules = [
            'pegawai_id' => ['required', 'uuid', 'exists:pegawai,id'],
        ];

        return match ($type) {
            'jabatan' => array_merge($baseRules, [
                'jabatan_id'  => ['required', 'uuid', 'exists:jabatan,id'],
                'nomor_sk'    => ['nullable', 'string', 'max:100'],
                'tanggal_sk'  => ['nullable', 'date'],
                'tmt'         => ['required', 'date'],
                'keterangan'  => ['nullable', 'string', 'max:500'],
            ]),

            'pangkat' => array_merge($baseRules, [
                'pangkat_id'  => ['required', 'uuid', 'exists:pangkat,id'],
                'golongan_id' => ['nullable', 'uuid', 'exists:golongan,id'],
                'nomor_sk'    => ['nullable', 'string', 'max:100'],
                'tanggal_sk'  => ['nullable', 'date'],
                'tmt'         => ['nullable', 'date'],
            ]),

            'pendidikan' => array_merge($baseRules, [
                'jenjang'       => ['required', 'string', 'max:50'],
                'institusi'     => ['required', 'string', 'max:200'],
                'jurusan'       => ['nullable', 'string', 'max:200'],
                'tahun_lulus'   => ['nullable', 'integer', 'min:1950', 'max:2099'],
                'nomor_ijazah'  => ['nullable', 'string', 'max:100'],
            ]),

            'kgb' => array_merge($baseRules, [
                'nomor_sk'         => ['nullable', 'string', 'max:100'],
                'tanggal_sk'       => ['nullable', 'date'],
                'tmt'              => ['nullable', 'date'],
                'gaji_pokok_lama'  => ['nullable', 'numeric', 'min:0'],
                'gaji_pokok_baru'  => ['nullable', 'numeric', 'min:0'],
            ]),

            'diklat' => array_merge($baseRules, [
                'nama_diklat'      => ['required', 'string', 'max:200'],
                'penyelenggara'    => ['nullable', 'string', 'max:200'],
                'tahun'            => ['nullable', 'integer', 'min:1950', 'max:2099'],
                'jam_pelajaran'    => ['nullable', 'integer', 'min:0'],
                'nomor_sertifikat' => ['nullable', 'string', 'max:100'],
            ]),

            'mutasi' => array_merge($baseRules, [
                'asal'        => ['required', 'string', 'max:200'],
                'tujuan'      => ['required', 'string', 'max:200'],
                'nomor_sk'    => ['nullable', 'string', 'max:100'],
                'tanggal_sk'  => ['nullable', 'date'],
                'tmt'         => ['nullable', 'date'],
                'keterangan'  => ['nullable', 'string', 'max:500'],
            ]),

            default => $baseRules,
        };
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'pegawai_id.required' => 'Pegawai wajib dipilih.',
            'pegawai_id.exists'   => 'Pegawai tidak ditemukan.',
            'jabatan_id.exists'   => 'Jabatan tidak ditemukan.',
            'pangkat_id.exists'   => 'Pangkat tidak ditemukan.',
            'golongan_id.exists'  => 'Golongan tidak ditemukan.',
            'tmt.required'        => 'TMT wajib diisi.',
            'nama_diklat.required' => 'Nama diklat wajib diisi.',
            'asal.required'       => 'Asal wajib diisi.',
            'tujuan.required'     => 'Tujuan wajib diisi.',
            'jenjang.required'    => 'Jenjang pendidikan wajib diisi.',
            'institusi.required'  => 'Institusi wajib diisi.',
        ];
    }
}
