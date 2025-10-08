# Cloudflare Access Integration Guide

This guide explains how to integrate Cloudflare Access with PortuPal for user identification and private flashcard packs.

## How Cloudflare Access Works

Cloudflare Access acts as an authentication proxy that sits in front of your application. When users access your app:

1. **User hits your app** → Cloudflare Access intercepts the request
2. **Authentication** → User authenticates with an identity provider (Google, GitHub, email OTP, etc.)
3. **JWT injection** → Cloudflare adds a JWT to the request in the `Cf-Access-Jwt-Assertion` header
4. **Your app validates** → Your Worker validates the JWT and extracts user identity

## Integration Steps

### 1. Set Up Cloudflare Access Application

In the Cloudflare Zero Trust dashboard:
- Create a new Access application for your domain
- Configure identity providers (Google, GitHub, email)
- Set access policies (e.g., allow all authenticated users)
- Get your **Team Domain** and **Application AUD** (audience tag)

### 2. Validate JWTs in Your Worker

Since you're already using Cloudflare Workers (in `src/worker.tsx`), you can validate the JWT using the `jose` library:

```typescript
import { jwtVerify, createRemoteJWKSet } from 'jose';

// Add to your middleware
const token = request.headers.get('cf-access-jwt-assertion');

if (token) {
  try {
    const JWKS = createRemoteJWKSet(
      new URL(`${env.TEAM_DOMAIN}/cdn-cgi/access/certs`)
    );

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: env.TEAM_DOMAIN,
      audience: env.POLICY_AUD,
    });

    // Extract user info
    const userId = payload.sub; // Unique user ID
    const email = payload.email; // User email

    // Use this to create/identify users in your DB
  } catch (error) {
    // Invalid token - reject request
  }
}
```

### 3. User Identification for Private Packs

The JWT payload contains:
- `sub` - Unique stable user identifier (use this as primary key)
- `email` - User's email address
- `name` - User's display name
- `country` - User's country code

You can:
1. Extract `payload.sub` as the stable user ID
2. Create or lookup users in your D1 database
3. Associate flashcard packs with this user ID for private packs

### 4. Required Environment Variables

Add to your `wrangler.jsonc`:

```jsonc
{
  "vars": {
    "TEAM_DOMAIN": "https://yourteam.cloudflareaccess.com",
    "POLICY_AUD": "your-application-aud-tag-here"
  }
}
```

### 5. Install Dependencies

```bash
pnpm add jose
```

## Benefits for Your Use Case

- **Simple setup** - No password management, WebAuthn complexity removed
- **User identification** - Stable `sub` field for user identity
- **Multiple providers** - Users can sign in with Google, GitHub, email, etc.
- **Low friction** - Optional authentication (can allow anonymous + authenticated users)
- **JWT-based** - All user info in the validated JWT, no separate API calls

## Optional: Mixed Access

You can make Access optional:
- Allow unauthenticated users to see public packs
- Check for the JWT header - if present and valid, show private packs
- If absent, only show public content

This gives you lightweight auth without heavy protection, but enables user-specific features like private flashcard packs.

## Database Schema Changes

You'll need to update your Prisma schema to support user-owned packs:

```prisma
model User {
  id              String          @id // Use payload.sub from JWT
  email           String          @unique
  name            String?
  createdAt       DateTime        @default(now())
  flashcardPacks  FlashcardPack[]
}

model FlashcardPack {
  id          String   @id @default(cuid())
  title       String
  description String?
  difficulty  String
  topic       String
  cards       String   // JSON stringified array of cards
  isPublic    Boolean  @default(false) // New field
  userId      String?  // Optional - null for system packs
  user        User?    @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Implementation Example

```typescript
// In your middleware or route handler
async function getUserFromRequest(request: Request, env: Env): Promise<User | null> {
  const token = request.headers.get('cf-access-jwt-assertion');

  if (!token) return null;

  try {
    const JWKS = createRemoteJWKSet(
      new URL(`${env.TEAM_DOMAIN}/cdn-cgi/access/certs`)
    );

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: env.TEAM_DOMAIN,
      audience: env.POLICY_AUD,
    });

    // Upsert user in database
    const user = await prisma.user.upsert({
      where: { id: payload.sub as string },
      update: {
        email: payload.email as string,
        name: payload.name as string,
      },
      create: {
        id: payload.sub as string,
        email: payload.email as string,
        name: payload.name as string,
      },
    });

    return user;
  } catch (error) {
    console.error('JWT validation failed:', error);
    return null;
  }
}
```

## Resources

- [Cloudflare Access Documentation](https://developers.cloudflare.com/cloudflare-one/policies/access/)
- [Validate JWTs in Workers](https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/validating-json/)
- [JWT Payload Structure](https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/application-token/)
- [jose NPM Package](https://www.npmjs.com/package/jose)