# Subscription Management System Workflow

## 1. Product Overview

### What the system does
This Subscription Management System is a centralized platform for managing the complete lifecycle of recurring revenue products. It automates billing, manages complex subscription states (Draft → Active → Closed), generates immutable financial documents (Invoices), and provides role-based access for Admins, internal staff, and end customers.

### What real business problems it solves
- **Revenue Leakage**: Prevents undercharged subscriptions or missed billing cycles through automated, state-driven invoicing.
- **Operational Overhead**: Eliminates manual spreadsheets for tracking renewals, upgrades, and cancellations.
- **Compliance & Audit**: Ensures all financial documents (Invoices, Credit Notes) are generated deterministically and cannot be tampered with after finalization.
- **Customer Experience**: Provides a self-service portal for customers to view their history and manage payments, reducing support tickets.

### Why this is an ERP-style system
Unlike a standard CRUD application, this system enforces **strict transactional integrity** and **accounting principles**.
- Data is not just "deleted"; it is voided or archived to maintain audit trails.
- Status transitions are one-way for financial documents (e.g., an Invoice cannot go from 'Paid' back to 'Draft').
- Business logic is decoupled from the UI, ensuring that API calls or direct database access (by authorized roles) cannot bypass critical validation rules.

## 2. System Architecture

### Frontend ↔ Supabase Interaction
- **Frontend (Next.js)**: Acts purely as a presentation layer. It visualizes data and captures user intent. It holds **zero** trusted business logic.
- **Supabase Client**: The frontend uses the Supabase JS client to query the database directly for *read* operations, protected by **Row Level Security (RLS)**.
- **Mutations**: Critical write operations (creating subscriptions, confirming payments) are routed through **Supabase Edge Functions** or invoke **Database Functions** (RPCs) to ensure atomicity.

### Auth and Session Flow
1.  **Authentication**: Users sign in via Supabase Auth (Email/Password).
2.  **Session**: Supabase issues a JWT containing the user's `sub` (UUID).
3.  **Role Resolution**:
    - A `public.profiles` table links `auth.users` to an application role (`admin`, `internal_user`, `customer`).
    - **Database Trigger**: On `auth.users` insert, a trigger automatically creates a `public.profiles` entry with a default role (e.g., `customer`).
    - **Enforcement**: RLS policies reference `public.profiles.role` to determine access rights for every query.

### Where Logic Lives
- **Database (Postgres)**:
    - **Source of Truth**: All data storage.
    - **Data Integrity**: Checks, Foreign Keys, Not Null constraints.
    - **Access Control**: Row Level Security (RLS) policies.
- **Edge Functions / Database Functions**:
    - **Business Logic**: Complex state transitions (e.g., "Active" -> "Past Due"), Invoice Generation, Payment processing.
    - **Scheduled Tasks**: Cron jobs for recurring billing.
- **Frontend**:
    - **UI/UX**: Form validation (visual only), navigation, data display.

## 3. Module-by-Module Breakdown

### Authentication & Roles
- **Purpose**: Identity and Access Management.
- **Responsibility**: Authenticate users and assign their permissions.
- **Data**: `auth.users`, `public.profiles`.
- **Dependencies**: None.

### Dashboard & Navigation
- **Purpose**: Operational overview.
- **Responsibility**: Aggregate key metrics (MRR, Active Subs) for Admins; Show personal usage for Customers.
- **Data**: Read-only aggregation of `subscriptions`, `invoices`.
- **Dependencies**: All modules.

### Products
- **Purpose**: Catalog of offerings.
- **Responsibility**: Define base items, prices, and hierarchy.
- **Data**: `products` (Name, Description, Base Price, Tax interactions).
- **Dependencies**: None.

### Product Variants
- **Purpose**: SKU differentiation.
- **Responsibility**: Handle variations (Size, Color, License Type) of a base product.
- **Data**: `product_variants` (Attributes, Price Adjustments).
- **Dependencies**: Products.

### Recurring Plans
- **Purpose**: Billing frequency configuration.
- **Responsibility**: Define rules for recurrence (Monthly, Yearly) and terms.
- **Data**: `plans` (Interval, Cancellation Rules).
- **Dependencies**: Products.

### Subscriptions
- **Purpose**: The core recurring agreement.
- **Responsibility**: Link a Customer to a Plan + Product. Track status and next billing dates.
- **Data**: `subscriptions` (Status, Start/End Date, Next Bill Date).
- **Dependencies**: Customers, Plans, Products.

### Quotation Templates
- **Purpose**: Efficiency for sales teams.
- **Responsibility**: Pre-filled subscription drafts for common sales scenarios.
- **Data**: `quotation_templates`.
- **Dependencies**: Plans, Products.

### Invoices
- **Purpose**: Accounts Receivable.
- **Responsibility**: Immutable record of debt. Generated automatically from Subscriptions.
- **Data**: `invoices`, `invoice_lines`.
- **Dependencies**: Subscriptions, Taxes.

### Payments
- **Purpose**: Cash application.
- **Responsibility**: Record settlements against Invoices.
- **Data**: `payments` (Amount, Date, Method, Reference ID).
- **Dependencies**: Invoices.

### Taxes
- **Purpose**: Fiscal compliance.
- **Responsibility**: Calculate tax amounts based on rules (Region, Product Type).
- **Data**: `taxes`, `tax_rates`.
- **Dependencies**: Invoices.

### Discounts
- **Purpose**: Sales enablement.
- **Responsibility**: Apply price reductions (Percentage or Fixed) to Invoices or Subscriptions.
- **Data**: `discounts` (Code, Amount, Validity).
- **Dependencies**: Invoices.

### Users / Contacts
- **Purpose**: Entity management.
- **Responsibility**: Manage Customer profiles and Internal Staff.
- **Data**: `profiles`.
- **Dependencies**: Auth.

### Reports
- **Purpose**: Business Intelligence.
- **Responsibility**: Visualizing performance (Churn, LTV, MRR).
- **Data**: Aggregated views of all financial tables.
- **Dependencies**: All modules.

## 4. Data Model (Conceptual)

- **`profiles`**: Extends `auth.users`. Stores `role`, `name`, `billing_address`.
    - Roles: `admin`, `internal`, `customer`.
- **`products`** & **`variants`**: Definition of what is sold.
- **`plans`**: Definition of *time*. (e.g., "Monthly Standard").
- **`subscriptions`**: The central junction table.
    - `customer_id` (FK to profiles)
    - `plan_id` (FK to plans)
    - `status` (Enum: draft, active, etc.)
- **`invoices`**: Generated snapshot of debt.
    - `subscription_id` (FK)
    - `total`, `tax`, `discount`
    - `status` (draft, open, paid, void)
- **`payments`**: Money flow.
    - `invoice_id` (FK)
    - `amount`

**Flow**:
1.  **Product + Plan** are defined (Admin).
2.  **Customer** is created.
3.  **Subscription** links Customer + Plan (Draft).
4.  **Activation** moves Subscription to Active.
5.  **Time passes** -> **Invoice** is generated.
6.  **Payment** is recorded -> **Invoice** is Paid.

## 5. Subscription Lifecycle

### 1. Draft
- **Meaning**: A proposal or cart. Not yet binding.
- **Allowed**: Edit Items, Change Plan, Apply/Remove Discounts.
- **Transitions**: -> Quotation (Send to Customer), -> Active (Immediate Activation).
- **Blocked**: Cannot generate Invoices.

### 2. Quotation
- **Meaning**: Offer sent to customer. Locked pricing.
- **Allowed**: Customer View, Customer Accept/Reject.
- **Transitions**: -> Confirmed (Accepted), -> Draft (Recall/Edit).
- **Blocked**: Editing prices/items (must revert to Draft first).

### 3. Confirmed
- **Meaning**: Customer accepted, waiting for provisioning/payment setup.
- **Allowed**: Add Payment Method.
- **Transitions**: -> Active.

### 4. Active
- **Meaning**: Service is live. Billing is running.
- **Allowed**: Usage, Upgrade/Downgrade (creates new version), Cancel (schedule end).
- **Transitions**: -> Closed (Cancellation/Expiration), -> Past Due (Payment Failure).
- **Blocked**: Deleting the subscription history.

### 5. Closed
- **Meaning**: Contract ended.
- **Allowed**: Read-only historical view. Re-activate (creates NEW subscription).
- **Transitions**: None (Terminal state).

**DB Constraint**: Status column is an Enum. Invalid transitions (e.g., Active -> Draft) are blocked by Database Triggers.

## 6. Billing & Invoicing Logic

### Recurring Billing
- A **Scheduled Edge Function** runs daily/hourly.
- It scans `subscriptions` where:
    - `status = 'active'`
    - `next_billing_date <= NOW()`
- **Action**:
    1.  Create `invoice` (Status: Draft).
    2.  Copy Line Items from Subscription.
    3.  Apply Tax/Discounts.
    4.  Finalize `invoice` (Status: Open).
    5.  Advance `next_billing_date` by `plan.billing_interval`.

### Pricing & Totals
- **Subtotal**: Sum(Line Items * Quantity).
- **Discountable Amount**: Subtotal - (Applicable Discounts).
- **Taxable Amount**: Discountable Amount.
- **Tax**: Taxable Amount * Tax Rate.
- **Total**: Taxable Amount + Tax.
- **Balance Due**: Total - Sum(Related Payments).

### Payment Effects
- When a Payment is logged:
    - If `Balance Due <= 0`: Mark Invoice as `Paid`.
    - If Invoice marks `Paid` AND Subscription was `Past Due`: Reactivate Subscription.

## 7. Security & Access Control Model

### Why RLS is Mandatory
This ensures that even if the UI code has a bug (e.g., accidentally showing a "Delete" button to a junior sales rep), the database will reject the request.

### Roles & Permissions
- **Admin**:
    - **Can**: CRUD on ALL tables. Manage Users.
    - **Cannot**: Modify immutable history (enforced by trigger, not RLS).
- **Internal User**:
    - **Can**: Read Products/Customers. Create Draft Subscriptions. Send Quotations.
    - **Cannot**: Delete Products. Delete Active Subscriptions. View System Config.
- **Customer**:
    - **Can**: Read OWN Profile, Subscriptions, Invoices. Pay Invoices.
    - **Cannot**: See other customers. Change Prices. Activate their own subscription (must pay first).

### Privilege Escalation Prevention
- The `role` column on `profiles` is protected. Only a `superuser` (Supabase Service Role) or an Admin with specific claims can update it.
- RLS Policy: `CHECK (auth.uid() = id)` for self-updates ensures users can't change others' data.

## 8. Execution Plan

### Sprint 1: Foundation
**Goal**: Establish the secure core.
- **Build**:
    - Database Schema (Profiles, basic Enum types).
    - Auth Integration (Connect Supabase Auth -> `profiles` trigger).
    - RLS Policies for Roles (Admin, Internal, Customer).
    - Navigation Skeleton (protected routes).
- **Validation**:
    - "Can I log in as Admin?"
    - "If I log in as Customer, can I see Admin data? (Fail test)"
- **Definition of Done**: Access Control is fully functional. 0% of business data acts as "public".

### Sprint 2: Core Business Logic
**Goal**: Enabling the sale.
- **Build**:
    - Product Catalog (Tables: `products`, `variants`, `plans`).
    - Subscription Logic (Tables: `subscriptions`, `items`).
    - Quotation System (Flow: Draft -> Customer View).
    - Invoice Generation (Basic manual trigger).
    - Tax/Discount tables.
- **Validation**:
    - Create Product -> Create Plan -> Create Subscription.
    - Verify `next_billing_date` calculation.
- **Definition of Done**: An Admin can manually cycle a subscription from Draft to Active to Invoice.

### Sprint 3: Revenue & Operations
**Goal**: Closing the loop.
- **Build**:
    - Payments Module (Recording transactions).
    - Reporting Views (SQL Views for Dashboard).
    - Automated Billing (Edge Function / Cron).
    - Performance Indexing.
- **Validation**:
    - "Run the billing job: does it create invoices for all due subscriptions?"
    - "Record full payment: does status flip to Paid?"
- **Definition of Done**: System can run autonomously for a billing cycle.

## 9. Non-Functional Requirements

- **Performance**:
    - RLS adds overhead. We offset this by indexing `user_id` columns and creating specific View-based queries for dashboards to avoid heavy joins in standard API calls.
    - Target: < 200ms for standard fetches.
- **Scalability**:
    - Billing Engine (Edge Function) processes in batches (e.g., 500 subs/batch) to prevent timeouts.
    - Horizontal scaling handled by Postgres/Supabase infrastructure.
- **Reliability**:
    - Database transactions for all multi-table writes (e.g., Invoice + Lines).
    - Idempotency keys for Payment processing.
- **Security**:
    - All API keys stored in env vars.
    - Service Role key never exposed to client.

## 10. Final Engineering Notes

- **Money Logic**: NEVER trust the frontend to send "Total Amount" to the backend. The backend must look up the Product Price and calculate `Price * Quantity`. The frontend only sends `product_id` and `quantity`.
- **Dates**: Always use `timestamptz`. Subscription billing is time-sensitive (midnight UTC).
- **Evolution**: This system is designed to be the "kernel". Later, you can add a specialized "Stripe Integration" module or "Email Notification" module without rewriting core logic—just hook into the existing database state changes.
