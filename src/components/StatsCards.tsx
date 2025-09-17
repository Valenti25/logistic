import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Clock, Users, Wrench } from "lucide-react";

const StatsCards = () => {
  const stats = [
    {
      title: "โครงการทั้งหมด",
      value: "12",
      icon: BarChart3,
      description: "โครงการกำลังดำเนินการ",
      trend: "+2 โครงการใหม่",
    },
    {
      title: "อัพเดททั้งหมด",
      value: "156",
      icon: Clock,
      description: "ในสัปดาห์นี้",
      trend: "+24 อัพเดท",
    },
    {
      title: "ช่างในระบบ",
      value: "48",
      icon: Users,
      description: "ช่างที่ใช้งานระบบ",
      trend: "+6 คนใหม่",
    },
    {
      title: "การเบิกรายการ",
      value: "89",
      icon: Wrench,
      description: "รายการที่เบิกวันนี้",
      trend: "+12 รายการ",
    },
  ];

  return (
    <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={index} 
            className="bg-gradient-card shadow-card-custom border-0 hover:shadow-elevated transition-all duration-300"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              <p className="text-xs text-success mt-1 font-medium">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards;