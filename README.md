# ProNet - Professional Networking Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://example.com)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)

## Overview

ProNet is a modern, LinkedIn-inspired professional networking platform built for freelancers and professionals. It enables users to connect, share posts, manage projects, and engage in messaging. The app uses Next.js for the frontend, Supabase for authentication and database management, and shadcn/ui for a consistent UI experience.

## Features

- **User Authentication**: Secure sign-up, login, and password reset via Supabase Auth.
- **Profile Management**: Create and edit professional profiles with skills, projects, and experience.
- **Feed & Posts**: Share updates, images, and engage with the community.
- **Messaging**: Real-time chat with file attachments.
- **Connections**: Build and manage professional networks.
- **Projects & Jobs**: Post and discover freelancing opportunities.
- **Responsive Design**: Mobile-first UI with Tailwind CSS.

## Tech Stack

- **Frontend**: Next.js 15.5.4, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend/Database**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: React hooks (useState, useEffect)
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project setup

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/pronet-linkedin-clone.git
   cd pronet-linkedin-clone
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Set up the database:
   Run the SQL scripts in the `scripts/` directory to create tables and policies:

   ```bash
   # Example: Apply schema and RLS policies
   psql -h your-db-host -U your-user -d your-db -f scripts/001_create_database_schema.sql
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
pronet-linkedin-clone/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages (login, signup, etc.)
│   ├── dashboard/         # Main dashboard
│   ├── feed/              # Feed and posts
│   ├── messages/          # Messaging system
│   ├── profile/           # User profiles
│   └── ...
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui base components
│   ├── feed/             # Feed-related components
│   ├── messaging/        # Chat and messaging components
│   └── ...
├── lib/                  # Utilities and configurations
│   ├── supabase/         # Supabase client and server setup
│   └── utils.ts          # General utilities
├── scripts/              # Database setup scripts
├── public/               # Static assets
└── ...
```

## Key Components

- **Navigation**: Responsive navbar with search and user menu.
- **PostCard**: Displays individual posts with likes, comments, and actions.
- **ChatInterface**: Real-time messaging with file attachments.
- **ConfirmationDialog**: Reusable modal for confirmations (e.g., deletions).

## Development Guidelines

- **Code Style**: Follow shadcn/ui "new-york" style; use Prettier for formatting.
- **Types**: Explicit TypeScript types required; use interfaces for props.
- **Imports**: Use absolute paths (e.g., `@/components/ui/button`).
- **Security**: Implement RLS policies in Supabase; use confirmation dialogs for destructive actions.
- **Testing**: Add Vitest for unit tests (not currently configured).

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run start` - Start production server

## Support

For issues or questions, open an issue on GitHub or contact the maintainers.

