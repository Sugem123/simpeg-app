<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request to sync a user account from a pegawai record.
 */
class SyncFromPegawaiRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'pegawai_id' => ['required', 'uuid', 'exists:pegawai,id'],
            'role_id' => ['required', 'uuid', 'exists:roles,id'],
            'generate_username' => ['sometimes', 'boolean'],
            'username' => ['required_if:generate_username,false', 'string', 'max:255', 'unique:users,username'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'pegawai_id.required' => 'Pegawai harus dipilih.',
            'pegawai_id.exists' => 'Pegawai tidak ditemukan.',
            'role_id.required' => 'Role harus dipilih.',
            'role_id.exists' => 'Role tidak ditemukan.',
            'username.unique' => 'Username sudah digunakan.',
            'email.unique' => 'Email sudah digunakan.',
            'password.min' => 'Password minimal 8 karakter.',
        ];
    }
}
