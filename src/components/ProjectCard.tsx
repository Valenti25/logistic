import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, MapPin, Users, Eye } from "lucide-react";

interface ProjectCardProps {
  id: string;
  name: string;
  location: string;
  status: "active" | "pending" | "completed";
  progress: number;
  startDate: string;
  endDate: string;
  teamSize: number;
  budget: string;
}

const ProjectCard = ({ 
  name, 
  location, 
  status, 
  progress, 
  startDate, 
  endDate, 
  teamSize, 
  budget 
}: ProjectCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success text-success-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      case "completed":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "กำลังดำเนินการ";
      case "pending":
        return "รอเริ่มงาน";
      case "completed":
        return "เสร็จสิ้น";
      default:
        return "ไม่ทราบสถานะ";
    }
  };

  return (
    <Card className="bg-gradient-card shadow-card-custom border-0 hover:shadow-elevated transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-semibold text-primary max-w-32">
            {name}
          </CardTitle>
          <Badge className={`${getStatusColor(status)} text-xs font-medium`}>
            {getStatusText(status)}
          </Badge>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-1 h-4 w-4" />
          {location}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">ความคืบหน้า</span>
            <span className="font-medium text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center text-muted-foreground">
              <CalendarDays className="mr-1 h-3 w-3" />
              วันที่เริ่ม
            </div>
            <div className="font-medium text-foreground">{startDate}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center text-muted-foreground">
              <CalendarDays className="mr-1 h-3 w-3" />
              วันที่สิ้นสุด
            </div>
            <div className="font-medium text-foreground">{endDate}</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center text-muted-foreground">
              <Users className="mr-1 h-4 w-4" />
              {teamSize} คน
            </div>
            <div className="font-medium text-xs">
              ฿{budget}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;