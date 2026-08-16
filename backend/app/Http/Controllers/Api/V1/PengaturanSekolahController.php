<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PengaturanSekolah;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class PengaturanSekolahController extends Controller
{
    use ApiResponse;

    /**
     * GET /pengaturan-sekolah
     */
    public function index(): JsonResponse
    {
        $profile = PengaturanSekolah::current();

        if (! $profile) {
            // Return defaults if no record exists yet
            return $this->success([
                'nama'            => 'SMAN 1 Prambon',
                'npsn'             => null,
                'alamat'           => null,
                'telepon'          => null,
                'email'            => null,
                'website'          => null,
                'logo_path'        => null,
                'logo_url'         => null,
                'kepala_sekolah'   => null,
                'nip_kepala'       => null,
            ], 'Profil sekolah berhasil diambil.');
        }

        return $this->success($this->transform($profile), 'Profil sekolah berhasil diambil.');
    }

    /**
     * PUT /pengaturan-sekolah
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama'            => ['required', 'string', 'max:200'],
            'npsn'            => ['nullable', 'string', 'max:20'],
            'alamat'          => ['nullable', 'string', 'max:500'],
            'telepon'         => ['nullable', 'string', 'max:30'],
            'email'           => ['nullable', 'email', 'max:100'],
            'website'         => ['nullable', 'string', 'max:200'],
            'kepala_sekolah'  => ['nullable', 'string', 'max:200'],
            'nip_kepala'      => ['nullable', 'string', 'max:30'],
        ]);

        $profile = PengaturanSekolah::current();

        if ($profile) {
            $profile->update($validated);
        } else {
            $profile = PengaturanSekolah::create($validated);
        }

        return $this->success($this->transform($profile), 'Profil sekolah berhasil diperbarui.');
    }

    /**
     * POST /pengaturan-sekolah/logo
     */
    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => ['required', 'file', 'max:2048', 'mimes:png,jpg,jpeg,svg,webp'],
        ]);

        $profile = PengaturanSekolah::current() ?? PengaturanSekolah::create([
            'nama' => 'SMAN 1 Prambon',
        ]);

        // Delete old logo if exists
        if ($profile->logo_path) {
            Storage::disk('public')->delete($profile->logo_path);
        }

        $file = $request->file('logo');
        $ext = $file->getClientOriginalExtension() ?: 'png';
        $filename = 'logo-sekolah-' . time() . '.' . $ext;

        $path = $file->storeAs('sekolah', $filename, 'public');

        $profile->update(['logo_path' => $path]);

        return $this->success(
            $this->transform($profile),
            'Logo sekolah berhasil diunggah.',
        );
    }

    /**
     * Transform model to array with logo_url.
     */
    private function transform(PengaturanSekolah $profile): array
    {
        return [
            'id'              => $profile->id,
            'nama'            => $profile->nama,
            'npsn'            => $profile->npsn,
            'alamat'          => $profile->alamat,
            'telepon'         => $profile->telepon,
            'email'           => $profile->email,
            'website'         => $profile->website,
            'logo_path'       => $profile->logo_path,
            'logo_url'        => $profile->logo_path
                ? "/storage/{$profile->logo_path}"
                : null,
            'kepala_sekolah'  => $profile->kepala_sekolah,
            'nip_kepala'      => $profile->nip_kepala,
        ];
    }
}
