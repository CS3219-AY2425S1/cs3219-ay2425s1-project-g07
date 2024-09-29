# Frontend folder structure

> **Note:** We are using Next.js App Router, not Page Router.

```
frontend/
  ├── app/
  │   ├── layout.tsx            // Layout component
  │   ├──(dashboard)/           // Route group to organise files without affecting the URL path structure.
  │   |   ├── layout.tsx        // Layout contains navigation bar shared across practice, profile and questions pages.
  |   |   ├── practice/         // http://localhost:3000/practice
  |   |   |   └── page.tsx 
  |   |   ├── profile/          // http://localhost:3000/profile
  |   |   |   └── page.tsx 
  |   |   └── questions/        // http://localhost:3000/questions
  |   |       └── page.tsx 
  │   └── (account)/            // Route group to organise files without affecting the URL path structure.
  │       ├── layout.tsx        // Layout contains {PeerPrep} logo shared across login and signup pages.
  |       ├── login/            // http://localhost:3000/login
  |       |   └── page.tsx 
  |       └── signup/           // http://localhost:3000/signup
  |           └── page.tsx 
  ├── components/               // Reusable UI components
  │   ├── NavbarCard.tsx
  │   ├── Footer.tsx
  │   └── Button.tsx
  ├── lib/                      // Library code and utilities
  │   ├── api.ts
  │   ├── fetcher.ts
  │   └── utils.ts
  ├── hooks/                    // Custom React hooks
  │   ├── useAuth.ts
  │   ├── useFetch.ts
  │   └── useForm.ts
  ├── styles/                   // CSS or styled-components
  │   ├── globals.css
  │   └── theme.css
  ├── public/                   // Static assets (e.g., images)
  │   └── images/
  ├── types/                    // TypeScript types and interfaces
  │   ├── index.d.ts
  │   └── models.ts
  └── next.config.js            // Next.js configuration

```

## 1. Build the Docker image

Ensure you are in the frontend directory

