# Web Crawler Dashboard

A full-stack web application for analyzing URLs by crawling web pages and reporting metadata, link statistics, and real-time crawl progress.

## Features

*   **Authentication**: User registration and login with JWT stored in `localStorage`.
*   **URL Management**:
    *   Add new URLs to queue for crawling.
    *   Paginated dashboard with global search, column filters (by status), and sortable columns (URL, Title, HTML version, link counts).
    *   Bulk actions: Re-run, stop, or delete selected URLs via checkboxes.
    *   Per-row action: Stop an in-flight crawl.
*   **Real-Time Progress**:
    *   EventSource-based progress bar updates from the server.
    *   ✅/❌ indicators when done or error.
*   **Details View**:
    *   Donut chart showing internal vs. external links.
    *   List of broken links (first 100, with a note if more exist).
    *   Page metadata: HTML version, heading counts, login form presence.
*   **Responsive Design**:
    *   Fully responsive layout for desktop and mobile.
    *   Horizontal scrolling table on narrow screens.
*   **Accessibility & SEO**:
    *   ARIA labels on buttons, inputs, and table controls.
    *   Semantic markup and focus states.

## Tech Stack

*   **Frontend**: Next.js 15 (App Router), React, TypeScript
*   **UI**: Tailwind CSS, shadcn/ui components, recharts for charts
*   **State & Data Fetching**: React Query, Zod + React Hook Form for validations
*   **Icons**: lucide-react
*   **Notifications**: sonner toast
*   **Backend**: Go (Gin), MySQL, GORM
*   **Migrations**: migrate CLI
*   **Docker**: docker-compose for local development

## Prerequisites

*   [Node.js](https://nodejs.org/) v18+ & npm or Yarn
*   [Go](https://golang.org/) 1.20+
*   [Docker](https://docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

## Getting Started (Local)

> Follow these steps to run services individually.

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/web-crawler-dashboard.git
cd web-crawler-dashboard

# 2. Set environment variables (create client/.env.local and server/.env)
# Frontend (client/.env.local)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Backend (server/.env)
DB_DSN=root:root@tcp(localhost:3306)/crawler?parseTime=true
JWT_SECRET=supersecret_dev

# 3. Start MySQL
# (or via Docker Compose below)

# 4. Run migrations
migrate -path server/migrations \
        -database "mysql://root:root@tcp(localhost:3306)/crawler" up

# 5. Start the Go API server
cd server
go run ./cmd/api/main.go

# 6. Start the Next.js frontend
cd ../client
npm install
npm run dev
```

*   Frontend: [http://localhost:3000](http://localhost:3000)
*   Backend API: [http://localhost:8080/api/v1](http://localhost:8080/api/v1)

## Quick Start with Docker Compose

Use the provided `docker-compose.yaml` to build and run all services with a single command:

```bash
# In project root
docker-compose up --build
```

This will launch:

*   **MySQL** at port 3306
*   **Go API** at port 8080
*   **Next.js Web** at port 3000

Once up:

*   Visit [http://localhost:3000](http://localhost:3000) to access the dashboard.

## Running Tests

```bash
# Frontend tests
cd client
npm test
```

## Project Structure

```
├── .github/              # GitHub Actions workflows
├── client/               # Next.js frontend
│   ├── public/           # Static assets
│   └── src/              # Application source code
│       ├── app/          # App Router pages & layouts
│       ├── components/   # UI primitives (shadcn/ui)
│       ├── features/     # Feature-based modules (e.g., URLs)
│       └── lib/          # Core utilities, auth, etc.
├── deployments/          # Dockerfiles for deployment
├── server/               # Go backend
│   ├── cmd/api/          # API server entrypoint
│   ├── internal/         # Business logic (auth, crawler, handlers)
│   └── migrations/       # SQL migration files
├── docker-compose.yaml   # Docker Compose for local development
├── LICENSE               # Project License
└── README.md             # This file
```

## Edge Cases & Validation

*   Zod schemas enforce:
    *   Required and formatted email/password on login & register.
    *   URL must be valid HTTP/HTTPS, with inline 409 Duplicate entry handling.
*   Detail page:
    *   Truncates broken-links list to 100 items, shows note if more exist.

## License

MIT © 2025 zeewaqar
