import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/Navigation";
import {
  Save,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  Users,
  FileText,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
} from "lucide-react";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Navigation />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Page Header */}
            <div>
              <h1 className="text-3xl font-bold text-primary">ตั้งค่าระบบ</h1>
              <p className="text-muted-foreground mt-1">
                จัดการการตั้งค่าและการกำหนดค่าระบบ
              </p>
            </div>

            <Tabs defaultValue="general" className="">
              <TabsList
                className="grid grid-cols-2 gap-2 sm:flex sm:gap-2 bg-[#1c3a63]/5 h-full p-1 rounded-xl">
                <TabsTrigger value="general">ทั่วไป</TabsTrigger>
                <TabsTrigger value="notifications">การแจ้งเตือน</TabsTrigger>
                <TabsTrigger value="security">ความปลอดภัย</TabsTrigger>
                <TabsTrigger value="backup">สำรองข้อมูล</TabsTrigger>
                <TabsTrigger value="system">ระบบ</TabsTrigger>
              </TabsList>

              {/* General Settings */}
              <TabsContent value="general" className="space-y-6">
                <Card className="bg-gradient-card shadow-card-custom border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      ตั้งค่าทั่วไป
                    </CardTitle>
                    <CardDescription>การตั้งค่าพื้นฐานของระบบ</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company-name">ชื่อบริษัท</Label>
                        <Input
                          id="company-name"
                          defaultValue="บริษัท ก่อสร้างมืออาชีพ จำกัด"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company-code">รหัสบริษัท</Label>
                        <Input id="company-code" defaultValue="CON001" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company-address">ที่อยู่บริษัท</Label>
                      <Input
                        id="company-address"
                        defaultValue="123 ถนนก่อสร้าง แขวงอุตสาหกรรม เขตพัฒนา กรุงเทพฯ 10250"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                        <Input id="phone" defaultValue="02-123-4567" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">อีเมล</Label>
                        <Input
                          id="email"
                          type="email"
                          defaultValue="info@construction.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">เขตเวลา</Label>
                      <Select defaultValue="asia-bangkok">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asia-bangkok">
                            เอเชีย/กรุงเทพ (GMT+7)
                          </SelectItem>
                          <SelectItem value="utc">UTC (GMT+0)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">ภาษา</Label>
                      <Select defaultValue="th">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="th">ไทย</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button className="bg-gradient-primary">
                      <Save className="mr-2 h-4 w-4" />
                      บันทึกการตั้งค่า
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Settings */}
              <TabsContent value="notifications" className="space-y-6">
                <Card className="bg-gradient-card shadow-card-custom border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      การแจ้งเตือน
                    </CardTitle>
                    <CardDescription>
                      จัดการการแจ้งเตือนและการส่งข้อความ
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>อัพเดทโครงการ</Label>
                          <p className="text-sm text-muted-foreground">
                            แจ้งเตือนเมื่อมีการอัพเดทความคืบหน้าโครงการ
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>การเบิกวัสดุ</Label>
                          <p className="text-sm text-muted-foreground">
                            แจ้งเตือนเมื่อมีคำขอเบิกวัสดุใหม่
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>สมาชิกทีมใหม่</Label>
                          <p className="text-sm text-muted-foreground">
                            แจ้งเตือนเมื่อมีสมาชิกทีมเข้าร่วมใหม่
                          </p>
                        </div>
                        <Switch />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>รายงานประจำวัน</Label>
                          <p className="text-sm text-muted-foreground">
                            ส่งรายงานสรุปประจำวันทางอีเมล
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        ช่องทางการแจ้งเตือน
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email-notifications">
                            อีเมลสำหรับแจ้งเตือน
                          </Label>
                          <Input
                            id="email-notifications"
                            type="email"
                            defaultValue="admin@construction.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sms-number">เบอร์โทรสำหรับ SMS</Label>
                          <Input id="sms-number" defaultValue="081-234-5678" />
                        </div>
                      </div>
                    </div>

                    <Button className="bg-gradient-primary">
                      <Save className="mr-2 h-4 w-4" />
                      บันทึกการตั้งค่า
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security" className="space-y-6">
                <Card className="bg-gradient-card shadow-card-custom border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      ความปลอดภัย
                    </CardTitle>
                    <CardDescription>
                      จัดการความปลอดภัยและสิทธิการเข้าถึง
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>การยืนยันตัวตนสองขั้นตอน</Label>
                          <p className="text-sm text-muted-foreground">
                            เพิ่มความปลอดภัยด้วย 2FA
                          </p>
                        </div>
                        <Switch />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>บังคับใช้รหัสผ่านที่แข็งแกร่ง</Label>
                          <p className="text-sm text-muted-foreground">
                            รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>ออกจากระบบอัตโนมัติ</Label>
                          <p className="text-sm text-muted-foreground">
                            ออกจากระบบเมื่อไม่มีการใช้งาน
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">การจัดการรหัสผ่าน</h3>

                      <div className="space-y-2">
                        <Label htmlFor="session-timeout">
                          เวลาออกจากระบบอัตโนมัติ (นาที)
                        </Label>
                        <Select defaultValue="30">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 นาที</SelectItem>
                            <SelectItem value="30">30 นาที</SelectItem>
                            <SelectItem value="60">1 ชั่วโมง</SelectItem>
                            <SelectItem value="120">2 ชั่วโมง</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password-expiry">
                          ระยะเวลาหมดอายุรหัสผ่าน (วัน)
                        </Label>
                        <Select defaultValue="90">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 วัน</SelectItem>
                            <SelectItem value="60">60 วัน</SelectItem>
                            <SelectItem value="90">90 วัน</SelectItem>
                            <SelectItem value="never">ไม่หมดอายุ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button className="bg-gradient-primary">
                      <Save className="mr-2 h-4 w-4" />
                      บันทึกการตั้งค่า
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Backup Settings */}
              <TabsContent value="backup" className="space-y-6">
                <Card className="bg-gradient-card shadow-card-custom border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      สำรองข้อมูล
                    </CardTitle>
                    <CardDescription>
                      จัดการการสำรองข้อมูลและการกู้คืน
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>สำรองข้อมูลอัตโนมัติ</Label>
                          <p className="text-sm text-muted-foreground">
                            สำรองข้อมูลทุกวันเวลา 02:00 น.
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label htmlFor="backup-frequency">
                          ความถี่ในการสำรองข้อมูล
                        </Label>
                        <Select defaultValue="daily">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">ทุกวัน</SelectItem>
                            <SelectItem value="weekly">ทุกสัปดาห์</SelectItem>
                            <SelectItem value="monthly">ทุกเดือน</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="backup-retention">
                          เก็บไฟล์สำรองข้อมูล (วัน)
                        </Label>
                        <Select defaultValue="30">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">7 วัน</SelectItem>
                            <SelectItem value="30">30 วัน</SelectItem>
                            <SelectItem value="90">90 วัน</SelectItem>
                            <SelectItem value="365">1 ปี</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        การจัดการไฟล์สำรอง
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          ดาวน์โหลดข้อมูลสำรอง
                        </Button>
                        <Button variant="outline">
                          <Upload className="mr-2 h-4 w-4" />
                          อัพโหลดข้อมูลสำรอง
                        </Button>
                      </div>

                      <div className="bg-muted/20 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">
                          ไฟล์สำรองข้อมูลล่าสุด
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          วันที่: 15/09/2024 02:00 น.
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          ขนาดไฟล์: 125.5 MB
                        </p>
                        <p className="text-sm text-success">
                          ✓ ��ำรองข้อมูลสำเร็จ
                        </p>
                      </div>
                    </div>

                    <Button className="bg-gradient-primary">
                      <Save className="mr-2 h-4 w-4" />
                      บันทึกการตั้งค่า
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* System Settings */}
              <TabsContent value="system" className="space-y-6 ">
                <Card className="bg-gradient-card shadow-card-custom border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      ระบบ
                    </CardTitle>
                    <CardDescription>
                      การตั้งค่าระบบและการบำรุงรักษา
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">ข้อมูลระบบ</h3>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label>เวอร์ชันระบบ</Label>
                          <p className="text-muted-foreground">v2.1.3</p>
                        </div>
                        <div>
                          <Label>อัพเดทล่าสุด</Label>
                          <p className="text-muted-foreground">10/09/2024</p>
                        </div>
                        <div>
                          <Label>ฐานข้อมูล</Label>
                          <p className="text-muted-foreground">MySQL 8.0</p>
                        </div>
                        <div>
                          <Label>เซิร์ฟเวอร์</Label>
                          <p className="text-muted-foreground">
                            Ubuntu 20.04 LTS
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">การบำรุงรักษา</h3>

                      <div className="grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline">
                          <FileText className="mr-2 h-4 w-4" />
                          ตรวจสอบระบบ
                        </Button>
                        <Button variant="outline">
                          <Database className="mr-2 h-4 w-4" />
                          ทำความสะอาดฐานข้อมูล
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-destructive">
                        โซนอันตราย
                      </h3>

                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                          <div className="space-y-2">
                            <h4 className="font-medium text-destructive">
                              ลบข้อมูลทั้งหมด
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              การดำเนินการนี้จะลบข้อมูลทั้งหมดในระบบ
                              และไม่สามารถกู้คืนได้
                            </p>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="mr-2 h-4 w-4" />
                              ลบข้อมูลทั้งหมด
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
