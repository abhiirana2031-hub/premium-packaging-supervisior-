# 📦 Premium Packaging Supervisor

**Smart Production Tracking • Weight Analysis • Professional Reporting**

Premium Packaging Supervisor is a mobile-first production management application designed to simplify daily operations in packaging manufacturing companies. It enables supervisors to manage product specifications, record daily production, compare ideal and actual weights, monitor material consumption, and generate professional production reports.

The application focuses on simplicity, accuracy, and efficiency, making production management accessible from mobile phones, tablets, and desktop computers.

## ✨ Key Features

### 📊 Production Dashboard
- Daily production summaries and key performance indicators.
- Total production quantity and actual weight.
- Ideal versus actual weight comparison.
- Quick access to production entry and reports.
- Recent production activity.

### 🏭 Product & Category Management
- Organize products by category and subcategory.
- Maintain item names, codes, and specifications.
- Record jar, cap, plastic handle, and steel handle weights.
- Calculate ideal total product weight automatically.
- Support manually approved ideal weights.
- Configure weight tolerances for individual items.

### ⚡ Quick Daily Production Entry
- Record multiple items in a single session.
- Select production date, shift, and production line.
- Automatically load saved item specifications.
- Calculate total ideal weight, actual weight, and weight differences.
- Track quantities, batches, rejected items, and wastage.
- Validate incomplete measurements.

### ⚖️ Ideal vs Actual Weight Analysis
- Compare ideal and actual unit weights.
- Calculate total material consumption and weight variance.
- Identify positive and negative deviations.
- Monitor component-level weight differences when measurements are available.
- Track out-of-tolerance production.
- Visualize production trends using charts and analytics.

### 📅 Production History
- Search and filter historical production records.
- View production by date, item, category, shift, or batch.
- Generate reports for a single day or a custom date range.
- Review previous entries and their saved specifications.

### 📄 Reports & Export
- **PDF:** Professional, print-ready production reports.
- **Excel (.xlsx):** Structured worksheets for analysis.
- **CSV:** Data export for other business systems.
- **Production slips:** Compact, printable production records.
- Preview reports before exporting.
- Include supervisor name, designation, reporting period, and generation timestamp.

### 🔄 Reusable Report Templates
- Save frequently used report configurations.
- Generate daily production summaries.
- Create weekly weight variance reports.
- Prepare monthly material consumption reports.
- Customize report filters and included sections.

### 🔐 Authentication & Security
- Google sign-in.
- Phone number authentication with OTP.
- User profiles with name and designation.
- Role-based permissions.
- Secure database access policies.
- Production edit history and audit logs.

### 📱 Mobile-First UI/UX
- Responsive interface for mobile, tablet, and desktop.
- Simple navigation and large touch-friendly controls.
- Clean cards, searchable lists, and intuitive forms.
- Quick access to common production tasks.

## 🛠️ Technology Stack

The intended technology stack includes:

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Programming Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| Backend Services | Supabase |
| Authentication | Supabase Auth |
| Charts | Recharts |
| PDF Export | PDF generation library |
| Excel Export | ExcelJS |
| Hosting | Vercel |

*The final technology list should be updated to match the actual implementation in the repository.*

## 🧮 Core Weight Calculations

**Ideal Total Weight**

Jar Weight + Cap Weight + Plastic Handle Weight + Steel Handle Weight + Other Component Weights

**Total Ideal Production Weight**

Ideal Unit Weight × Production Quantity

**Total Actual Production Weight**

Actual Unit Weight × Production Quantity

**Weight Variance**

Total Actual Production Weight − Total Ideal Production Weight

**Percentage Deviation**

((Actual Unit Weight − Ideal Unit Weight) ÷ Ideal Unit Weight) × 100

Calculations must handle missing measurements and zero ideal weights safely.

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm
- A Supabase project
- Google OAuth credentials, if Google sign-in is enabled
- An SMS provider configured for phone OTP authentication

### Installation

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd premium-packaging-supervisor
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file and configure the required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Configure any additional secrets required by your actual implementation. Never expose service-role keys or private credentials in frontend code.

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

**Note:** Authentication, database migrations, storage, and export functionality must be configured before the application is ready for production use.

## 📂 Main Application Modules

- Dashboard
- Product Categories
- Subcategory Management
- Item Master
- Quick Production Entry
- Production History
- Weight Variance Analytics
- Report Center
- Report Templates
- User Profile & Settings
- Audit Logs

## 🎯 Project Goals

- Simplify daily production recordkeeping.
- Reduce manual weight-calculation errors.
- Improve visibility into material consumption.
- Identify production deviations quickly.
- Make reporting faster and more consistent.
- Provide an easy-to-use mobile experience for factory supervisors.

## 🔒 Data Integrity

Production records should preserve the item specifications used when the production was recorded. Changes to current product specifications must not silently alter historical weight comparisons.

Access controls, input validation, audit logs, and secure authentication should protect production data.

## 🗺️ Future Enhancements

- Barcode or QR-code scanning for item selection.
- Offline production entry with secure synchronization.
- Thermal printer support for production slips.
- Multi-factory and multi-company management.
- Automated daily and monthly report delivery.
- Production targets and shift-wise performance tracking.
- Inventory and raw material integration.

## 📜 License

Add your chosen open-source license or proprietary license before publishing the repository.

---

**Premium Packaging Supervisor** — Simplifying production tracking, improving weight accuracy, and making reporting effortless.
