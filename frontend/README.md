# Frontend folder structure

> **Note:** We are using Next.js App Router, not Page Router.

```
frontend/
  ├── app/
  │   ├── layout.tsx            // Layout component
  │   ├── error.tsx             // Error boundary component 
  │   ├── not-found.tsx         // 404 page
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

```sh
docker build -t frontend .
```

## 2. Run the container

macOS users:

```sh
docker run --name my-app -p 3000:3000 -v $(pwd):/app -d frontend
```

Windows users:

```sh
docker run --name my-app -p 3000:3000 -v %cd%:/app -d frontend
```

## 3. Access the application

Open your web browser and navigate to [http://localhost:3000/signup](http://localhost:3000/signup)

## 4. Terminate the application

```sh
docker stop my-app
docker rm my-app
```
