<?php

namespace App\Http\Requests\Cuti;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCutiRequest extends FormRequest
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
            'pegawai_id'       => ['required', 'uuid', 'exists:pegawai,id'],
            'jenis_cuti'       => ['required', 'string', 'in:tahunan,sakit,melahirkan,besar,penting,luar_tanggungan'],
            'tanggal_mulai'    => ['required', 'date', 'after_or_equal:today'],
            'tanggal_selesai'  => ['required', 'date', 'after_or_equal:tanggal_mulai'],
            'alasan'           => ['required', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'pegawai_id.required'            => 'Pegawai wajib dipilih.',
            'pegawai_id.exists'              => 'Pegawai tidak ditemukan.',
            'jenis_cuti.required'            => 'Jenis cuti wajib dipilih.',
            'jenis_cuti.in'                  => 'Jenis cuti tidak valid.',
            'tanggal_mulai.required'         => 'Tanggal mulai wajib diisi.',
            'tanggal_mulai.after_or_equal'   => 'Tanggal mulai tidak boleh kurang dari hari ini.',
            'tanggal_selesai.required'       => 'Tanggal selesai wajib diisi.',
            'tanggal_selesai.after_or_equal' => 'Tanggal selesai harus setelah atau sama dengan tanggal mulai.',
            'alasan.required'                => 'Alasan cuti wajib diisi.',
            'alasan.max'                     => 'Alasan maksimal 1000 karakter.',
        ];
    }
}
