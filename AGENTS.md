# Agent Development Guide

## Application Context
- **Conversa**: Portuguese (Portugal) language learning app focused on flashcards
- **Features**: Phrase packs by theme (animals, food, verbs) and situations (ordering food, uber, doctor)
- **Audio**: Text-to-speech for pronunciation, future speech-to-text for practice
- **Design**: Mobile-first, premium feel with smooth animations and clean UI interactions
- **Target**: On-the-go learning optimized for phone usage

## Build Commands
- `npm run build` - Production build
- `npm run dev` - Development server  
- `npm run types` - TypeScript type checking
- `npm run check` - Generate types and run type checking
- `npm run generate` - Generate Prisma client and Wrangler types
- No test framework detected - check with maintainer for testing approach

## Code Style & Conventions
- **React**: Use React Server Components by default; add `"use client"` only when interactivity is needed
- **Server Functions**: Mark with `"use server"` directive at top of file
- **Imports**: Use `@/` path alias for src directory imports
- **Naming**: camelCase for functions/variables, PascalCase for components
- **Types**: Full TypeScript with strict mode enabled
- **Styling**: Tailwind CSS with `cn()` utility function from `@/lib/utils`
- **Error Handling**: Use ErrorResponse class from rwsdk/worker for structured errors

## Framework Specifics
- Built with RedwoodSDK on Cloudflare Workers
- Use `requestInfo` from "rwsdk/worker" to access request context in server functions
- Database access via Prisma with D1 adapter
- Session management through custom durable object store
- Follow cursor rules in `.cursor/rules/` for React Server Components patterns

## Key Patterns
- Server components can be async and fetch data directly
- Pass `ctx` through props for request context
- Use middleware pattern in worker.tsx for request processing
- Implement proper security headers and session handling