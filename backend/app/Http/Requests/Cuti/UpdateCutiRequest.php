<?php

namespace App\Http\Requests\Cuti;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCutiRequest extends FormRequest
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
            'jenis_cuti'       => ['sometimes', 'string', 'in:tahunan,sakit,melahirkan,besar,penting,luar_tanggungan'],
            'tanggal_mulai'    => ['sometimes', 'date'],
            'tanggal_selesai'  => ['sometimes', 'date', 'after_or_equal:tanggal_mulai'],
            'alasan'           => ['sometimes', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'jenis_cuti.in'                  => 'Jenis cuti tidak valid.',
            'tanggal_selesai.after_or_equal' => 'Tanggal selesai harus setelah atau sama dengan tanggal mulai.',
            'alasan.max'                     => 'Alasan maksimal 1000 karakter.',
        ];
    }
}
