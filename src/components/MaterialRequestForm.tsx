import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { useMaterialRequests } from "@/hooks/useMaterialRequests";
import { useProjects } from "@/hooks/useProjects";

/* ===== Types (ไม่มี any) ===== */
type Urgency = "low" | "normal" | "high";
type RequestStatus = "pending" | "approved" | "rejected";

interface MaterialRequestFormData {
  project_id: string;
  requester_name: string;
  request_date: string; // YYYY-MM-DD
  status: RequestStatus;
  urgency: Urgency;
  notes: string;
}

interface MaterialRequestItem {
  item_name: string;
  quantity: number;
  unit: string;
}

/** ใช้ขั้นต่ำเฉพาะ field ที่ component นี้ต้องใช้ */
interface MinimalProject {
  id: string;
  name: string;
}

interface MaterialRequestFormProps {
  children?: React.ReactNode;
}

const MaterialRequestForm = ({ children }: MaterialRequestFormProps) => {
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState<MaterialRequestFormData>({
    project_id: "",
    requester_name: "",
    request_date: new Date().toISOString().split("T")[0],
    status: "pending",
    urgency: "normal",
    notes: "",
  });

  const [items, setItems] = useState<MaterialRequestItem[]>([
    { item_name: "", quantity: 1, unit: "" },
  ]);

  const { createMaterialRequest } = useMaterialRequests();

  // ถ้า useProjects ไม่มีประเภทชัดเจน ให้แคสต์แบบขั้นต่ำเพื่อเลี่ยง any
  const { projects } = useProjects() as { projects: MinimalProject[] };

  /* ===== Handlers (type-safe) ===== */
  const updateFormData = <K extends keyof MaterialRequestFormData>(
    field: K,
    value: MaterialRequestFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = <K extends keyof MaterialRequestItem>(
    index: number,
    field: K,
    value: MaterialRequestItem[K]
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, { item_name: "", quantity: 1, unit: "" }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validItems = items.filter(
      (it) => it.item_name.trim() && it.quantity > 0 && it.unit.trim()
    );

    if (validItems.length === 0) {
      alert("กรุณาเพิ่มรายการวัสดุอย่างน้อย 1 รายการ");
      return;
    }

    try {
      await createMaterialRequest(formData, validItems);
      // reset form
      setFormData({
        project_id: "",
        requester_name: "",
        request_date: new Date().toISOString().split("T")[0],
        status: "pending",
        urgency: "normal",
        notes: "",
      });
      setItems([{ item_name: "", quantity: 1, unit: "" }]);
      setOpen(false);
    } catch (error: unknown) {
      // ไม่ใช้ any: แปลงเป็นข้อความอย่างปลอดภัย
      const msg = error instanceof Error ? error.message : String(error);
      console.error("Error creating material request:", msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-gradient-accent text-accent-foreground shadow-construction">
            <Plus className="mr-2 h-4 w-4" />
            เบิกวัสดุใหม่
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>แบบฟอร์มเบิกวัสดุใหม่</DialogTitle>
          <DialogDescription>กรอกรายละเอียดการเบิกวัสดุและอุปกรณ์</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">โครงการ</Label>
              <Select
                value={formData.project_id}
                onValueChange={(value) => updateFormData("project_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกโครงการ" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requester_name">ผู้เบิก</Label>
              <Input
                id="requester_name"
                value={formData.requester_name}
                onChange={(e) => updateFormData("requester_name", e.target.value)}
                placeholder="ชื่อผู้เบิก"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="urgency">ความเร่งด่วน</Label>
              <Select
                value={formData.urgency}
                onValueChange={(value) => updateFormData("urgency", value as Urgency)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกระดับ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">ไม่เร่งด่วน</SelectItem>
                  <SelectItem value="normal">ปกติ</SelectItem>
                  <SelectItem value="high">เร่งด่วน</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="request_date">วันที่เบิก</Label>
              <Input
                id="request_date"
                type="date"
                value={formData.request_date}
                onChange={(e) => updateFormData("request_date", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>รายการวัสดุ</Label>
              <Button type="button" onClick={addItem} size="sm" variant="outline">
                <Plus className="mr-2 h-3 w-3" />
                เพิ่มรายการ
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <Input
                    placeholder="ชื่อวัสดุ"
                    value={item.item_name}
                    onChange={(e) =>
                      updateItem(index, "item_name", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="col-span-3">
                  <Input
                    type="number"
                    placeholder="จำนวน"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", Math.max(1, Number(e.target.value) || 0))
                    }
                    required
                  />
                </div>

                <div className="col-span-3">
                  <Input
                    placeholder="หน่วย"
                    value={item.unit}
                    onChange={(e) => updateItem(index, "unit", e.target.value)}
                    required
                  />
                </div>

                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    aria-label="ลบรายการ"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">หมายเหตุ</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateFormData("notes", e.target.value)}
              placeholder="รายละเอียดเพิ่มเติม..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              ส่งคำขอ
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialRequestForm;
