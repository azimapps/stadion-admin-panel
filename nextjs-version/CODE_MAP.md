# Codebase Map & Architecture Documentation

This document provides a high-level overview of the **Stadion Admin Panel** codebase (Next.js version). It explains the folder structure, key architectural decisions, and how to navigate the project.

## 📁 Project Structure

```
src/
├── app/                    # App Router (Next.js 15+)
│   ├── (auth)/             # Authentication routes (login, register) - Grouped layout
│   │   ├── sign-in/
│   │   └── layout.tsx      # Auth-specific layout (centered box)
│   ├── (dashboard)/        # Main wrapper for admin panel pages
│   │   ├── dashboard/      # Homepage / Stats
│   │   ├── stadiums/       # Stadium Management Feature
│   │   │   ├── [id]/       # Edit page
│   │   │   ├── new/        # Create page
│   │   │   ├── page.tsx    # List page with Table
│   │   │   └── components/ # Feature-specific components (Forms, Tables)
│   │   └── layout.tsx      # Dashboard layout (Sidebar + Header)
│   ├── layout.tsx          # Root layout (Fonts, Providers, Toaster)
│   └── globals.css         # Global styles & Tailwind directives
│
├── components/             # Shared UI Components
│   ├── ui/                 # Shadcn UI primitives (Button, Input, Dialog, etc.)
│   ├── app-sidebar.tsx     # Main Sidebar navigation
│   ├── site-header.tsx     # Top navigation bar
│   └── ...
│
├── lib/                    # Utilities & Configurations
│   ├── utils.ts            # CN helper for Tailwind classes
│   ├── auth.ts             # Auth constants/logic
│   └── fonts.ts            # Font configurations
│
├── services/               # API Communication Layer
│   ├── stadium.ts          # Stadium CRUD operations
│   └── upload.ts           # File upload logic
│
└── types/                  # Global TypeScript Interfaces
```

---

## 🧩 Key Architectural Concepts

### 1. Data Fetching & State
- **Services Pattern**: All API calls are abstracted into `src/services/`. Components should not call `fetch` directly; they should use `stadiumsService.getAll()`, etc.
- **Mock Mode**: The `stadiumsService` includes a fallback to `localStorage` if the backend is offline. This is crucial for UI development.

### 2. Forms Management
- **Library**: `react-hook-form` + `zod` for validation.
- **Structure**:
  - `stadium-schema.ts`: Defines the shape of the data and validation rules.
  - `stadium-form.tsx`: The actual UI component. It is reusable for both **Create** and **Edit** modes.

### 3. UI System
- **Shadcn UI**: We use a copy-paste component library. All base components live in `src/components/ui`.
- **Styling**: Tailwind CSS is used for everything.
- **Icons**: `lucide-react`.

---

## 📍 Feature Map: Stadiums

The **Stadiums** module is the core feature. Here is how it is mapped out:

| File / Component | Purpose |
|------------------|---------|
| `src/app/.../stadiums/page.tsx` | **List Page**. Fetches data and renders the `DataTable`. |
| `src/app/.../stadiums/new/page.tsx` | **Create Page**. Wraps the `StadiumForm`. Handles "Success" toast and redirect. |
| `src/app/.../stadiums/components/stadium-form.tsx` | **The Big Form**. Handles all inputs, tabs, validation, and submission logic. |
| `src/app/.../stadiums/components/location-picker.tsx` | **Map Component**. A dedicated component for selecting coordinates on a map. |
| `src/services/stadium.ts` | **API Layer**. Sends JSON data to the backend (or Mock Storage). |

---

## 🛠 Common Tasks

### How to add a new page?
1. Create a folder in `src/app/(dashboard)/`.
2. Add `page.tsx`.
3. Add a link to `src/components/app-sidebar.tsx`.

### How to change the Form UI?
1. Go to `src/app/(dashboard)/stadiums/components/stadium-form.tsx`.
2. The form is divided into `TabsContent` sections (Main, UZ, RU, Details, Media).
3. Modify the specific section you need.

### How to manage API endpoints?
1. Open `src/services/stadium.ts`.
2. All endpoints (`/api/v1/stadiums`) are defined there.
