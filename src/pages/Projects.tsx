import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import ProjectCard from "@/components/ProjectCard";
import AddProjectDialog from "@/components/AddProjectDialog";
import { Search } from "lucide-react";
import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";

/** ---------- Types ---------- */
type ProjectStatus = "active" | "pending" | "completed";

type Project = {
  id: string;
  name: string;
  location: string;
  status: ProjectStatus;
  progress: number;
  start_date: string; // ISO
  end_date: string;   // ISO
  team_size: number;
  budget: number;
};

type StatusFilter = ProjectStatus | "all";

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // ถ้า useProjects ยังไม่ได้ใส่ generic/return type ไว้
  // ให้ assert type ที่นี่เพื่อหลีกเลี่ยง any
  const { projects, loading } = useProjects() as {
    projects: Project[];
    loading: boolean;
  };

  const filteredProjects = projects.filter((project) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      project.name.toLowerCase().includes(q) ||
      project.location.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusCount = (status: StatusFilter): number => {
    if (status === "all") return projects.length;
    return projects.filter((p) => p.status === status).length;
  };

  const formatDate = (dateStr: string): string =>
    new Date(dateStr).toLocaleDateString("th-TH");

  const formatBudget = (budget: number): string =>
    new Intl.NumberFormat("th-TH").format(budget);

  return (
    <div className="min-h-screen bg-background ">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Navigation />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-primary">จัดการโครงการ</h1>
                <p className="text-muted-foreground mt-1">
                  ดูและจัดการโครงการก่อสร้างทั้งหมด
                </p>
              </div>
              <AddProjectDialog />
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-card shadow-card-custom border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {getStatusCount("all")}
                  </div>
                  <div className="text-sm text-muted-foreground">โครงการทั้งหมด</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card shadow-card-custom border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-success">
                    {getStatusCount("active")}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">กำลังดำเนินการ</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card shadow-card-custom border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-warning">
                    {getStatusCount("pending")}
                  </div>
                  <div className="text-sm text-muted-foreground">รอเริ่มงาน</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card shadow-card-custom border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {getStatusCount("completed")}
                  </div>
                  <div className="text-sm text-muted-foreground">เสร็จสิ้น</div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <Card className="bg-gradient-card shadow-card-custom border-0">
              <CardHeader>
                <CardTitle className="text-primary">รายการโครงการ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="ค้นหาโครงการหรือสถานที่..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <Select
                    value={statusFilter}
                    onValueChange={(v: StatusFilter) => setStatusFilter(v)}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="กรองตามสถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทั้งหมด</SelectItem>
                      <SelectItem value="active">กำลังดำเนินการ</SelectItem>
                      <SelectItem value="pending">รอเริ่มงาน</SelectItem>
                      <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Projects Grid */}
                {loading ? (
                  <div className="text-center py-12">
                    <div className="text-muted-foreground">กำลังโหลดข้อมูล...</div>
                  </div>
                ) : (
                  <>
                    {filteredProjects.length > 0 ? (
                      <div className="grid gap-6 md:grid-cols-2">
                        {filteredProjects.map((project) => (
                          <ProjectCard
                            key={project.id}
                            id={project.id}
                            name={project.name}
                            location={project.location}
                            status={project.status} 
                            progress={project.progress}
                            startDate={formatDate(project.start_date)}
                            endDate={formatDate(project.end_date)}
                            teamSize={project.team_size}
                            budget={formatBudget(project.budget)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-muted-foreground">
                          ไม่พบโครงการที่ตรงกับการค้นหา
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
