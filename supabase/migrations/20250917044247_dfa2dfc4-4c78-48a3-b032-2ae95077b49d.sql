-- สร้างตารางโครงการ (Projects)
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'completed')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  team_size INTEGER NOT NULL DEFAULT 1,
  budget BIGINT NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- สร้างตารางการเบิกวัสดุ (Material Requests)
CREATE TABLE public.material_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_code TEXT NOT NULL UNIQUE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'delivered', 'rejected')),
  urgency TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high')),
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- สร้างตารางรายการวัสดุ (Material Items)
CREATE TABLE public.material_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.material_requests(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- สร้างตารางอัพเดทความคืบหน้า (Progress Updates)
CREATE TABLE public.progress_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  update_date DATE NOT NULL DEFAULT CURRENT_DATE,
  progress_percentage INTEGER NOT NULL CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  description TEXT NOT NULL,
  photos TEXT[], -- เก็บ URLs ของรูปภาพ
  updated_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_updates ENABLE ROW LEVEL SECURITY;

-- สร้าง policies สำหรับการเข้าถึงข้อมูล (เปิดให้ทุกคนเข้าถึงได้ในขั้นต้น)
CREATE POLICY "Enable read access for all users" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.projects FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.material_requests FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.material_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.material_requests FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.material_requests FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.material_items FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.material_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.material_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.material_items FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.progress_updates FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.progress_updates FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.progress_updates FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.progress_updates FOR DELETE USING (true);

-- สร้าง function สำหรับ update timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- สร้าง triggers สำหรับ auto-update timestamps
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_material_requests_updated_at
BEFORE UPDATE ON public.material_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- เพิ่มข้อมูลตัวอย่าง
INSERT INTO public.projects (name, location, status, progress, start_date, end_date, team_size, budget, description) VALUES
('อาคารเอบีซี คอนโดมิเนียม', 'กรุงเทพมหานคร', 'active', 75, '2024-01-01', '2024-12-31', 24, 125000000, 'โครงการคอนโดมิเนียมหรูระดับไฮเอนด์'),
('โครงการบ้านเดี่ยว สมาร์ทวิลล์', 'นนทบุรี', 'active', 45, '2024-02-15', '2024-11-30', 18, 89500000, 'โครงการบ้านเดี่ยวสมาร์ทโฮม'),
('อาคารสำนักงาน เทคโนโลยี พาร์ค', 'ปทุมธานี', 'pending', 15, '2024-03-01', '2025-02-28', 32, 245000000, 'อาคารสำนักงานเทคโนโลยีทันสมัย'),
('โรงงานผลิตชิ้นส่วนยานยนต์', 'ระยอง', 'completed', 100, '2023-06-01', '2023-11-30', 42, 180750000, 'โรงงานผลิตชิ้นส่วนยานยนต์มาตรฐานสากล');

-- สร้าง function สำหรับ generate request code
CREATE OR REPLACE FUNCTION generate_request_code()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  code TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(request_code FROM 3) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.material_requests 
  WHERE request_code ~ '^MR[0-9]+$';
  
  code := 'MR' || LPAD(next_num::TEXT, 3, '0');
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- เพิ่มข้อมูลตัวอย่างการเบิกวัสดุ
INSERT INTO public.material_requests (request_code, project_id, requester_name, status, urgency, request_date, notes) 
SELECT 
  generate_request_code(),
  p.id,
  'สมชาย ช่างไฟ',
  'pending',
  'normal',
  '2024-09-15',
  'สำหรับงานติดตั้งระบบไฟฟ้าชั้น 5-8'
FROM public.projects p WHERE p.name = 'อาคารเอบีซี คอนโดมิเนียม' LIMIT 1;