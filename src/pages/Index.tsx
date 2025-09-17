import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatsCards from "@/components/StatsCards";
import ProjectCard from "@/components/ProjectCard";
import Navigation from "@/components/Navigation";
import AddProjectDialog from "@/components/AddProjectDialog";
import heroImage from "@/assets/construction-hero.jpg";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/hooks/useProjects";

/* ---------- Types ---------- */
type ProjectStatus = "active" | "pending" | "completed";

type Project = {
  id: string;
  name: string;
  location: string;
  status: ProjectStatus;
  progress: number;
  start_date: string; // ISO string
  end_date: string;   // ISO string
  team_size: number;
  budget: number;
};

const Index = () => {
  // ระบุชนิดผลลัพธ์จาก hook ให้ชัด เพื่อเลี่ยง any
  const { projects } = useProjects() as { projects: Project[] };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("th-TH");

  const formatBudget = (budget: number) =>
    new Intl.NumberFormat("th-TH").format(budget);

  const displayProjects = projects.slice(0, 4);

  // รองรับทั้ง Vite (string) และ Next (StaticImageData)
  const heroUrl =
    typeof heroImage === "string" ? heroImage : (heroImage as { src: string }).src;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-hero overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroUrl})` }}
        />
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
              ระบบบริหารโครงการก่อสร้าง
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              จัดการโครงการ อัพเดทยอดงาน และเบิกวัสดุได้อย่างมีประสิทธิภาพ
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <AddProjectDialog>
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-elevated"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  เพิ่มโครงการใหม่
                </Button>
              </AddProjectDialog>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Navigation />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats Cards */}
            <StatsCards />

            {/* Search and Filter */}
            <Card className="bg-gradient-card shadow-card-custom border-0">
              <CardHeader>
                <CardTitle className="text-primary">โครงการทั้งหมด</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input placeholder="ค้นหาโครงการ..." className="pl-10" />
                  </div>
                  <Button variant="outline">กรองตามสถานะ</Button>
                </div>

                {/* Projects Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                  {displayProjects.map((project) => (
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
