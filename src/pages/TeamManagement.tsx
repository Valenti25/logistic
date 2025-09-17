"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import {
  Search,
  Plus,
  Users,
  Phone,
  Mail,
  Edit,
  Trash2,
  UserCheck,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react"; // เปลี่ยนชื่อไอคอนกันชนกับ Calendar component

/**
 * =============================================
 *  Supabase Table & RLS (รันใน SQL Editor)
 * =============================================
 * ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS avatar_url text;
 *
 * -- Storage bucket: `logistic` (ตั้งเป็น Public เพื่อความง่าย)
 * -- Policies (Storage):
 * create policy if not exists "public read logistic"
 * on storage.objects for select using (bucket_id = 'logistic');
 *
 * create policy if not exists "auth upload logistic"
 * on storage.objects for insert to authenticated
 * with check (bucket_id = 'logistic' and owner = auth.uid());
 *
 * create policy if not exists "auth update own logistic"
 * on storage.objects for update to authenticated
 * using (bucket_id = 'logistic' and owner = auth.uid());
 *
 * create policy if not exists "auth delete own logistic"
 * on storage.objects for delete to authenticated
 * using (bucket_id = 'logistic' and owner = auth.uid());
 *
 * -- หาก bucket เป็น Private ให้เปลี่ยนมาใช้ signed URL แทน getPublicUrl ด้านล่าง
 */

/* ===================== Supabase client ===================== */
function getEnv(name: string): string {
  if (typeof process !== "undefined" && process.env?.[name])
    return String(process.env[name]);
  if (typeof import.meta !== "undefined" && import.meta?.env?.[name]) {
    return String(import.meta.env[name]);
  }
  return "";
}
function parseDateStr(s?: string | null): Date | undefined {
  if (!s) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(`${s}T00:00:00`);
    return isNaN(+d) ? undefined : d;
  }
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) {
    const [, dd, mm, yyyy] = m;
    const d = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
    return isNaN(+d) ? undefined : d;
  }
  return undefined;
}
const toYmd = (d?: Date | null) => (d ? d.toISOString().slice(0, 10) : "");
const supabaseUrl =
  getEnv("NEXT_PUBLIC_SUPABASE_URL") || getEnv("VITE_SUPABASE_URL");
const supabaseAnonKey =
  getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
  getEnv("VITE_SUPABASE_PUBLISHABLE_KEY");
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ===================== LocalStorage Keys ===================== */
const LS_MEMBERS_KEY = "tm.members.v1";
const LS_FORM_DRAFT_KEY = "tm.formDraft.v1";

/* ===================== DB Types ===================== */
type MemberStatus = "active" | "on-leave" | "inactive";

type TeamMemberRow = {
  id: string; // PK (เช่น TM001)
  name: string;
  role: string;
  specialty: string | null;
  phone: string | null;
  email: string | null;
  projects: string[] | null;
  status: MemberStatus;
  join_date: string | null; // date (YYYY-MM-DD)
  experience: string | null;
  avatar_url: string | null;
  last_update: string | null; // date (YYYY-MM-DD)
  created_at: string | null;
  updated_at: string | null;
};

/* ===================== UI Types ===================== */
export type TeamMember = {
  id: string;
  name: string;
  role: string;
  specialty: string;
  phone: string;
  email: string;
  projects: string[];
  status: MemberStatus;
  join_date: string | null;
  experience: string;
  avatar_url?: string | null;
  last_update: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

/* ===================== UI Helpers ===================== */
const getStatusColor = (status: TeamMember["status"]) => {
  switch (status) {
    case "active":
      return "bg-success text-success-foreground";
    case "on-leave":
      return "bg-warning text-warning-foreground";
    case "inactive":
      return "bg-destructive text-destructive-foreground";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

const getStatusText = (status: TeamMember["status"]) => {
  switch (status) {
    case "active":
      return "ปฏิบัติงาน";
    case "on-leave":
      return "ลาพัก";
    case "inactive":
      return "ไม่ปฏิบัติงาน";
  }
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase();

/* ===================== Component ===================== */
export default function TeamManagement() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // ฟิลด์ไฟล์รูป
  const [file, setFile] = useState<File | null>(null);

  // form states
  const emptyForm: TeamMember = {
    id: "",
    name: "",
    role: "",
    specialty: "",
    phone: "",
    email: "",
    projects: [],
    status: "active",
    join_date: "",
    experience: "",
    avatar_url: null,
    last_update: "",
    created_at: null,
    updated_at: null,
  };
  const [form, setForm] = useState<TeamMember>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const roles = useMemo<string[]>(
    () => Array.from(new Set(members.map((m) => m.role))).filter(Boolean),
    [members]
  );

  const filteredMembers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return members.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.specialty.toLowerCase().includes(q);
      const matchesRole = roleFilter === "all" || m.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [members, searchTerm, roleFilter]);

  const getStatusCount = (status: TeamMember["status"]) =>
    members.filter((m) => m.status === status).length;

  /* ========== CRUD ========== */
  const mapRowToUi = (row: TeamMemberRow): TeamMember => ({
    id: row.id,
    name: row.name,
    role: row.role,
    specialty: row.specialty ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    projects: row.projects ?? [],
    status: row.status,
    join_date: row.join_date,
    experience: row.experience ?? "",
    avatar_url: row.avatar_url,
    last_update: row.last_update,
    created_at: row.created_at,
    updated_at: row.updated_at,
  });

  const mapUiToRow = (ui: TeamMember): TeamMemberRow => ({
    id: ui.id,
    name: ui.name,
    role: ui.role,
    specialty: ui.specialty || null,
    phone: ui.phone || null,
    email: ui.email || null,
    projects: (ui.projects || []).map((p) => p.trim()).filter(Boolean),
    status: ui.status,
    join_date: normalizeDate(ui.join_date),
    experience: ui.experience || null,
    avatar_url: ui.avatar_url ?? null,
    last_update: normalizeDate(ui.last_update),
    created_at: ui.created_at ?? null,
    updated_at: ui.updated_at ?? null,
  });

  const fetchMembers = async (): Promise<void> => {
    setLoading(true);
    const { data, error } = await supabase
      .from("team_members") // ไม่ใช้ generic ที่นี่
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("fetch error", error);
    } else {
      const rows = (data ?? []) as TeamMemberRow[]; // cast ที่ boundary
      setMembers(rows.map(mapRowToUi));
    }
    setLoading(false);
  };

  /* ===================== Persistence (members) ===================== */
  useEffect(() => {
    // 1) โหลด cache รายชื่อมาก่อน
    try {
      const cached = localStorage.getItem(LS_MEMBERS_KEY);
      if (cached) {
        const parsed: unknown = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const safe = parsed
            .map((x) => x as Partial<TeamMember>)
            .filter(
              (x): x is TeamMember =>
                typeof x?.id === "string" && typeof x?.name === "string"
            );
          setMembers(safe);
        }
      }
    } catch {
      // ignore
    }

    // 2) sync จาก Supabase
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_MEMBERS_KEY, JSON.stringify(members));
    } catch {
      // ignore
    }
  }, [members]);

  /* ===================== Persistence (form draft) ===================== */
  useEffect(() => {
    if (openDialog && !editingId) {
      try {
        const draft = localStorage.getItem(LS_FORM_DRAFT_KEY);
        if (draft) {
          const parsed = JSON.parse(draft) as Partial<TeamMember>;
          setForm({ ...emptyForm, ...parsed });
        }
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openDialog, editingId]);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(LS_FORM_DRAFT_KEY, JSON.stringify(form));
      } catch {
        // ignore
      }
    }, 200);
    return () => clearTimeout(t);
  }, [form]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(LS_FORM_DRAFT_KEY);
    } catch {
      // ignore
    }
  };

  /* ===================== Warn on unload when unsaved ===================== */
  useEffect(() => {
    const hasUnsaved = !!(
      form.id ||
      form.name ||
      form.role ||
      form.specialty ||
      form.phone ||
      form.email ||
      (form.projects?.length || 0) > 0 ||
      file
    );
    const handler = (e: BeforeUnloadEvent) => {
      if (!hasUnsaved) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [form, file]);

  /* ===================== Keep Supabase session & refetch on auth changes ===================== */
  useEffect(() => {
    supabase.auth.getSession().then(() => {
      /* restore session */
    });
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      fetchMembers();
    });
    return () => {
      sub?.subscription?.unsubscribe();
    };
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFile(null);
  };

  const openCreate = () => {
    resetForm();
    setOpenDialog(true);
  };

  const openEdit = (member: TeamMember) => {
    setForm({ ...member });
    setEditingId(member.id);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบสมาชิกคนนี้หรือไม่?")) return;
    const prev = members;
    setMembers((m) => m.filter((x) => x.id !== id));
    const { error } = await supabase.from("team_members").delete().eq("id", id);
    if (error) {
      alert("ลบไม่สำเร็จ: " + error.message);
      setMembers(prev);
    }
  };

  function normalizeDate(d?: string | null): string | null {
    if (!d) return null;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
      const [dd, mm, yy] = d.split("/");
      return `${yy}-${mm}-${dd}`;
    }
    return d;
  }

  /* ===================== Upload to Storage (Public bucket) ===================== */
  async function uploadToStorageAndGetPublicUrl(
    file: File
  ): Promise<{ path: string; publicUrl: string }> {
    const ext = (file.name.split(".").pop() || "bin").toLowerCase();
    const filename = `${crypto.randomUUID()}.${ext}`;
    const path = `public/${filename}`;

    const { error: uploadErr } = await supabase.storage
      .from("logistic")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "application/octet-stream",
      });

    if (uploadErr) throw uploadErr;

    const { data } = supabase.storage.from("logistic").getPublicUrl(path);
    return { path, publicUrl: data.publicUrl };
  }

  const handleSave = async () => {
    if (!form.id.trim()) return alert("กรุณากรอกรหัสพนักงาน เช่น TM005");
    if (!form.name.trim()) return alert("กรุณากรอกชื่อ-นามสกุล");
    if (!form.role.trim()) return alert("กรุณาเลือกตำแหน่ง");

    let avatarUrlToSave: string | null = form.avatar_url ?? null;

    if (file) {
      try {
        const { publicUrl } = await uploadToStorageAndGetPublicUrl(file);
        avatarUrlToSave = publicUrl;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        alert("อัปโหลดไฟล์ไม่สำเร็จ: " + msg);
        return;
      }
    }

    const rowPayload: TeamMemberRow = mapUiToRow({
      ...form,
      avatar_url: avatarUrlToSave,
      projects: (form.projects || []).map((p) => p.trim()).filter(Boolean),
      join_date: normalizeDate(form.join_date),
      last_update: normalizeDate(form.last_update),
    });

    if (editingId) {
      const prev = members;
      setMembers((m) =>
        m.map((x) => (x.id === editingId ? mapRowToUi(rowPayload) : x))
      );
      const { error } = await supabase
        .from("team_members") // ไม่ใช้ generic
        .update(rowPayload)
        .eq("id", editingId);
      if (error) {
        alert("บันทึกไม่สำเร็จ: " + error.message);
        setMembers(prev);
        return;
      }
    } else {
      const prev = members;
      setMembers((m) => [...m, mapRowToUi(rowPayload)]);
      const { error } = await supabase
        .from("team_members") // ไม่ใช้ generic
        .insert([rowPayload]); // ใส่ array ปลอดภัยกว่า
      if (error) {
        alert("เพิ่มไม่สำเร็จ: " + error.message);
        setMembers(prev);
        return;
      }
    }

    setOpenDialog(false);
    clearDraft();
    resetForm();
    fetchMembers();
  };

  /* ===================== Render ===================== */
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
                <h1 className="text-2xl sm:text-3xl font-bold text-primary">
                  จัดการทีมงาน
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  จัดการข้อมูลช่างและทีมงานในระบบ
                </p>
              </div>

              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full sm:w-auto bg-gradient-accent text-accent-foreground shadow-construction"
                    onClick={openCreate}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    เพิ่มสมาชิกใหม่
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingId ? "แก้ไขสมาชิกทีม" : "เพิ่มสมาชิกทีมใหม่"}
                    </DialogTitle>
                    <DialogDescription>
                      กรอกข้อมูลสมาชิกทีมงาน
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-2 sm:py-4">
                    {/* กลุ่มฟอร์ม: มือถือ 1 คอลัมน์, ≥sm เป็น 2 คอลัมน์ */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="id">รหัส (เช่น TM005)</Label>
                        <Input
                          id="id"
                          placeholder="TM005"
                          value={form.id}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, id: e.target.value }))
                          }
                          disabled={!!editingId}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                        <Input
                          id="name"
                          placeholder="ชื่อ นามสกุล"
                          value={form.name}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, name: e.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="role">ตำแหน่ง</Label>
                        <Select
                          value={form.role}
                          onValueChange={(v: string) =>
                            setForm((f) => ({ ...f, role: v }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกตำแหน่ง" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="หัวหน้าช่าง">
                              หัวหน้าช่าง
                            </SelectItem>
                            <SelectItem value="ช่างปูน">ช่างปูน</SelectItem>
                            <SelectItem value="ช่างเหล็ก">ช่างเหล็ก</SelectItem>
                            <SelectItem value="ช่างไฟฟ้า">ช่างไฟฟ้า</SelectItem>
                            <SelectItem value="ช่างประปา">ช่างประปา</SelectItem>
                            <SelectItem value="หัวหน้าโครงการ">
                              หัวหน้าโครงการ
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="specialty">ความเชี่ยวชาญ</Label>
                        <Input
                          id="specialty"
                          placeholder="เช่น งานโครงสร้าง, งานก่ออิฐ"
                          value={form.specialty}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              specialty: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="experience">ประสบการณ์</Label>
                        <Input
                          id="experience"
                          placeholder="เช่น 6 ปี"
                          value={form.experience}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              experience: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="status">สถานะ</Label>
                        <Select
                          value={form.status}
                          onValueChange={(v: MemberStatus) =>
                            setForm((f) => ({ ...f, status: v }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">ปฏิบัติงาน</SelectItem>
                            <SelectItem value="on-leave">ลาพัก</SelectItem>
                            <SelectItem value="inactive">
                              ไม่ปฏิบัติงาน
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                        <Input
                          id="phone"
                          placeholder="081-234-5678"
                          value={form.phone}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, phone: e.target.value }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">อีเมล</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="example@construction.com"
                          value={form.email}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, email: e.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <Label htmlFor="join_date">วันที่เริ่มงาน</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          id="join_date"
                          type="button"
                          className={cn(
                            "inline-flex w-full items-center justify-start gap-2 rounded-md border bg-background px-3 py-2 text-left",
                            !form.join_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="h-4 w-4 opacity-70" />
                          {form.join_date
                            ? format(
                                new Date(`${form.join_date}T00:00:00`),
                                "dd/MM/yyyy",
                                { locale: th }
                              )
                            : "เลือกวันที่"}
                        </button>
                      </PopoverTrigger>

                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          locale={th}
                          selected={
                            form.join_date
                              ? new Date(`${form.join_date}T00:00:00`)
                              : undefined
                          }
                          onSelect={(d) =>
                            setForm((f) => ({
                              ...f,
                              join_date: d ? d.toISOString().slice(0, 10) : "",
                            }))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <div className="grid gap-2">
                      <Label htmlFor="projects">
                        โครงการที่รับผิดชอบ (คั่นด้วย ,)
                      </Label>
                      <Input
                        id="projects"
                        placeholder="ศูนย์การค้าคอมมูนิตี้มอลล์, โครงการหมู่บ้านจัดสรรลักซ์ชูรี่"
                        value={form.projects.join(", ")}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            projects: e.target.value
                              .split(",")
                              .map((s) => s.trim()),
                          }))
                        }
                      />
                    </div>

                    {/* Upload avatar file */}
                    <div className="grid gap-2">
                      <Label htmlFor="avatarFile">
                        รูปโปรไฟล์ (อัปโหลดไฟล์)
                      </Label>
                      <Input
                        id="avatarFile"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      />
                      {file && (
                        <div className="text-xs text-muted-foreground">
                          ไฟล์ที่เลือก: {file.name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => {
                        setOpenDialog(false);
                        clearDraft();
                      }}
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      className="w-full sm:w-auto bg-gradient-primary min-h-9"
                      onClick={handleSave}
                    >
                      {editingId ? "บันทึกการแก้ไข" : "บันทึกข้อมูล"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <Card className="bg-gradient-card shadow-card-custom border-0">
                <CardContent className="p-5 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-primary">
                    {members.length}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    สมาชิกทั้งหมด
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card shadow-card-custom border-0">
                <CardContent className="p-5 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-success">
                    {getStatusCount("active")}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    ปฏิบัติงาน
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card shadow-card-custom border-0">
                <CardContent className="p-5 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-warning">
                    {getStatusCount("on-leave")}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    ลาพัก
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card shadow-card-custom border-0">
                <CardContent className="p-5 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-destructive">
                    {getStatusCount("inactive")}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    ไม่ปฏิบัติงาน
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search + Filter */}
            <Card className="bg-gradient-card shadow-card-custom border-0">
              <CardHeader>
                <CardTitle className="text-primary">รายชื่อทีมงาน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="ค้นหาชื่อ, ตำแหน่ง หรือความเชี่ยวชาญ..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select
                    value={roleFilter}
                    onValueChange={(v: string) => setRoleFilter(v)}
                  >
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="กรองตามตำแหน่ง" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกตำแหน่ง</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* List */}
                <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
                  {filteredMembers.map((member) => (
                    <Card
                      key={member.id}
                      className="bg-gradient-card shadow-card-custom border-0 hover:shadow-elevated transition-all duration-300"
                    >
                      <CardContent className="p-5 sm:p-6">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                            <AvatarImage
                              src={member.avatar_url ?? undefined}
                              alt={member.name}
                            />
                            <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2 gap-2">
                              <div className="min-w-0">
                                <h3 className="font-semibold text-primary truncate">
                                  {member.name}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate">
                                  {member.role}
                                </p>
                              </div>
                              <Badge className={getStatusColor(member.status)}>
                                {getStatusText(member.status)}
                              </Badge>
                            </div>

                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 min-w-0">
                                <UserCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="truncate">
                                  {member.specialty}
                                  {member.experience
                                    ? ` • ${member.experience}`
                                    : ""}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="truncate">{member.phone}</span>
                              </div>
                              <div className="flex items-center gap-2 min-w-0">
                                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="truncate">{member.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="truncate">
                                  เริ่มงาน: {member.join_date || "-"}
                                </span>
                              </div>
                            </div>

                            <div className="mt-3">
                              <h4 className="text-sm font-medium text-primary mb-1">
                                โครงการที่รับผิดชอบ:
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {(member.projects || []).map((p, i) => (
                                  <Badge
                                    key={`${member.id}-p-${i}`}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {p}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4 pt-3 border-t border-border">
                              <span className="text-xs text-muted-foreground">
                                อัปเดตล่าสุด: {member.last_update || "-"}
                              </span>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full sm:w-auto min-h-9"
                                  onClick={() => openEdit(member)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full sm:w-auto text-destructive hover:text-destructive min-h-9"
                                  onClick={() => handleDelete(member.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {!loading && filteredMembers.length === 0 && (
                  <div className="text-center py-10 sm:py-12">
                    <Users className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                    <div className="text-sm sm:text-base text-muted-foreground">
                      ไม่พบสมาชิกทีมที่ตรงกับการค้นหา
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="text-center py-10 sm:py-12 text-muted-foreground">
                    กำลังโหลดข้อมูล…
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
