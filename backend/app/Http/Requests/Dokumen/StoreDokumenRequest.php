<?php

namespace App\Http\Requests\Dokumen;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreDokumenRequest extends FormRequest
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
            'pegawai_id'  => ['required', 'uuid', 'exists:pegawai,id'],
            'kategori'    => ['required', 'string', 'in:ktp,kk,ijazah,sk,sertifikat,foto,npwp,transkrip,lainnya'],
            'file'        => ['required', 'file', 'mimes:pdf,jpg,jpeg,png,doc,docx', 'max:10240'],
            'keterangan'  => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'pegawai_id.required' => 'Pegawai wajib dipilih.',
            'pegawai_id.exists'   => 'Pegawai tidak ditemukan.',
            'kategori.required'   => 'Kategori dokumen wajib dipilih.',
            'kategori.in'         => 'Kategori dokumen tidak valid.',
            'file.required'       => 'File dokumen wajib diunggah.',
            'file.mimes'          => 'File harus berupa PDF, JPG, JPEG, PNG, DOC, atau DOCX.',
            'file.max'            => 'Ukuran file maksimal 10MB.',
        ];
    }
}
