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
import { Plus } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";

interface AddProjectDialogProps {
  children?: React.ReactNode;
}

/* ----- แค่เพิ่มประเภทของฟอร์มและสถานะ ----- */
type ProjectStatus = "pending" | "active" | "completed";

type FormState = {
  name: string;
  location: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  start_date: string;
  end_date: string;
  team_size: number;
  budget: number;
};

const AddProjectDialog = ({ children }: AddProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<FormState>({
    name: "",
    location: "",
    description: "",
    status: "pending",
    progress: 0,
    start_date: "",
    end_date: "",
    team_size: 1,
    budget: 0,
  });

  const { createProject } = useProjects();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject(formData);
      setFormData({
        name: "",
        location: "",
        description: "",
        status: "pending",
        progress: 0,
        start_date: "",
        end_date: "",
        team_size: 1,
        budget: 0,
      });
      setOpen(false);
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  /* ----- แก้ตรงนี้: ไม่มี any แล้ว ใช้ generic ให้ type-safe ----- */
  const updateFormData = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-gradient-accent text-accent-foreground shadow-construction">
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มโครงการใหม่
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>เพิ่มโครงการใหม่</DialogTitle>
          <DialogDescription>
            สร้างโครงการใหม่และระบุรายละเอียดต่างๆ
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อโครงการ</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                placeholder="ระบุชื่อโครงการ"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">สถานที่</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => updateFormData("location", e.target.value)}
                placeholder="ระบุสถานที่"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">รายละเอียด</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              placeholder="อธิบายโครงการ..."
            />
          </div>

          <div className="grid gap-1 grid-cols-2">
            <div className="space-y-2 ">
              <Label htmlFor="start_date">วันที่เริ่ม</Label>
              <Input
              className="p-1"
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => updateFormData("start_date", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 ">
              <Label htmlFor="end_date">วันที่สิ้นสุด</Label>
              <Input
              className="p-1"
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => updateFormData("end_date", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">สถานะ</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  updateFormData("status", value as ProjectStatus) // แคสให้ตรง union
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">รอเริ่มงาน</SelectItem>
                  <SelectItem value="active">กำลังดำเนินการ</SelectItem>
                  <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="team_size">จำนวนทีม</Label>
              <Input
                id="team_size"
                type="number"
                min="1"
                value={formData.team_size}
                onChange={(e) =>
                  updateFormData("team_size", parseInt(e.target.value, 10) || 1)
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">งบประมาณ (บาท)</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                value={formData.budget}
                onChange={(e) =>
                  updateFormData("budget", parseInt(e.target.value, 10) || 0)
                }
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              สร้างโครงการ
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectDialog;
