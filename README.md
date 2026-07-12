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

# 🚀 Getting Started

Clone the repository

```bash
git clone https://github.com/<username>/odoo_hackathon.git
```

Install dependencies

```bash
pnpm install
```

Run the development server

```bash
pnpm dev
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