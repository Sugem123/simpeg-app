<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\EmasterSyncService;
use App\Services\EmasterBatchSyncService;
use App\Services\EmasterDocumentService;
use App\Services\EmasterDetailService;
use Illuminate\Http\JsonResponse;

class EmasterSyncController extends Controller
{
    public function sync(): JsonResponse
    {
        try {
            $service = new EmasterSyncService();
            $result = $service->sync();

            return response()->json([
                'success' => true,
                'message' => "Sync completed: {$result['created']} created, {$result['updated']} updated, {$result['skipped']} skipped",
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Sync failed: ' . $e->getMessage(),
                'data' => null,
            ], 500);
        }
    }

    public function syncBatch(): JsonResponse
    {
        try {
            $service = new EmasterBatchSyncService();
            $result = $service->syncBatch();

            return response()->json([
                'success' => true,
                'message' => "Batch sync completed: {$result['total_updated']} pegawai updated, {$result['diklat_created']} diklat created",
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Batch sync failed: ' . $e->getMessage(),
                'data' => null,
            ], 500);
        }
    }

    public function syncDocuments(): JsonResponse
    {
        try {
            $service = new EmasterDocumentService();
            $result = $service->syncDocuments();

            return response()->json([
                'success' => true,
                'message' => "Document sync completed: {$result['photos_downloaded']} photos, {$result['documents_downloaded']} documents, {$result['skipped']} skipped",
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Document sync failed: ' . $e->getMessage(),
                'data' => null,
            ], 500);
        }
    }

    public function syncDetails(): JsonResponse
    {
        try {
            $service = new EmasterDetailService();
            $result = $service->syncDetails();

            return response()->json([
                'success' => true,
                'message' => "Detail sync completed: {$result['pangkat_created']} pangkat, {$result['jabatan_created']} jabatan, {$result['pendidikan_created']} pendidikan, {$result['diklat_created']} diklat",
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Detail sync failed: ' . $e->getMessage(),
                'data' => null,
            ], 500);
        }
    }

    public function syncAll(): JsonResponse
    {
        try {
            $results = [];

            // Phase 1: Basic sync (pegawai data)
            $basicService = new EmasterSyncService();
            $results['basic'] = $basicService->sync();

            // Phase 2: Batch data enrichment (33 new columns)
            $batchService = new EmasterBatchSyncService();
            $results['batch'] = $batchService->syncBatch();

            // Phase 3: Document download
            $docService = new EmasterDocumentService();
            $results['documents'] = $docService->syncDocuments();

            // Phase 4: Per-pegawai detail (riwayat)
            $detailService = new EmasterDetailService();
            $results['details'] = $detailService->syncDetails();

            return response()->json([
                'success' => true,
                'message' => 'Full sync completed successfully',
                'data' => $results,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Full sync failed: ' . $e->getMessage(),
                'data' => null,
            ], 500);
        }
    }
}
