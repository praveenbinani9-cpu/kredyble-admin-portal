# Kredyble Admin Dashboard - PRD

## Original Problem Statement
Build a modern, professional web-based admin dashboard for a fintech platform called Kredyble that enables:
1. Vendor payments via credit cards (user pays amount + platform fee + GST)
2. Payment collection via links (customers pay via UPI/cards/net banking)

## User Personas
- **Fintech Platform Administrators**: Monitor transactions, payouts, revenue, and compliance
- **Finance Team Members**: Track GST, PG charges, revenue analytics

## Core Requirements (Static)
- Clean, data-dense but readable UI
- Finance-grade design (like Razorpay, Stripe, Mercury)
- Desktop-first (1440px width)
- JWT-based authentication
- Mock data for all screens

## Architecture
- **Frontend**: React + Shadcn UI + Recharts + Tailwind CSS
- **Backend**: FastAPI with mock data generators
- **Database**: MongoDB (configured but using mock data)
- **Auth**: JWT tokens stored in localStorage

## What's Been Implemented (Jan 2026)
### Backend (server.py)
- [x] JWT authentication (login/verify)
- [x] Dashboard stats & charts APIs
- [x] Collections & flow APIs
- [x] Transactions CRUD with pagination
- [x] Payouts with status filtering
- [x] Payment links APIs
- [x] Beneficiaries APIs
- [x] Memberships APIs
- [x] Offers & pricing APIs
- [x] Users & KYB APIs
- [x] Revenue analytics APIs
- [x] PG charges APIs
- [x] GST & tax APIs
- [x] Risk & flags APIs

### Frontend (14 Pages)
- [x] Login page with JWT auth
- [x] Dashboard with KPI cards & charts
- [x] Collections & Flow with flow visualization
- [x] Transactions table with side drawer
- [x] Payouts with tabs (Completed/In Process/Failed)
- [x] Payment Links with metrics & timeline
- [x] Beneficiaries management
- [x] Offers & Pricing cards with toggle
- [x] Memberships table
- [x] Users & KYB with profile drawer
- [x] Revenue Analytics with charts
- [x] PG Charges summary & table
- [x] GST & Tax with CGST/SGST split
- [x] Risk & Flags with action buttons
- [x] Support page

### Components
- [x] Sidebar navigation with sections
- [x] Header with search, date filter, notifications, profile
- [x] KPI cards with trends
- [x] Status badges with color coding
- [x] Transaction drawer with full breakdown
- [x] Flow visualization component

## Prioritized Backlog
### P0 (Critical)
- None - Core MVP complete

### P1 (High Priority)
- [ ] Real database integration
- [ ] Real payment gateway integration
- [ ] User registration flow
- [ ] Create transaction functionality

### P2 (Medium Priority)
- [ ] Export to CSV/PDF
- [ ] Email notifications
- [ ] Audit logs
- [ ] Multi-tenancy support

## Next Tasks
1. Connect to real payment gateway APIs
2. Implement create/edit forms for all entities
3. Add real-time notifications
4. Implement data export functionality
