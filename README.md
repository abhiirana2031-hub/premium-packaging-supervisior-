# 📦 Premium Packaging Supervisor

> **Smart Production Tracking • Weight Variance Quality Audit • Factory Management & Reporting System**

---

## 🌟 Overview

**Premium Packaging Supervisor** is an enterprise-grade production management and weight quality audit system engineered specifically for packaging, plastics, and container manufacturing plants. It streamlines daily production logging across Day and Night shifts, cascades item master specifications, calculates actual vs. ideal weights in real-time, monitors material consumption and variance deviations, and generates publication-grade production slips, PDF reports, Excel workbooks, and CSV exports.

The application automatically stamps every generated report and batch slip with the authenticated supervisor's **Full Name**, **Designation**, and **Generation Timestamp** in Indian Standard Time (`Asia/Kolkata`).

---

## ✨ Key Modules & Capabilities

### 1. 📊 Main Dashboard & Shift Console
- **Instant Today Status**: Total items produced, total quantity (units), total actual production weight (g/kg), total ideal weight (g/kg), net material variance, and distinct packaging items.
- **Dynamic Table**: Live weight comparison with color-coded tolerance chips (Green = Within Tolerance, Amber = Approaching Limit, Red = Outside Spec).
- **Date Switcher**: Seamlessly switch between today, yesterday, or any past historical date.

### 2. ⚡ Quick Daily Production Entry
- **High-Speed Tabular Entry**: Record 5+ packaging products in seconds without re-entering shared date, shift, or line information.
- **Live Calculations**: Immediate updates to Ideal Total, Actual Total, Difference, and Quality Status as quantities and weights are typed.
- **Component Breakdown Toggle**: Optional inline entry for Jar, Cap, Plastic Handle, Steel Handle, and Liner weights.
- **Batch Save with Debounce**: Prevents accidental double submissions.

### 3. ⚖️ Weight Variance & Material Usage Tracking
- **Production Efficiency Module**: Tracks ideal vs. actual material consumption, resin excess, and shortfalls.
- **Component-Level Variance**: Pinpoints which packaging component (body, closure, or handle) is the primary driver of weight deviation.
- **Visual Status Badges**: Configurable tolerance thresholds with warning alerts.

### 4. 📄 Reusable Report Templates & Export Center
- **Pre-Configured System Templates**:
  1. *Daily Production Report*
  2. *Shift-wise Production Report*
  3. *Weekly Weight Variance Report*
  4. *Monthly Material Consumption Report*
  5. *Category-wise Production Summary*
  6. *Out-of-Tolerance Audit Report*
- **Print & Export Formats**:
  - **PDF Report**: High-resolution print-ready document with company header, supervisor badge, category summaries, item tables, and dual signature blocks.
  - **Excel Workbook (.xlsx)**: Genuine 5-sheet workbook (*Production Summary*, *Detailed Records*, *Item Specifications*, *Ideal vs Actual Comparison*, *Category Summary*) featuring true numeric data, formulas (`SUM`), and frozen headers.
  - **Production Slip**: Individual batch slip with slip reference number, component breakdown, and signature boxes formatted for A4 or thermal printing.
  - **CSV Export**: Standard format for ERP import.
  - **WhatsApp & Web Share**: Direct sharing with prefilled summary message and secure links.

### 5. 🏭 Product & Category Master
- **Complete Packaging Catalog**: 114 standard manufacturing items across 7 core packaging categories (Jars, Containers, Bottles, Caps/Closures, Handles/Wire, Buckets, and Custom Moldings).
- **Component Weights**: Jar weight (g), Cap weight (g), Plastic handle weight (g), Steel handle weight (g), and Other components (wads, liners).
- **Dual Ideal Weight Modes**:
  - *Option A*: Automatic sum of components.
  - *Option B*: Approved manual ideal weight.

### 6. 📅 Production History & Calendar View
- Interactive Calendar View and detailed Table View.
- Filter by Category, Subcategory, Item, Shift (Day / Night), Line, Batch, Supervisor, and Weight Status.

### 7. 🔐 Factory Access & Security
- **Strict Factory Whitelist Policy**: Self-registration is restricted; factory worker accounts are issued and managed directly by the Administrator.
- **Google Identity Services (GIS)**: Native 1-click Google authentication directly on your domain without third-party redirect screens.
- **User Management**: Administrators can create users, issue credentials, reset passwords, suspend/activate accounts, and delete workers.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 16 (App Router, Turbopack, React 19) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 (Modern Industrial Theme) |
| **Icons** | Lucide React |
| **Charts & Analytics** | Recharts |
| **PDF Generation** | `jspdf` & `jspdf-autotable` |
| **Excel Export** | `exceljs` |
| **Backend & Cloud DB** | Supabase (PostgreSQL with Row Level Security) |
| **Authentication** | Supabase Auth + Google Identity Services (GIS) |
| **PWA** | Progressive Web App with offline service worker & manifest |

---

## 🧮 Core Weight Calculations

- **Ideal Total Unit Weight**:  
  $$\text{Jar} + \text{Cap} + \text{Plastic Handle} + \text{Steel Handle} + \text{Other}$$
- **Total Ideal Production Weight**:  
  $$\text{Ideal Unit Weight} \times \text{Production Quantity}$$
- **Total Actual Production Weight**:  
  $$\text{Actual Unit Weight} \times \text{Production Quantity}$$
- **Weight Variance (Deviation)**:  
  $$\text{Total Actual Production Weight} - \text{Total Ideal Production Weight}$$
- **Percentage Deviation**:  
  $$\left(\frac{\text{Actual Unit Weight} - \text{Ideal Unit Weight}}{\text{Ideal Unit Weight}}\right) \times 100$$

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/abhiirana2031-hub/premium-packaging-supervisior-.git
cd premium-packaging-supervisior-

# Install dependencies
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local` and add your Supabase and Google OAuth keys:
```bash
cp .env.example .env.local
```

Fill in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 📄 License
Private & Proprietary — Premium Packaging. All Rights Reserved.
