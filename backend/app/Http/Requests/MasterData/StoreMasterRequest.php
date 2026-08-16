<?php

namespace App\Http\Requests\MasterData;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreMasterRequest extends FormRequest
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
            'nama'       => ['sometimes', 'required', 'string', 'max:200'],
            'kode'       => ['sometimes', 'required', 'string', 'max:50'],
            'jenjang'    => ['sometimes', 'required', 'string', 'max:200'],
            'keterangan' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nama.required'    => 'Nama wajib diisi.',
            'kode.required'    => 'Kode wajib diisi.',
            'jenjang.required' => 'Jenjang wajib diisi.',
        ];
    }
}
