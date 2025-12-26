# Octomate by HRnetGroup - Employee Profile Management System

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/shadcn/ui-Latest-black?style=for-the-badge" alt="shadcn/ui" />
</div>

<div align="center">
  <h3>🇸🇬 A Singapore-focused HR Management System Demo</h3>
  <p><strong>PM Internship Assessment Project for HRnetGroup</strong></p>
</div>

---

## 📋 Project Overview

This is a **production-quality demo** of an HR Employee Profile Management System built for "Octomate by HRnet", a Singapore-based HR tech company. The project demonstrates system design thinking, attention to detail, and modern web development practices through a fully functional prototype.

### 🎯 Assessment Context

This demo is created as part of a PM internship assessment to showcase:
- **System Design Thinking**: Comprehensive understanding of HR workflows and data management
- **User Experience Design**: Intuitive interface with role-based access control
- **Technical Implementation**: Clean code architecture with modern tech stack
- **Compliance Awareness**: Singapore PDPA and employment regulation considerations
- **Attention to Detail**: Field-level validations, audit trails, and edge case handling

---

## ✨ Key Features

### 1. Dashboard
- Summary statistics (total employees, active count, pending updates)
- Quick action buttons for common operations
- Recent activity feed with audit log entries
- Department distribution visualization

### 2. Employee Profile Management
Complete employee lifecycle management with **6 tabbed sections**:

| Tab | Description | Key Fields |
|-----|-------------|------------|
| **Core Identity** | Personal identification | Full Name, NRIC/FIN (validated), DOB, Gender, Race, Religion |
| **Employment** | Work details | Employee ID (auto-generated), Department, Job Title, Retirement calculations |
| **Contact** | Communication info | Mobile (SG format), Email, Mailing Address, Overseas Address |
| **Banking** | Payroll data | Bank details with masking, SWIFT code validation |
| **Qualifications** | Education & Experience | Repeatable education/work history sections |
| **Emergency** | Emergency contacts | Two contact slots with relationship info |

### 3. Role-Based Access Control (RBAC)
Interactive role switcher demonstrating field-level permissions:

| Role | Access Level |
|------|-------------|
| **HR Admin** | Full read/write access to all fields and features |
| **Manager** | Read-only access, NRIC masked, no banking data |
| **Employee** | Self-service only, restricted field editing |

### 4. Singapore-Specific Features
- **NRIC/FIN Validation**: Full checksum validation for Singapore identity numbers
- **Phone Format**: +65 mobile/landline validation
- **Postal Codes**: 6-digit Singapore postal code validation
- **Retirement Age**: Default 63 years (Singapore standard)
- **PDPA Compliance**: Consent management, data export, retention notices
- **Local Banks**: DBS, OCBC, UOB, and other SG banks

### 5. Audit Trail
- Complete change history tracking
- User attribution with role indicators
- Field-level change logging (old value → new value)
- Filterable by date range, action type, and search

### 6. Data Validation & UX
- Real-time inline validation with helpful error messages
- Auto-save status indicator
- Form completion progress bar
- Confirmation dialogs for sensitive changes
- Toast notifications for all actions

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **State Management**: React hooks + Local Storage
- **Notifications**: Sonner

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/Octomate-by-HRnetGroup-Case-demo.git

# Navigate to the project
cd Octomate-by-HRnetGroup-Case-demo

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
├── app/
│   ├── page.tsx              # Dashboard
│   ├── employees/
│   │   ├── page.tsx          # Employee list
│   │   ├── [id]/page.tsx     # Employee profile
│   │   └── new/page.tsx      # Add employee
│   ├── audit/page.tsx        # Audit logs
│   ├── settings/page.tsx     # Settings
│   ├── not-found.tsx         # 404 page
│   └── error.tsx             # Error boundary
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── employees/            # Employee-specific components
│   │   ├── ProfileForm.tsx
│   │   ├── EmployeeList.tsx
│   │   ├── EmployeeCard.tsx
│   │   └── tabs/             # Profile form tabs
│   ├── layout/               # Header, Sidebar, PageHeader
│   └── providers/            # Context providers
├── hooks/
│   ├── useLocalStorage.ts    # Persistent storage hook
│   └── usePermissions.ts     # RBAC hook
├── lib/
│   ├── types.ts              # TypeScript interfaces
│   ├── validations.ts        # NRIC, phone, email validators
│   ├── permissions.ts        # Role-based access logic
│   ├── mock-data.ts          # Seed data (10 SG employees)
│   └── utils.ts              # Utility functions
```

---

## 🎨 Design Decisions

### 1. Local Storage for Demo Persistence
- **Rationale**: No backend setup required for immediate testing
- **Trade-off**: Enables demo persistence across browser sessions
- **Implementation**: Custom hooks with hydration handling

### 2. Role Switcher in Header
- **Rationale**: Easy demonstration of RBAC without authentication
- **UX Benefit**: Instant role switching to see permission differences
- **Visual Feedback**: Clear badges and permission notices

### 3. Tabbed Profile Form
- **Rationale**: Organize complex data into logical sections
- **UX Benefit**: Progressive disclosure reduces cognitive load
- **Accessibility**: Keyboard navigable tabs

### 4. Singapore-First Validation
- **Rationale**: Target market compliance (NRIC, phone, postal codes)
- **Implementation**: Full NRIC checksum algorithm
- **Extensibility**: Can add other country validations

### 5. Audit-First Approach
- **Rationale**: HR compliance requires change tracking
- **Implementation**: Every profile change logs old/new values
- **PDPA Alignment**: Demonstrates data access transparency

---

## 🔐 Security Considerations

While this is a demo, the following security patterns are implemented:

1. **Field-Level Permissions**: Different roles see different data
2. **Data Masking**: NRIC (S****567A), Bank accounts (****1234)
3. **Sensitive Data Badges**: Visual indicators for protected fields
4. **Confirmation Dialogs**: Extra step for banking/deletion actions
5. **Audit Logging**: All actions are tracked with user attribution

---

## 🇸🇬 PDPA Compliance Features

- ✅ Consent collection before profile creation
- ✅ Data export request (Right to Access)
- ✅ Data deletion request (Right to Erasure)
- ✅ 7-year retention notice (Singapore employment law)
- ✅ Purpose limitation notices
- ✅ Audit trail for accountability

---

## 📸 Screenshots

> Screenshots will be added after deployment

| Dashboard | Employee List | Profile Form |
|-----------|---------------|--------------|
| ![Dashboard](screenshots/dashboard.png) | ![List](screenshots/list.png) | ![Profile](screenshots/profile.png) |

| Audit Logs | Role Switcher | PDPA Consent |
|------------|---------------|--------------|
| ![Audit](screenshots/audit.png) | ![Roles](screenshots/roles.png) | ![PDPA](screenshots/pdpa.png) |

---

## 🌐 Live Demo

> **[View Live Demo →](https://octomate-demo.vercel.app)** *(placeholder)*

---

## 📝 Mock Data

The demo includes 10 realistic Singapore employee profiles:

| Name | Department | Status | NRIC Type |
|------|------------|--------|-----------|
| Tan Wei Ming | Engineering | Active | NRIC (S) |
| Priya Sharma | Human Resources | Active | FIN (G) |
| Muhammad Faisal | Sales | Active | NRIC (S) |
| Sarah Lim | Marketing | Probation | NRIC (T) |
| Nguyen Thi Mai | Finance | Active | FIN (F) |
| David Wong | Operations | Active | NRIC (S) |
| Ahmad bin Osman | Customer Success | Active | NRIC (S) |
| Chen Mei Ling | Product | On Leave | NRIC (S) |
| Raj Kumar | Legal | Active | NRIC (S) |
| Lee Jia Hui | Administration | Active | NRIC (S) |

---

## 🔄 Future Enhancements

If this were a production system, the following would be added:

1. **Authentication**: Proper login with SSO integration
2. **Database**: PostgreSQL with Prisma ORM
3. **API Layer**: RESTful or GraphQL API
4. **File Uploads**: Profile photos and documents
5. **Bulk Import**: CSV/Excel employee import
6. **Reports**: PDF generation for employee data
7. **Notifications**: Email and in-app notifications
8. **Multi-tenancy**: Support for multiple organizations
9. **Mobile App**: React Native companion app
10. **Analytics**: Dashboard with HR metrics

---

## 👤 Author

**PM Internship Assessment Submission**

Built with ❤️ for HRnetGroup's Octomate platform assessment.

---

## 📄 License

This project is for assessment purposes only and is not intended for commercial use.

---

<div align="center">
  <img src="https://img.shields.io/badge/Built%20for-HRnetGroup-00A651?style=for-the-badge" alt="HRnetGroup" />
</div>
