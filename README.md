# Ciltra Platform Frontend

This is the frontend application for the Ciltra Platform, a comprehensive system for managing exams, students, examiners, and certificates. Built with Next.js 16, React 19, and Tailwind CSS.

## 🚀 Getting Started

### Prerequisites

-   Node.js (v18 or higher recommended)
-   npm or pnpm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd ciltra-frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    pnpm install
    # or
    yarn install
    ```

### Running the Development Server

Start the development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

The project follows a standard Next.js App Router structure:

```
ciltra-frontend/
├── app/                  # Next.js App Router pages & layouts
│   ├── admin/            # Admin dashboard and management features
│   ├── certificates/     # Certificate display and verification
│   ├── exam/             # Exam related routes
│   ├── exams/            # Exam listings and details
│   ├── examiner/         # Examiner portal
│   ├── student/          # Student portal
│   ├── login/            # Authentication login page
│   ├── register/         # User registration page
│   ├── verify/           # Content verification (e.g., certificates)
│   ├── globals.css       # Global application styles
│   └── layout.tsx        # Root layout with providers
├── components/           # Reusable React components
│   ├── ui/               # Base UI components (Buttons, Inputs, Dialogs, etc.)
│   ├── admin-sidebar.tsx # Sidebar navigation for admin area
│   ├── header.tsx        # Main application header
│   └── auth-guard.tsx    # Authentication protection wrapper
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and shared logic
├── public/               # Static assets (images, icons)
└── styles/               # Additional style resources
```

## 🛠 Technologies Used

-   **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
-   **Library:** [React 19](https://react.dev/)
-   **Styling:** 
    -   [Tailwind CSS 4](https://tailwindcss.com/)
    -   [Radix UI](https://www.radix-ui.com/) (Primitives)
    -   [Lucide React](https://lucide.dev/) (Icons)
-   **Forms:** React Hook Form + Zod
-   **Charts:** Recharts
-   **Language:** TypeScript

## 📜 Scripts

-   `npm run dev`: Starts the development server.
-   `npm run build`: Builds the application for production.
-   `npm run start`: Starts the production server.
-   `npm run lint`: Runs ESLint to check for code quality issues.
