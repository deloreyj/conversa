# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PortuPal is a Portuguese (Portugal) learning app built with the RedwoodSDK framework using React Server Components (RSC). It features flashcard-based language learning with swipeable cards and AI-powered pack generation using Cloudflare Workflows.

## Key Development Commands

```bash
# Development
pnpm run dev                   # Start development server (default Vite)
pnpm run dev:wrangler         # Run with Wrangler (port 8787)
pnpm run dev:init             # Initialize dev environment

# Build and Deploy
pnpm run build                # Build for production
pnpm run release              # Full deployment process (clean, generate, build, deploy)
pnpm run preview              # Preview production build

# Database
pnpm run migrate:dev          # Apply migrations to local D1 database
pnpm run migrate:prd          # Apply migrations to production D1 database
pnpm run migrate:new          # Create new migration
pnpm run seed                 # Run seed script

# Code Quality
pnpm run generate             # Generate Prisma client and types
pnpm run check                # Run generate + type check
pnpm run types                # TypeScript type checking only
pnpm run clean                # Clean Vite cache
```

## Architecture

### Technology Stack
- **Frontend**: React with Server Components (RSC), Client Components for interactivity
- **Backend**: Cloudflare Workers with RedwoodSDK
- **Database**: SQLite with Prisma ORM via D1 (Cloudflare)
- **Session Management**: Durable Objects
- **Authentication**: WebAuthn (Passkey-based)
- **Styling**: Tailwind CSS v4
- **Animations**: React Spring, React Gesture

### Core Architecture Patterns

**React Server/Client Component Split**:
- Server components are default (no directive needed)
- Client components require `"use client"` directive
- Server functions require `"use server"` directive
- Context accessed via `requestInfo.ctx` in server functions

**Key Files**:
- `src/worker.tsx` - Main application entry point with routing and middleware
- `src/app/pages/Home.tsx` - Main page server component
- `src/components/FlashcardAppClient.tsx` - Main client-side interactive component
- `prisma/schema.prisma` - Database schema (User, Credential, FlashcardPack models)

### Data Flow
1. Server components fetch initial data (flashcard packs, user context)
2. Client components handle interactions (swipe gestures, pack selection)
3. Server functions handle mutations (pack generation, user actions)
4. Workflows handle long-running tasks (AI pack generation)

### Authentication Context
- User context available in server components via `{ ctx }: RequestInfo`
- Session management through Durable Objects
- Protected routes redirect to `/user/login` if not authenticated

## Flashcard System

**Core Components**:
- `FlashcardDeck` - Main deck container with swipe handling
- `DraggableFlashcard` - Individual card with drag/swipe animations
- `FlashcardAppClient` - Client wrapper managing pack state
- `GeneratePackDrawer` - AI pack generation interface

**Data Models**:
- `FlashcardPack` stores metadata + stringified JSON cards
- Individual cards have: `portuguese`, `english`, `phonetic` fields
- Packs categorized by difficulty and topic

**AI Pack Generation**:
- Uses Cloudflare Workflows (`src/workflows/flashcard-pack-generator.ts`)
- Integrates with OpenAI API for content generation
- Validates generated content with Zod schemas

## Development Guidelines

### Component Creation
- Follow existing patterns in `src/components/`
- Use server components by default
- Add `"use client"` only when needed for interactivity
- Server functions go in dedicated `functions.ts` files

### Database Changes
1. Modify `prisma/schema.prisma`
2. Run `pnpm run migrate:new` to create migration
3. Apply with `pnpm run migrate:dev`
4. Generate client with `pnpm run generate`

### Styling
- Uses Tailwind CSS v4 with @tailwindcss/vite
- Custom animations via `tw-animate-css`
- Responsive design with mobile-first approach

## Project Structure
```
src/
├── app/                    # Server components and routing
├── components/            # Reusable UI components
├── hooks/                # Custom React hooks
├── workflows/            # Cloudflare Workflows
├── session/              # Session management
├── worker.tsx            # Main app entry point
└── db.ts                 # Database setup
```