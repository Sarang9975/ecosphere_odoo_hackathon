# 🌍 EcoSphere - ESG Management Platform

> An intelligent ESG (Environmental, Social, and Governance) Management Platform built for the **Odoo Hackathon** to help organizations measure, manage, and improve their sustainability performance through automation, analytics, and employee engagement.

---

## 📖 About

EcoSphere transforms traditional ESG reporting into a real-time, data-driven platform by integrating environmental impact tracking, social initiatives, governance compliance, and gamification into a unified dashboard.

The platform empowers organizations to:

- 🌱 Monitor carbon emissions and sustainability goals
- 👥 Encourage employee participation through CSR activities
- 🏛 Track governance policies, audits, and compliance issues
- 🎮 Motivate employees with gamification (Challenges, XP, Badges & Rewards)
- 📊 Generate comprehensive ESG reports and analytics

---

## ✨ Features

### 🌱 Environmental
- Carbon Emission Tracking
- Carbon Accounting
- Emission Factor Management
- Sustainability Goals
- Department-wise Carbon Analytics

### 👥 Social
- CSR Activity Management
- Employee Participation Tracking
- Diversity Metrics
- Employee Engagement Dashboard

### 🏛 Governance
- ESG Policy Management
- Policy Acknowledgements
- Audit Management
- Compliance Issue Tracking

### 🎮 Gamification
- Sustainability Challenges
- XP & Points System
- Badges & Achievements
- Reward Redemption
- Leaderboards

### 📈 Analytics & Reports
- ESG Summary Dashboard
- Environmental Reports
- Social Reports
- Governance Reports
- Custom Report Builder
- PDF / Excel / CSV Export

---

# 🛠 Tech Stack

## Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- React Hook Form
- Zod

## Backend

- Next.js Server Actions
- REST APIs
- Prisma ORM

## Database

- PostgreSQL

## Authentication

- Auth.js (NextAuth)

## Data Visualization

- Apache ECharts
- Recharts

## Storage

- Supabase Storage

## Notifications

- In-App Notification System
- Email Notifications

## Reports

- PDF Export
- Excel Export
- CSV Export

## Automation

- Automated ESG Scoring
- Carbon Emission Calculator
- Scheduled Background Jobs

## Deployment

- Docker
- Vercel

## Development Tools

- Git
- GitHub
- ESLint
- Prettier
- pnpm
- VS Code

---

# 🏗 Architecture

```text
Client (Next.js + React + Tailwind)
                │
                ▼
      Server Actions / REST APIs
                │
                ▼
           Prisma ORM
                │
                ▼
          PostgreSQL Database
                │
      ┌─────────┴─────────┐
      ▼                   ▼
 Supabase Storage   Notification Service
      │                   │
      └─────────┬─────────┘
                ▼
        ESG Analytics Engine
                │
                ▼
 Executive Dashboard & Reports
```

# 🎯 Core Modules

- Environmental Management
- Social Impact Management
- Governance & Compliance
- Gamification Engine
- ESG Analytics Dashboard
- Report Management

---

# 🛠 Hackathon Integrations & Features Added

We completed the core workflow loops of the Odoo EcoSphere ESG Management Platform:

### 1. Mock Login & RBAC Simulation
* **Cookie-Based Sessions:** Formed a dropdown selector at `/` that binds cookies (`user_id`, `user_role`, `user_name`) on login.
* **Role Mappings:** Seeded profiles are correctly mapped to their roles (e.g. `Alex M.` is MANAGER, `Sarah K.` is MANAGER, `James T.` is EMPLOYEE).
* **Navigation Sync:** Header navigators read active cookies, display profile stats, and provide a secure **Log Out** button to clean cookies.

### 2. Environmental Module Updates
* **Goals CRUD Configuration:** Added a form for Managers to create new sustainability goals and inline sliders to log progress. Updates dynamically adjust department ESG scores.
* **Factors CRUD Configuration:** Added UI forms to add new emission factors and deletion buttons to purge old coefficients.
* **Recalculation Integration:** Automated emission logging transactions query active coefficients and recalculate department greenhouse output.

### 3. CSR Evidence Upload UX & Lightbox
* **Visual File Selector:** Employees can click to select a local photo, see an image preview directly in the modal, and upload the evidence (converted to Base64 in DB).
* **Manager Image Verification:** The participation grid displays a small image thumbnail. Clicking it opens a premium, full-screen **Lightbox Overlay** to inspect the proof on-screen before approving.

### 4. Gamification Approvals Tab
* **Challenge Review Interface:** Managers see an **Approvals** tab where they review employee challenge proofs and click **Approve** or **Reject** to award points/XP.

### 5. Print-to-PDF Report Exports
* **HTML Print View:** Resolved the 400 error on PDF generation. Clicking PDF now opens a styled printable layout with live database records, allowing users to save directly as PDF via the browser printer.

### 6. WebGL Digital Twin Globe Optimization
* **60 FPS Performance:** Reduced `IcosahedronGeometry` detail level from CPU-freezing 64 to 5, and eliminated redundant sphere allocations inside the candidate placement loops.

---

# 🚀 Getting Started

Clone the repository

```bash
git clone https://github.com/<username>/odoo_hackathon.git
```

Install dependencies

```bash
npm install
```

Run the development server

```bash
npm dev
```

---

# 🎨 Initial Mockup

**Excalidraw Design**

https://link.excalidraw.com/l/65VNwvy7c4X/2m6lz9Ln4

---

# 👨‍💻 Team

Built with ❤️ for the **Odoo Hackathon**.

---

# 📄 License

This project is developed solely for the Odoo Hackathon.