<?php

namespace App\Http\Requests\Surat;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreSuratRequest extends FormRequest
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
            'nomor'      => ['required', 'string', 'max:100'],
            'jenis'      => ['required', 'string', 'in:sk,surat_tugas,pakta_integritas,surat_keterangan'],
            'pegawai_id' => ['required', 'uuid', 'exists:pegawai,id'],
            'perihal'    => ['nullable', 'string', 'max:255'],
            'tanggal'    => ['required', 'date'],
            'file_pdf'   => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nomor.required'      => 'Nomor surat wajib diisi.',
            'jenis.required'      => 'Jenis surat wajib dipilih.',
            'jenis.in'            => 'Jenis surat tidak valid.',
            'pegawai_id.required' => 'Pegawai wajib dipilih.',
            'pegawai_id.exists'   => 'Pegawai tidak ditemukan.',
            'tanggal.required'    => 'Tanggal surat wajib diisi.',
            'file_pdf.mimes'      => 'File harus berupa PDF.',
            'file_pdf.max'        => 'Ukuran file maksimal 10MB.',
        ];
    }
}
