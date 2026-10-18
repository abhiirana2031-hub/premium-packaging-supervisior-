-- ==============================================================================
-- PREMIUM PACKAGING SUPERVISOR — PRODUCTION DATABASE SCHEMA
-- Compatible with Supabase PostgreSQL (100% Free Tier)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Companies / Tenants (Multi-Tenancy)
CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY DEFAULT ('comp_' || substr(md5(random()::text), 1, 12)),
    name TEXT NOT NULL,
    legal_name TEXT,
    plant_location TEXT NOT NULL,
    gst_number TEXT,
    phone TEXT,
    email TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. User Profiles & Roles
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT ('usr_' || substr(md5(random()::text), 1, 12)),
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    designation TEXT NOT NULL,
    phone TEXT,
    email TEXT UNIQUE,
    employee_id TEXT,
    role TEXT NOT NULL CHECK (role IN ('supervisor', 'manager', 'admin', 'operator')),
    preferences JSONB DEFAULT '{"defaultShift": "Day Shift", "defaultLine": "Line 1", "weightUnit": "g"}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Product Categories
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Subcategories
CREATE TABLE IF NOT EXISTS subcategories (
    id TEXT PRIMARY KEY,
    category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Product Master & Component Specifications
CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    category_id TEXT REFERENCES categories(id) ON DELETE RESTRICT,
    subcategory_id TEXT REFERENCES subcategories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    unit_of_measure TEXT DEFAULT 'pcs',
    
    -- Component Ideal Weights (grams)
    ideal_jar_weight NUMERIC(10, 2) DEFAULT 0,
    ideal_cap_weight NUMERIC(10, 2) DEFAULT 0,
    ideal_plastic_handle_weight NUMERIC(10, 2) DEFAULT 0,
    ideal_steel_handle_weight NUMERIC(10, 2) DEFAULT 0,
    ideal_unit_weight NUMERIC(10, 2) NOT NULL,
    
    -- Quality Tolerance
    tolerance_percentage NUMERIC(5, 2) DEFAULT 2.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Daily Production Records & Quality Slips
CREATE TABLE IF NOT EXISTS production_records (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    slip_number TEXT NOT NULL UNIQUE,
    production_date DATE NOT NULL,
    shift TEXT NOT NULL CHECK (shift IN ('Day Shift', 'Night Shift')),
    production_line TEXT,
    batch_number TEXT,
    item_id TEXT REFERENCES items(id) ON DELETE RESTRICT,
    
    -- Historical Frozen Snapshot of Product Specs
    item_name_snapshot TEXT NOT NULL,
    item_code_snapshot TEXT NOT NULL,
    category_snapshot TEXT NOT NULL,
    subcategory_snapshot TEXT NOT NULL,
    ideal_component_weights_snapshot JSONB NOT NULL,
    ideal_unit_weight_snapshot NUMERIC(10, 2) NOT NULL,
    tolerance_percentage_snapshot NUMERIC(5, 2) NOT NULL,
    
    -- Measured Shop-Floor Quantities & Weights
    production_quantity INT NOT NULL,
    actual_jar_weight NUMERIC(10, 2) DEFAULT 0,
    actual_cap_weight NUMERIC(10, 2) DEFAULT 0,
    actual_plastic_handle_weight NUMERIC(10, 2) DEFAULT 0,
    actual_steel_handle_weight NUMERIC(10, 2) DEFAULT 0,
    actual_unit_weight NUMERIC(10, 2) NOT NULL,
    
    -- Computed Variances & Audit
    unit_weight_difference NUMERIC(10, 2) NOT NULL,
    percentage_deviation NUMERIC(6, 2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('within_tolerance', 'warning', 'outside_tolerance', 'incomplete')),
    
    -- Material Totals
    total_ideal_weight_kg NUMERIC(12, 3) NOT NULL,
    total_actual_weight_kg NUMERIC(12, 3) NOT NULL,
    total_weight_difference_kg NUMERIC(12, 3) NOT NULL,
    
    -- Scrap & Operator Notes
    rejection_quantity INT DEFAULT 0,
    wastage_material_grams NUMERIC(10, 2) DEFAULT 0,
    remarks TEXT,
    supervisor_id TEXT REFERENCES users(id),
    supervisor_name TEXT NOT NULL,
    
    -- Cloud Sync Metadata
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Production Audit Trail (Immutable)
CREATE TABLE IF NOT EXISTS production_audit_logs (
    id TEXT PRIMARY KEY DEFAULT ('aud_' || substr(md5(random()::text), 1, 12)),
    record_id TEXT REFERENCES production_records(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    performed_by_id TEXT,
    details TEXT NOT NULL,
    changes_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_prod_date ON production_records(production_date);
CREATE INDEX IF NOT EXISTS idx_prod_shift ON production_records(shift);
CREATE INDEX IF NOT EXISTS idx_prod_item ON production_records(item_id);
CREATE INDEX IF NOT EXISTS idx_prod_slip ON production_records(slip_number);
CREATE INDEX IF NOT EXISTS idx_items_cat ON items(category_id);

-- 10. Enable Row Level Security (RLS) for Multi-Tenancy
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read/write during free development tier (or connect with auth.uid())
CREATE POLICY "Allow authenticated read production_records" ON production_records FOR ALL USING (true);
CREATE POLICY "Allow authenticated read items" ON items FOR ALL USING (true);
CREATE POLICY "Allow authenticated read categories" ON categories FOR ALL USING (true);
CREATE POLICY "Allow authenticated read subcategories" ON subcategories FOR ALL USING (true);
CREATE POLICY "Allow authenticated read users" ON users FOR ALL USING (true);
CREATE POLICY "Allow authenticated read companies" ON companies FOR ALL USING (true);
CREATE POLICY "Allow authenticated read audit" ON production_audit_logs FOR ALL USING (true);

-- 11. Initial Tenant Seed
INSERT INTO companies (id, name, legal_name, plant_location, gst_number)
VALUES ('comp_premium_pkg', 'Premium Packaging Industries', 'Premium Packaging Ltd.', 'GIDC Industrial Estate, Sector 4, Vadodara, Gujarat', '24AAACP1234F1Z5')
ON CONFLICT (id) DO NOTHING;
