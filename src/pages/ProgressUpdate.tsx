"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import { Search, Plus, TrendingUp, Calendar, User, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";

/* ===================== Supabase client ===================== */
function getEnv(name: string) {
  if (typeof import.meta !== "undefined" && (import.meta).env?.[name]) {
    return (import.meta).env[name] as string;
  }
  if (typeof process !== "undefined" && process.env?.[name]) {
    return process.env[name] as string;
  }
  return undefined;
}
const SUPABASE_URL = getEnv("VITE_SUPABASE_URL") || getEnv("NEXT_PUBLIC_SUPABASE_URL");
const SUPABASE_KEY = getEnv("VITE_SUPABASE_PUBLISHABLE_KEY") || getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const supabase = createClient(SUPABASE_URL as string, SUPABASE_KEY as string);

/* ===================== Types ===================== */
type ProjectStatus = "active" | "pending" | "completed";

type ProjectRow = {
  id: string;
  name: string;
  status: ProjectStatus;
  progress: number;
};

type ProgressUpdateRow = {
  id: string;
  project_id: string;
  update_date: string;
  progress_percentage: number;
  description: string;
  photos_url: string[] | null;
  updated_by: string;
  created_at: string;
  projects?: Pick<ProjectRow, "id" | "name" | "status" | "progress">;
};

/* ===================== Helpers ===================== */
function clampPercent(n: unknown) {
  const x = typeof n === "string" ? Number(n) : (n as number);
  if (Number.isNaN(x)) return 0;
  return Math.max(0, Math.min(100, Math.round(x)));
}
function normalizeDate(input: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  const m = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) {
    const [, dd, mm, yyyy] = m;
    return `${yyyy}-${mm}-${dd}`;
  }
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function formatDate(input: string) {
  try { return new Date(`${input}T00:00:00`).toLocaleDateString("th-TH"); } catch { return input; }
}
function statusBadgeClass(status?: ProjectStatus) {
  switch (status) {
    case "completed": return "bg-success text-success-foreground";
    case "active":    return "bg-warning text-warning-foreground";
    case "pending":
    default:          return "bg-secondary text-secondary-foreground";
  }
}
function statusText(status?: ProjectStatus) {
  switch (status) {
    case "completed": return "เสร็จสิ้น";
    case "active":    return "กำลังดำเนินการ";
    case "pending":
    default:          return "รอดำเนินการ";
  }
}

/* ===== Storage helpers ===== */
async function uploadManyAndGetPublicUrls(files: File[]): Promise<string[]> {
  if (!files.length) return [];
  const urls: string[] = [];
  for (const f of files) {
    const ext = f.name.split(".").pop()?.toLowerCase() || "bin";
    const filename = `${crypto.randomUUID()}.${ext}`;
    const path = `public/${filename}`;
    const { error } = await supabase.storage.from("logistic").upload(path, f, {
      cacheControl: "3600",
      upsert: false,
      contentType: f.type || "application/octet-stream",
    });
    if (error) throw error;
    const { data } = supabase.storage.from("logistic").getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

/* ===== Normalizers ===== */
type UnknownRec = Record<string, unknown>;
function toProject(p?: unknown): ProgressUpdateRow["projects"] {
  const node = Array.isArray(p) ? (p[0] as UnknownRec | undefined) : (p as UnknownRec | undefined);
  if (!node) return undefined;
  return {
    id: String(node.id),
    name: String(node.name),
    status: node.status as ProjectStatus,
    progress: Number(node.progress ?? 0),
  };
}
function toStringArray(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String);
  return [];
}
function normalizeRows(raw: unknown[]): ProgressUpdateRow[] {
  return raw.map((r0) => {
    const r = r0 as UnknownRec;
    return {
      id: String(r.id),
      project_id: String(r.project_id),
      update_date: String(r.update_date),
      progress_percentage: Number(r.progress_percentage ?? 0),
      description: String(r.description ?? ""),
      photos_url: toStringArray(r.photos_url),
      updated_by: String(r.updated_by ?? ""),
      created_at: String(r.created_at ?? ""),
      projects: toProject(r.projects),
    };
  });
}
function normalizeRow(raw: unknown): ProgressUpdateRow {
  return normalizeRows([raw])[0];
}

/* ---------- Mobile-first photo list (ย่อ/ขยาย) ---------- */
function PhotoGrid({
  urls,
  maxCollapsed = 4,
}: {
  urls: string[];
  maxCollapsed?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  if (!urls?.length) return null;

  const shown = expanded ? urls : urls.slice(0, maxCollapsed);
  const remaining = Math.max(urls.length - maxCollapsed, 0);

  return (
    <div className="mt-2">
      <h4 className="font-medium text-primary mb-2 text-sm sm:text-base">รูปภาพประกอบ:</h4>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {shown.map((url, i) => (
          <a
            key={`${url}-${i}`}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="block rounded overflow-hidden border border-border hover:opacity-90"
          >
            <img src={url} alt={`photo-${i}`} className="w-full h-20 sm:h-24 object-cover" />
          </a>
        ))}
      </div>

      {remaining > 0 && !expanded && (
        <Button variant="ghost" size="sm" className="px-0 h-8 mt-1 text-primary" onClick={() => setExpanded(true)}>
          ดูทั้งหมด {remaining} รูป <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      )}
      {expanded && urls.length > maxCollapsed && (
        <Button variant="ghost" size="sm" className="px-0 h-8 mt-1 text-primary" onClick={() => setExpanded(false)}>
          ย่อรูปภาพ <ChevronUp className="ml-1 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

/* ===================== Component ===================== */
const ProgressUpdate = () => {
  // UI
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Data
  const [rows, setRows] = useState<ProgressUpdateRow[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);

  // Dialog/Form
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);
  const [form, setForm] = useState<{
    id?: string;
    project_id: string;
    update_date: string;
    progress_percentage: number;
    description: string;
    photos_url: string[] | null;
    updated_by: string;
  }>({
    project_id: "",
    update_date: normalizeDate(new Date().toISOString().slice(0, 10)),
    progress_percentage: 0,
    description: "",
    photos_url: [],
    updated_by: "",
  });

  // selected files + previews
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setFilePreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  // Delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);

  /* ===================== Fetch ===================== */
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const p = await supabase
          .from("projects")
          .select("id, name, status, progress")
          .order("updated_at", { ascending: false });

        const u = await supabase
          .from("progress_updates")
          .select(
            "id, project_id, update_date, progress_percentage, description, photos_url, updated_by, created_at, projects:project_id ( id, name, status, progress )"
          )
          .order("created_at", { ascending: false });

        if (p.error) throw p.error;
        if (u.error) throw u.error;

        setProjects((p.data ?? []) as ProjectRow[]);
        setRows(normalizeRows((u.data ?? []) as unknown[]));
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        setErr(message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ===================== Derived ===================== */
  const projectOptions = useMemo(
    () => projects.map((p) => ({ id: p.id, name: p.name })).sort((a, b) => a.name.localeCompare(b.name)),
    [projects]
  );

  const filteredUpdates = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return rows.filter((r) => {
      const projectName = r.projects?.name?.toLowerCase() ?? "";
      const matchesSearch =
        !q ||
        projectName.includes(q) ||
        (r.updated_by || "").toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q);
      const matchesProject = projectFilter === "all" || r.project_id === projectFilter;
      return matchesSearch && matchesProject;
    });
  }, [rows, searchTerm, projectFilter]);

  const todayCount = useMemo(() => {
    const now = new Date(); const y = now.getFullYear(); const m = now.getMonth(); const d = now.getDate();
    return rows.filter((r) => {
      const dt = new Date(`${r.update_date}T00:00:00`);
      return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d;
    }).length;
  }, [rows]);

  const avgProgress = useMemo(() => {
    if (!rows.length) return 0;
    const total = rows.reduce((sum, r) => sum + (r.progress_percentage || 0), 0);
    return Math.round(total / rows.length);
  }, [rows]);

  /* ===================== Create / Edit ===================== */
  const openCreate = () => {
    setDialogMode("create");
    setFormErr(null);
    setForm({
      id: undefined,
      project_id: "",
      update_date: normalizeDate(new Date().toISOString().slice(0, 10)),
      progress_percentage: 0,
      description: "",
      photos_url: [],
      updated_by: "",
    });
    setFiles([]);
    setDialogOpen(true);
  };

  const openEdit = (row: ProgressUpdateRow) => {
    setDialogMode("edit");
    setFormErr(null);
    setForm({
      id: row.id,
      project_id: row.project_id,
      update_date: row.update_date,
      progress_percentage: row.progress_percentage,
      description: row.description,
      photos_url: Array.isArray(row.photos_url) ? [...row.photos_url] : [],
      updated_by: row.updated_by,
    });
    setFiles([]);
    setDialogOpen(true);
  };

  const closeDialog = () => setDialogOpen(false);

  const handleSave = async () => {
    setFormErr(null);

    const safe = {
      id: form.id,
      project_id: form.project_id,
      update_date: normalizeDate(form.update_date || new Date().toISOString().slice(0, 10)),
      progress_percentage: clampPercent(form.progress_percentage),
      description: (form.description || "").trim(),
      photos_url: Array.isArray(form.photos_url) ? [...form.photos_url] : [],
      updated_by: (form.updated_by || "").trim() || "ไม่ระบุ",
    };

    if (!safe.project_id) { setFormErr("กรุณาเลือกโครงการ"); return; }

    try {
      // upload files if any
      if (files.length) {
        const urls = await uploadManyAndGetPublicUrls(files);
        safe.photos_url.push(...urls);
      }

      if (dialogMode === "create") {
        const res = await supabase
          .from("progress_updates")
          .insert({
            project_id: safe.project_id,
            update_date: safe.update_date,
            progress_percentage: safe.progress_percentage,
            description: safe.description,
            photos_url: safe.photos_url,
            updated_by: safe.updated_by,
          })
          .select(
            "id, project_id, update_date, progress_percentage, description, photos_url, updated_by, created_at, projects:project_id ( id, name, status, progress )"
          )
          .single();

        if (res.error) throw res.error;

        const newRow = normalizeRow(res.data as unknown);
        setRows((prev) => [newRow, ...prev]);
        setDialogOpen(false);
      } else {
        setRows((curr) => curr.map((r) => (r.id === safe.id ? { ...r, ...safe } : r)));

        const resU = await supabase
          .from("progress_updates")
          .update({
            project_id: safe.project_id,
            update_date: safe.update_date,
            progress_percentage: safe.progress_percentage,
            description: safe.description,
            photos_url: safe.photos_url,
            updated_by: safe.updated_by,
          })
          .eq("id", safe.id as string)
          .select(
            "id, project_id, update_date, progress_percentage, description, photos_url, updated_by, created_at, projects:project_id ( id, name, status, progress )"
          )
          .single();

        if (resU.error) throw resU.error;

        const updated = normalizeRow(resU.data as unknown);
        setRows((curr) => curr.map((r) => (r.id === updated.id ? updated : r)));
        setDialogOpen(false);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setFormErr(message);
    } finally {
      setFiles([]);
      setSaving(false);
    }
  };

  /* ===================== Delete ===================== */
  const askDelete = (id: string) => { setTargetId(id); setDeleteOpen(true); };

  const confirmDelete = async () => {
    if (!targetId) return;
    setDeleting(true);
    setErr(null);
    const prev = rows;
    setRows((curr) => curr.filter((r) => r.id !== targetId));
    try {
      const { error } = await supabase.from("progress_updates").delete().eq("id", targetId);
      if (error) { setRows(prev); throw error; }
      setDeleteOpen(false);
      setTargetId(null);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setErr(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Navigation />
          </div>

          {/* Main */}
          <div className="lg:col-span-3 space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-primary">อัปเดตความคืบหน้า</h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">บันทึกและติดตามความคืบหน้าในแต่ละโครงการ</p>
              </div>
              <div className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-gradient-accent text-accent-foreground shadow-construction" onClick={openCreate}>
                  <Plus className="mr-2 h-4 w-4" /> อัปเดตใหม่
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <Card className="bg-gradient-card shadow-card-custom border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-primary">{rows.length}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">อัปเดตทั้งหมด</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card shadow-card-custom border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-success">{todayCount}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">อัปเดตวันนี้</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card shadow-card-custom border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-accent">{avgProgress}%</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">ความคืบหน้าเฉลี่ย</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card shadow-card-custom border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-primary">{projectOptions.length}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">จำนวนโครงการ</div>
                </CardContent>
              </Card>
            </div>

            {/* Search + Filter + List */}
            <Card className="bg-gradient-card shadow-card-custom border-0">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-primary">รายการอัปเดต</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="ค้นหาโครงการ, ผู้อัปเดต หรือรายละเอียดงาน..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={projectFilter} onValueChange={(v) => setProjectFilter(v)}>
                    <SelectTrigger className="w-full sm:w-[240px]">
                      <SelectValue placeholder="กรองตามโครงการ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกโครงการ</SelectItem>
                      {projectOptions.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {loading && <div className="text-center py-10 sm:py-12 text-muted-foreground">กำลังโหลดข้อมูล…</div>}

                  {!loading && filteredUpdates.map((u) => (
                    <Card key={u.id} className="bg-gradient-card shadow-card-custom border-0 hover:shadow-elevated transition-all duration-300">
                      <CardContent className="p-4 sm:p-6">
                        {/* Header of card */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-primary text-base sm:text-lg truncate">
                              {u.projects?.name || "(ไม่พบชื่อโครงการ)"}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs sm:text-sm text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <User className="h-4 w-4" /> {u.updated_by}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-4 w-4" /> {formatDate(u.update_date)}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            <Badge className={`px-2 py-0.5 text-[11px] sm:text-xs ${statusBadgeClass(u.projects?.status)}`}>
                              {statusText(u.projects?.status)}
                            </Badge>
                          </div>
                        </div>

                        {/* Progress + Description */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-3 sm:mb-4">
                          <div>
                            <h4 className="font-medium text-primary mb-2 text-sm sm:text-base">ความคืบหน้า:</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs sm:text-sm">
                                <span>รอบนี้: {u.progress_percentage}%</span>
                                <span className="font-medium text-success">สถานะโครงการ: {u.projects?.progress ?? "-"}%</span>
                              </div>
                              <Progress value={u.progress_percentage} className="h-2.5 sm:h-3" />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-primary mb-2 text-sm sm:text-base">รายละเอียด:</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{u.description}</p>
                          </div>
                        </div>

                        {/* Gallery */}
                        {Array.isArray(u.photos_url) && u.photos_url.length > 0 && (
                          <PhotoGrid urls={u.photos_url} maxCollapsed={4} />
                        )}

                        {/* Footer */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 sm:pt-4 border-t border-border">
                          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                            <span>รูปภาพ: {u.photos_url?.length ?? 0} รูป</span>
                            <span className="break-all">รหัส: {u.id}</span>
                          </div>
                          <div className="flex flex-col xs:flex-row gap-2">
                            <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => openEdit(u)}>
                              <Edit className="mr-1 h-3 w-3" /> แก้ไข
                            </Button>
                            <Button size="sm" variant="destructive" className="w-full sm:w-auto" onClick={() => askDelete(u.id)}>
                              <Trash2 className="mr-1 h-3 w-3" /> ลบ
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {!loading && filteredUpdates.length === 0 && (
                    <div className="text-center py-10 sm:py-12">
                      <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                      <div className="text-sm sm:text-base text-muted-foreground">ไม่พบรายการอัปเดตที่ตรงกับการค้นหา</div>
                    </div>
                  )}

                  {err && (
                    <div className="mt-4 p-3 rounded border border-destructive/30 bg-destructive/10 text-destructive text-sm">
                      {err}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ======= Edit/Create Dialog ======= */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">{dialogMode === "edit" ? "แก้ไขความคืบหน้า" : "บันทึกความคืบหน้าใหม่"}</DialogTitle>
            <DialogDescription className="text-sm">{dialogMode === "edit" ? "ปรับปรุงข้อมูลแล้วกดบันทึก" : "กรอกข้อมูลให้ครบถ้วนแล้วกดบันทึก"}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 sm:py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="project">โครงการ</Label>
                <Select value={form.project_id} onValueChange={(v) => setForm((f) => ({ ...f, project_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="เลือกโครงการ" /></SelectTrigger>
                  <SelectContent>
                    {projectOptions.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="update_date">วันที่อัปเดต</Label>
                <Input id="update_date" type="date" value={form.update_date} onChange={(e) => setForm((f) => ({ ...f, update_date: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="progress_percentage">เปอร์เซ็นต์ความคืบหน้า (%)</Label>
                <Input
                  id="progress_percentage"
                  type="number"
                  min={0}
                  max={100}
                  value={form.progress_percentage}
                  onChange={(e) => setForm((f) => ({ ...f, progress_percentage: clampPercent(e.target.value) }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="updated_by">ผู้อัปเดต</Label>
                <Input id="updated_by" value={form.updated_by} onChange={(e) => setForm((f) => ({ ...f, updated_by: e.target.value }))} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">รายละเอียดงานที่ทำ</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>

            {/* Upload images */}
            <div className="grid gap-2">
              <Label htmlFor="photos">รูปภาพประกอบ</Label>
              <Input id="photos" type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />

              {/* previews of newly selected files */}
              {filePreviews.length > 0 && (
                <>
                  <div className="text-xs text-muted-foreground">พรีวิวไฟล์ใหม่: {filePreviews.length} รูป</div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {filePreviews.map((src, i) => (
                      <div key={i} className="relative group rounded overflow-hidden border border-border">
                        <img src={src} alt={`preview-${i}`} className="w-full h-20 sm:h-24 object-cover" />
                        <button
                          type="button"
                          onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition text-[11px] px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground"
                          aria-label="remove selected file"
                        >
                          ลบ
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="text-xs text-muted-foreground mt-1">
                URLs ที่บันทึกไว้แล้ว: {form.photos_url?.length ?? 0} รูป
              </div>

              {Boolean(form.photos_url?.length) && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {form.photos_url!.map((url, i) => (
                    <div key={i} className="relative group rounded overflow-hidden border border-border">
                      <a href={url} target="_blank" rel="noreferrer" title={url}>
                        <img src={url} alt={`uploaded-${i}`} className="w-full h-20 sm:h-24 object-cover" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, photos_url: (f.photos_url || []).filter((_, idx) => idx !== i) }))}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition text-[11px] px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground"
                      >
                        เอาออก
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {formErr && (
              <div className="p-2 rounded border border-destructive/30 bg-destructive/10 text-destructive text-xs">{formErr}</div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button variant="outline" className="w-full sm:w-auto" onClick={closeDialog} disabled={saving}>ยกเลิก</Button>
            <Button className="w-full sm:w-auto bg-gradient-primary" onClick={handleSave} disabled={saving}>
              {saving ? "กำลังบันทึก…" : "บันทึกข้อมูล"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ======= Delete Confirm ======= */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ลบรายการอัปเดต</DialogTitle>
            <DialogDescription>คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? การกระทำนี้ไม่สามารถย้อนกลับได้</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setDeleteOpen(false)} disabled={deleting}>ยกเลิก</Button>
            <Button variant="destructive" className="w-full sm:w-auto" onClick={confirmDelete} disabled={deleting}>
              {deleting ? "กำลังลบ…" : "ลบ"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProgressUpdate;
