"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import MaterialRequestForm from "@/components/MaterialRequestForm";
import { Search, Package, CheckCircle, XCircle, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { useMaterialRequests } from "@/hooks/useMaterialRequests";
import { useProjects } from "@/hooks/useProjects";

/* ---------- Mini component: list วัสดุ แบบย่อ/ขยายสำหรับมือถือ ---------- */
function MaterialItemsList({
  items,
  maxCollapsed = 3,
}: {
  items: { item_name: string; quantity: number; unit: string }[];
  maxCollapsed?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, maxCollapsed);
  const remaining = Math.max(items.length - maxCollapsed, 0);

  if (!items?.length) return null;

  return (
    <div className="mb-3 sm:mb-4">
      <h4 className="font-medium text-primary mb-2 text-sm sm:text-base">รายการวัสดุ:</h4>
      <ul className="space-y-1 text-sm">
        {visible.map((item, index) => (
          <li key={`${item.item_name}-${index}`} className="flex justify-between">
            <span className="truncate">{item.item_name}</span>
            <span className="text-muted-foreground shrink-0">
              {item.quantity} {item.unit}
            </span>
          </li>
        ))}
      </ul>

      {remaining > 0 && !expanded && (
        <Button variant="ghost" size="sm" className="mt-1 px-0 h-8 text-primary" onClick={() => setExpanded(true)}>
          ดูทั้งหมด {remaining} รายการ <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      )}
      {expanded && items.length > maxCollapsed && (
        <Button variant="ghost" size="sm" className="mt-1 px-0 h-8 text-primary" onClick={() => setExpanded(false)}>
          ย่อรายการ <ChevronUp className="ml-1 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

const MaterialRequest = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { materialRequests, loading, updateRequestStatus } = useMaterialRequests();
  const { projects } = useProjects();

  // Get project name by ID
  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project?.name || "ไม่พบโครงการ";
  };

  const filteredRequests = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return materialRequests.filter((request) => {
      const projectName = getProjectName(request.project_id);
      const matchesSearch =
        projectName.toLowerCase().includes(q) ||
        request.requester_name.toLowerCase().includes(q) ||
        request.request_code.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [materialRequests, searchTerm, statusFilter, projects]);

  const getStatusCount = (status: string) => {
    if (status === "all") return materialRequests.length;
    return materialRequests.filter((r) => r.status === status).length;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-warning text-warning-foreground";
      case "approved":
        return "bg-success text-success-foreground";
      case "delivered":
        return "bg-primary text-primary-foreground";
      case "rejected":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "รออนุมัติ";
      case "approved":
        return "อนุมัติแล้ว";
      case "delivered":
        return "จัดส่งแล้ว";
      case "rejected":
        return "ไม่อนุมัติ";
      default:
        return "ไม่ทราบสถานะ";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "normal":
        return "bg-accent text-accent-foreground";
      case "low":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "เร่งด่วน";
      case "normal":
        return "ปกติ";
      case "low":
        return "ไม่เร่งด่วน";
      default:
        return "ไม่ระบุ";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="lg:col-span-1">
            <Navigation />
          </div>

          <div className="lg:col-span-3 space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-primary">เบิกวัสดุ</h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  จัดการการเบิกวัสดุและอุปกรณ์ในโครงการ
                </p>
              </div>
              {/* บนมือถือให้ปุ่มเต็มแถว กดง่ายขึ้น */}
              <div className="w-full sm:w-auto">
                <MaterialRequestForm />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <Card className="bg-gradient-card shadow-card-custom border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-primary">{getStatusCount("all")}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">คำขอทั้งหมด</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card shadow-card-custom border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-warning">{getStatusCount("pending")}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">รออนุมัติ</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card shadow-card-custom border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-success">{getStatusCount("approved")}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">อนุมัติแล้ว</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card shadow-card-custom border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-primary">{getStatusCount("delivered")}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">จัดส่งแล้ว</div>
                </CardContent>
              </Card>
            </div>

            {/* Table/List */}
            <Card className="bg-gradient-card shadow-card-custom border-0">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-primary">รายการเบิกวัสดุ</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="ค้นหาคำขอ, โครงการ หรือผู้เบิก..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="กรองตามสถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทั้งหมด</SelectItem>
                      <SelectItem value="pending">รออนุมัติ</SelectItem>
                      <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
                      <SelectItem value="delivered">จัดส่งแล้ว</SelectItem>
                      <SelectItem value="rejected">ไม่อนุมัติ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {loading ? (
                  <div className="text-center py-10 sm:py-12">
                    <div className="text-muted-foreground">กำลังโหลดข้อมูล...</div>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {filteredRequests.map((request) => (
                      <Card
                        key={request.id}
                        className="bg-gradient-card shadow-card-custom border-0 hover:shadow-elevated transition-all duration-300"
                      >
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-3">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-primary text-base sm:text-lg truncate">
                                {request.request_code}
                              </h3>
                              <p className="text-muted-foreground truncate">
                                {getProjectName(request.project_id)}
                              </p>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                ผู้เบิก: {request.requester_name}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                              <Badge className={`px-2 py-0.5 text-[11px] sm:text-xs ${getUrgencyColor(request.urgency)}`}>
                                {getUrgencyText(request.urgency)}
                              </Badge>
                              <Badge className={`px-2 py-0.5 text-[11px] sm:text-xs ${getStatusColor(request.status)}`}>
                                {getStatusText(request.status)}
                              </Badge>
                            </div>
                          </div>

                          {request.material_items && (
                            <MaterialItemsList items={request.material_items} />
                          )}

                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-3 sm:pt-4 border-t border-border">
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              วันที่เบิก:{" "}
                              {new Date(request.request_date).toLocaleDateString("th-TH")}
                            </div>
                            <div className="flex flex-col xs:flex-row gap-2 sm:gap-2">
                              <Button size="sm" variant="outline" className="w-full sm:w-auto">
                                <Eye className="mr-1 h-3 w-3" />
                                ดูรายละเอียด
                              </Button>
                              {request.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full sm:w-auto text-success border-success hover:bg-success/10"
                                    onClick={() => updateRequestStatus(request.id, "approved")}
                                  >
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    อนุมัติ
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full sm:w-auto text-destructive border-destructive hover:bg-destructive/10"
                                    onClick={() => updateRequestStatus(request.id, "rejected")}
                                  >
                                    <XCircle className="mr-1 h-3 w-3" />
                                    ปฏิเสธ
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {filteredRequests.length === 0 && (
                      <div className="text-center py-10 sm:py-12">
                        <Package className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                        <div className="text-sm sm:text-base text-muted-foreground">
                          ไม่พบรายการเบิกวัสดุที่ตรงกับการค้นหา
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialRequest;
