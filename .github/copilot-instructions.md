# Application

This repository contains a beer tier-list web app. Users can sign in, organize beer images into tier lists, and manage options for a spin wheel.

# Technology

- React 19 with TypeScript
- Material UI (MUI) 5 for UI components and theming
- React Router 7 for client-side routing
- ASP.NET Core backend API for authentication and application data
- NSwag-generated TypeScript API client and TanStack Query for client data
- Create React App (`react-scripts`) for development and production builds
- `@hello-pangea/dnd` for drag-and-drop tier-list interactions

# Project layout

- Application source code is in `app/src`.
- Route composition and authentication-protected pages are in `app/src/App.tsx`.
- Reusable UI is in `app/src/components`; API access and TanStack Query hooks are in `app/src/services`.
- The generated backend client is `app/src/services/api/generatedClient.ts`; regenerate it with `npm run generate:api` from `app` while the backend OpenAPI endpoint is available.
- Run the npm scripts from the `app` directory: `npm start`, `npm test`, and `npm run build`.
