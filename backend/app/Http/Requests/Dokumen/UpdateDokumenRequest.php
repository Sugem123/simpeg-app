<?php

namespace App\Http\Requests\Dokumen;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateDokumenRequest extends FormRequest
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
            'kategori'    => ['sometimes', 'string', 'in:ktp,kk,ijazah,sk,sertifikat,foto,npwp,transkrip,lainnya'],
            'file'        => ['sometimes', 'file', 'mimes:pdf,jpg,jpeg,png,doc,docx', 'max:10240'],
            'keterangan'  => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'kategori.in' => 'Kategori dokumen tidak valid.',
            'file.mimes'  => 'File harus berupa PDF, JPG, JPEG, PNG, DOC, atau DOCX.',
            'file.max'    => 'Ukuran file maksimal 10MB.',
        ];
    }
}
