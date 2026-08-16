"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  masterService,
  type MasterType,
} from "@/services/master-service";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Database, AlertTriangle } from "lucide-react";
import type { MasterData } from "@/types";

// ─── Tab Configuration ──────────────────────────────────────────

interface TabConfig {
  key: MasterType;
  label: string;
}

const TABS: TabConfig[] = [
  { key: "jabatan", label: "Jabatan" },
  { key: "pangkat", label: "Pangkat" },
  { key: "golongan", label: "Golongan" },
  { key: "status-kepegawaian", label: "Status Kepegawaian" },
  { key: "jenis-pegawai", label: "Jenis Pegawai" },
  { key: "unit-kerja", label: "Unit Kerja" },
  { key: "agama", label: "Agama" },
  { key: "pendidikan", label: "Pendidikan" },
  { key: "mata-pelajaran", label: "Mata Pelajaran" },
];

// ─── Main Page Component ────────────────────────────────────────

export default function MasterDataPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = (searchParams.get("tab") as MasterType) || "jabatan";
  const [activeTab, setActiveTab] = useState<MasterType>(initialTab);

  function handleTabChange(value: string) {
    const tab = value as MasterType;
    setActiveTab(tab);
    router.replace(`/master-data?tab=${tab}`, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Master Data
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola data referensi sistem
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-max">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key} className="text-xs sm:text-sm">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {TABS.map((tab) => (
          <TabsContent key={tab.key} value={tab.key}>
            <MasterDataTable type={tab.key} label={tab.label} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// ─── Master Data Table ──────────────────────────────────────────

function MasterDataTable({
  type,
  label,
}: {
  type: MasterType;
  label: string;
}) {
  const queryClient = useQueryClient();

  const [editItem, setEditItem] = useState<MasterData | null>(null);
  const [deleteItem, setDeleteItem] = useState<MasterData | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ kode: "", nama: "" });

  // Fetch data
  const { data, isLoading, error } = useQuery({
    queryKey: ["master", type],
    queryFn: () => masterService.getMasterData(type, { per_page: 100 }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (newData: Partial<MasterData>) =>
      masterService.createMaster(type, newData),
    onSuccess: () => {
      toast.add({ title: `${label} berhasil ditambahkan`, type: "success" });
      queryClient.invalidateQueries({ queryKey: ["master", type] });
      setIsCreateOpen(false);
      setFormData({ kode: "", nama: "" });
    },
    onError: () => {
      toast.add({ title: `Gagal menambahkan ${label}`, type: "error" });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data: updateData }: { id: string; data: Partial<MasterData> }) =>
      masterService.updateMaster(type, id, updateData),
    onSuccess: () => {
      toast.add({ title: `${label} berhasil diperbarui`, type: "success" });
      queryClient.invalidateQueries({ queryKey: ["master", type] });
      setEditItem(null);
    },
    onError: () => {
      toast.add({ title: `Gagal memperbarui ${label}`, type: "error" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => masterService.deleteMaster(type, id),
    onSuccess: () => {
      toast.add({ title: `${label} berhasil dihapus`, type: "success" });
      queryClient.invalidateQueries({ queryKey: ["master", type] });
      setDeleteItem(null);
    },
    onError: () => {
      toast.add({ title: `Gagal menghapus ${label}`, type: "error" });
    },
  });

  const items = data?.data ?? [];

  function handleCreate() {
    if (!formData.nama.trim()) {
      toast.add({ title: "Nama harus diisi", type: "error" });
      return;
    }
    createMutation.mutate({
      kode: formData.kode || undefined,
      nama: formData.nama,
    });
  }

  function handleUpdate() {
    if (!editItem || !formData.nama.trim()) {
      toast.add({ title: "Nama harus diisi", type: "error" });
      return;
    }
    updateMutation.mutate({
      id: editItem.id,
      data: { kode: formData.kode || undefined, nama: formData.nama },
    });
  }

  function openEdit(item: MasterData) {
    setFormData({ kode: item.kode ?? "", nama: item.nama });
    setEditItem(item);
  }

  function openCreate() {
    setFormData({ kode: "", nama: "" });
    setIsCreateOpen(true);
  }

  return (
    <>
      {/* Header + Add Button */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {isLoading ? "Memuat..." : `${items.length} data`}
        </span>
        <Button className="rounded-xl" size="sm" onClick={openCreate}>
          <Plus className="mr-1.5 size-4" />
          Tambah {label}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-card">
        {isLoading ? (
          <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertTriangle className="size-10 text-destructive/60" />
            <p className="text-sm text-muted-foreground">
              Gagal memuat data {label.toLowerCase()}
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Database className="size-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Belum ada data {label.toLowerCase()}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">No</TableHead>
                <TableHead className="w-28">Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead className="w-24 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {item.kode ?? "-"}
                  </TableCell>
                  <TableCell className="font-medium">{item.nama}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Edit"
                        onClick={() => openEdit(item)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Hapus"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteItem(item)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah {label}</DialogTitle>
            <DialogDescription>
              Masukkan data {label.toLowerCase()} baru
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="create-kode">Kode (opsional)</Label>
              <Input
                id="create-kode"
                value={formData.kode}
                onChange={(e) =>
                  setFormData({ ...formData, kode: e.target.value })
                }
                placeholder="Masukkan kode"
                className="rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="create-nama">
                Nama <span className="text-destructive">*</span>
              </Label>
              <Input
                id="create-nama"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                placeholder="Masukkan nama"
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {label}</DialogTitle>
            <DialogDescription>
              Ubah data {label.toLowerCase()}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-kode">Kode (opsional)</Label>
              <Input
                id="edit-kode"
                value={formData.kode}
                onChange={(e) =>
                  setFormData({ ...formData, kode: e.target.value })
                }
                placeholder="Masukkan kode"
                className="rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-nama">
                Nama <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-nama"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                placeholder="Masukkan nama"
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>
              Batal
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus {label}</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus{" "}
              <strong>{deleteItem?.nama}</strong>? Tindakan ini tidak dapat
              dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItem(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
