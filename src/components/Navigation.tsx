"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FolderOpen, 
  Package, 
  TrendingUp, 
  Users, 
  Settings,
  Bell
} from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: LayoutDashboard, label: "แดชบอร์ด", path: "/" },
    { icon: FolderOpen, label: "โครงการ", path: "/projects" },
    { icon: Package, label: "เบิกวัสดุ", path: "/material-request" },
    { icon: TrendingUp, label: "อัพเดทยอด", path: "/progress-update" },
    { icon: Users, label: "จัดการทีม", path: "/team-management" },
    { icon: Settings, label: "ตั้งค่า", path: "/settings" },
  ];

  return (
    <Card className="bg-gradient-card shadow-card-custom border-0 p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-primary">เมนูหลัก</h2>
        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
      
      <nav className="space-y-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink key={index} to={item.path}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start h-10 ${
                  isActive 
                    ? "bg-gradient-primary text-primary-foreground shadow-construction" 
                    : "hover:bg-secondary/50"
                }`}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            </NavLink>
          );
        })}
      </nav>
    </Card>
  );
};

export default Navigation;