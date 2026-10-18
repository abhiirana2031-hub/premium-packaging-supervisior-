-- =========================================================================
-- Premium Packaging Supervisor — Database Schema (PostgreSQL / Supabase)
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPANIES
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'Premium Packaging',
    code TEXT NOT NULL DEFAULT 'PREM-PKG',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PROFILES (Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,
    full_name TEXT NOT NULL,
    designation TEXT NOT NULL DEFAULT 'Production Supervisor',
    phone TEXT,
    email TEXT,
    employee_id TEXT,
    role TEXT NOT NULL CHECK (role IN ('supervisor', 'manager', 'admin')) DEFAULT 'supervisor',
    avatar_url TEXT,
    preferences JSONB DEFAULT '{"default_shift": "Morning Shift (06:00 - 14:00)", "weight_unit": "g"}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    sort_order INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SUBCATEGORIES
CREATE TABLE IF NOT EXISTS public.subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ITEMS (Product Master)
CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    subcategory_id UUID NOT NULL REFERENCES public.subcategories(id) ON DELETE RESTRICT,
    item_code TEXT NOT NULL UNIQUE,
    item_name TEXT NOT NULL,
    item_description TEXT,
    
    -- Component Weights in Grams
    jar_weight NUMERIC(10, 2),
    cap_weight NUMERIC(10, 2),
    plastic_handle_weight NUMERIC(10, 2),
    steel_handle_weight NUMERIC(10, 2),
    other_component_weight NUMERIC(10, 2),
    other_component_name TEXT,
    
    -- Ideal Weight Definition
    ideal_weight_mode TEXT NOT NULL CHECK (ideal_weight_mode IN ('calculated', 'manual')) DEFAULT 'calculated',
    approved_ideal_weight NUMERIC(10, 2) NOT NULL,
    calculated_component_total NUMERIC(10, 2) NOT NULL,
    
    -- Tolerance
    tolerance_percentage NUMERIC(5, 2) NOT NULL DEFAULT 2.50,
    min_acceptable_weight NUMERIC(10, 2),
    max_acceptable_weight NUMERIC(10, 2),
    
    target_production_qty INT,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PRODUCTION RECORDS
CREATE TABLE IF NOT EXISTS public.production_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    slip_number TEXT NOT NULL UNIQUE,
    production_date DATE NOT NULL,
    shift TEXT NOT NULL,
    production_line TEXT,
    batch_number TEXT,
    item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE RESTRICT,
    
    -- Historical Snapshots (guarantees historical reports stay unchanged)
    item_name_snapshot TEXT NOT NULL,
    item_code_snapshot TEXT NOT NULL,
    category_snapshot TEXT NOT NULL,
    subcategory_snapshot TEXT NOT NULL,
    ideal_component_weights_snapshot JSONB NOT NULL,
    approved_ideal_weight_snapshot NUMERIC(10, 2) NOT NULL,
    tolerance_snapshot JSONB NOT NULL,
    
    -- Actual Measurements
    actual_component_weights JSONB NOT NULL DEFAULT '{}'::jsonb,
    actual_unit_weight NUMERIC(10, 2) NOT NULL,
    measurement_mode TEXT NOT NULL DEFAULT 'unit_only',
    has_incomplete_components BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Volumes
    production_quantity INT NOT NULL CHECK (production_quantity > 0),
    rejected_quantity INT DEFAULT 0,
    wastage_weight NUMERIC(10, 2) DEFAULT 0,
    
    -- Computed Totals (stored in Grams)
    unit_difference NUMERIC(10, 3) NOT NULL,
    total_ideal_weight NUMERIC(12, 2) NOT NULL,
    total_actual_weight NUMERIC(12, 2) NOT NULL,
    total_weight_difference NUMERIC(12, 2) NOT NULL,
    percentage_deviation NUMERIC(8, 2) NOT NULL,
    weight_status TEXT NOT NULL CHECK (weight_status IN ('within_tolerance', 'warning', 'outside_tolerance', 'incomplete')),
    
    remarks TEXT,
    recorded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    recorded_by_name TEXT NOT NULL,
    recorded_by_designation TEXT NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PRODUCTION AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.production_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    production_record_id UUID REFERENCES public.production_records(id) ON DELETE SET NULL,
    slip_number TEXT,
    action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'REPORT_GENERATED')),
    previous_values JSONB,
    updated_values JSONB,
    performed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    performed_by_name TEXT NOT NULL,
    performed_by_designation TEXT NOT NULL,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason TEXT
);

-- 8. REPORT TEMPLATES (Advanced Feature 3)
CREATE TABLE IF NOT EXISTS public.report_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    date_preset TEXT NOT NULL DEFAULT 'today',
    default_start_date DATE,
    default_end_date DATE,
    category_ids UUID[],
    item_ids UUID[],
    shifts TEXT[],
    production_lines TEXT[],
    supervisors TEXT[],
    weight_statuses TEXT[],
    include_weight_comparison BOOLEAN NOT NULL DEFAULT TRUE,
    include_component_breakdown BOOLEAN NOT NULL DEFAULT TRUE,
    include_material_usage BOOLEAN NOT NULL DEFAULT TRUE,
    include_wastage BOOLEAN NOT NULL DEFAULT TRUE,
    include_signatures BOOLEAN NOT NULL DEFAULT TRUE,
    default_format TEXT NOT NULL DEFAULT 'pdf',
    is_system_template BOOLEAN NOT NULL DEFAULT FALSE,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -------------------------------------------------------------
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;

-- Helper function to get company_id of current auth user
CREATE OR REPLACE FUNCTION public.get_auth_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Profiles: Users can see profiles in their company, and edit their own profile
CREATE POLICY "Users view profiles within company" ON public.profiles
    FOR SELECT USING (company_id = public.get_auth_company_id());

CREATE POLICY "Users update own profile" ON public.profiles
    FOR UPDATE USING (id = auth.uid());

-- Items & Categories: readable by company members
CREATE POLICY "Company items viewable" ON public.items
    FOR SELECT USING (company_id = public.get_auth_company_id());

CREATE POLICY "Admins/Managers manage items" ON public.items
    FOR ALL USING (
        company_id = public.get_auth_company_id() AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Production Records: Isolated by company
CREATE POLICY "View production records of company" ON public.production_records
    FOR SELECT USING (company_id = public.get_auth_company_id());

CREATE POLICY "Insert production records" ON public.production_records
    FOR INSERT WITH CHECK (company_id = public.get_auth_company_id());

CREATE POLICY "Update production records authorized" ON public.production_records
    FOR UPDATE USING (
        company_id = public.get_auth_company_id() AND (
            recorded_by = auth.uid() OR
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
        )
    );

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_prod_rec_company_date ON public.production_records (company_id, production_date);
CREATE INDEX IF NOT EXISTS idx_prod_rec_item ON public.production_records (item_id);
CREATE INDEX IF NOT EXISTS idx_prod_rec_slip ON public.production_records (slip_number);
CREATE INDEX IF NOT EXISTS idx_items_code ON public.items (item_code);
CREATE INDEX IF NOT EXISTS idx_audit_log_rec ON public.production_audit_logs (production_record_id);
