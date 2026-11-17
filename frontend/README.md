# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Local development

Start the Django API separately, then run the frontend:

```powershell
npm install
npm run dev
```

The authentication screens use the Django API at `http://127.0.0.1:8000` by
default. To use a different API address, set `VITE_API_BASE_URL` in a local
`.env` file in this folder. Registration, login, and the authenticated current
user request are connected. Pending registrations are routed to an approval
status page, and administrators can review requests from the Role Requests
sidebar link. Tender listing, creation, and details use the Django tender API.
Other application screens are not connected yet.

## Role access

The sidebar and application routes are role-specific:

- **Admin:** dashboard, role approvals, and all procurement work areas.
- **Tender Manager:** tenders, bids, compliance, and reports.
- **Bidder:** tender browsing, own bids, compliance, and reports.
- **Reviewer:** tenders, bids, compliance, review cases, and reports.

Only Admin and Tender Manager can open the tender creation route. These
frontend checks improve navigation and prevent accidental access; Django API
permissions remain the security boundary. Screens described as not connected
above may still display mock data.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
