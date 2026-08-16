<?php

namespace App\Http\Requests\User;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
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
            'pegawai_id' => ['required', 'uuid', 'exists:pegawai,id'],
            'username'   => ['required', 'string', 'max:50', 'unique:users,username'],
            'email'      => ['required', 'email', 'max:200', 'unique:users,email'],
            'password'   => [
                'required',
                'string',
                'min:12',
                'regex:/[a-z]/',
                'regex:/[A-Z]/',
                'regex:/[0-9]/',
                'regex:/[@$!%*#?&]/',
            ],
            'role_id'    => ['required', 'uuid', 'exists:roles,id'],
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
            'username.required'   => 'Username wajib diisi.',
            'username.unique'     => 'Username sudah terdaftar.',
            'email.required'      => 'Email wajib diisi.',
            'email.unique'        => 'Email sudah terdaftar.',
            'password.required'   => 'Password wajib diisi.',
            'password.min'        => 'Password minimal 12 karakter.',
            'password.regex'      => 'Password harus mengandung huruf besar, huruf kecil, angka, dan karakter spesial.',
            'role_id.required'    => 'Role wajib dipilih.',
            'role_id.exists'      => 'Role tidak ditemukan.',
        ];
    }
}
