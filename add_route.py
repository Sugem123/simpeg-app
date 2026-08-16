import re

filepath = '/home/dhonawid/simpeg-app/backend/routes/api.php'
with open(filepath, 'r') as f:
    content = f.read()

# Add import after DokumenController import
content = content.replace(
    "use App\\Http\\Controllers\\Api\\V1\\DokumenController;",
    "use App\\Http\\Controllers\\Api\\V1\\DokumenController;\nuse App\\Http\\Controllers\\Api\\V1\\EmasterSyncController;"
)

# Add emaster sync route before Pegawai section
old = "    // --- Pegawai ----------------------------------------------------------"
new = """    // --- eMaster Sync (Super Admin only) ----------------------------------
    Route::middleware('role:Super Admin')->group(function () {
        Route::post('emaster/sync', [EmasterSyncController::class, 'sync']);
    });

    // --- Pegawai ----------------------------------------------------------"""
content = content.replace(old, new)

with open(filepath, 'w') as f:
    f.write(content)
print('ROUTE_ADDED')
