# Web Crawler Dashboard

A full-stack web application for analyzing URLs by crawling web pages and reporting metadata, link statistics, and real-time crawl progress.

## Features

* **Authentication**: User registration and login with JWT stored in `localStorage`.
* **URL Management**:

  * Add new URLs to queue for crawling.
  * Paginated dashboard with global search, column filters (by status), and sortable columns (URL, Title, HTML version, link counts).
  * Bulk actions: Re-run, stop, or delete selected URLs via checkboxes.
  * Per-row action: Stop an in-flight crawl.
* **Real-Time Progress**:

  * EventSource-based progress bar updates from the server.
  * ✅/❌ indicators when done or error.
* **Details View**:

  * Donut chart showing internal vs. external links.
  * List of broken links.
  * Page metadata: HTML version, heading counts, login form presence.
* **Responsive Design**:

  * Fully responsive layout for desktop and mobile.
  * Horizontal scrolling table on narrow screens.
* **Accessibility & SEO**:

  * ARIA labels on buttons, inputs, and table controls.
  * Semantic markup and focus states.

## Tech Stack

* **Frontend**: Next.js 15 (App Router), React, TypeScript
* **UI**: Tailwind CSS, `@/components/ui/*` (shadcn/ui), `recharts` for charts
* **State & Data Fetching**: React Query, Zod + React Hook Form for validations
* **Icons**: `lucide-react`
* **Notifications**: `sonner` toast
* **Backend**: Go with Gin framework, MySQL, GORM
* **Migrations**: [`migrate`](https://github.com/golang-migrate/migrate)
* **Docker**: `docker-compose` for MySQL

## Prerequisites

* [Node.js](https://nodejs.org/) v18+ & npm or Yarn
* [Go](https://golang.org/) 1.20+
* [Docker](https://docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/web-crawler-dashboard.git
cd web-crawler-dashboard

# 2. Copy and edit environment variables
# Frontend: .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

# Backend: server/.env
DB_DSN=root:root@tcp(db:3306)/crawler?parseTime=true
JWT_SECRET=your_jwt_secret_here

# 3. Start MySQL with Docker
docker-compose up -d db

# 4. Run migrations (in host shell)
# Ensure migrate CLI is installed: `brew install golang-migrate` or download binary
migrate -path server/migrations \
        -database "mysql://root:root@tcp(localhost:3306)/crawler" up

# 5. Start the Go server
cd server
go run cmd/web-crawler/main.go

# 6. Install frontend dependencies & run Next.js
cd ../
# using npm\ nvm install && npm install
npm run dev
# or using yarn
# yarn install && yarn dev
```

* **Frontend** runs at `http://localhost:3000`
* **Backend API** runs at `http://localhost:4000/api/v1`

## Running Tests

```bash
# Frontend tests (Jest + React Testing Library)
npm test
```

## Project Structure

```
├── server/                # Go backend
│   ├── cmd/               # entrypoint
│   ├── internal/          # auth, handlers, crawler, database, models
│   └── migrations/        # SQL migrations
├── src/                   # Next.js frontend
│   ├── app/               # App Router pages & layouts
│   ├── components/        # UI primitives (shadcn/ui)
│   ├── features/urls/     # URL API hooks, table columns, components
│   └── lib/               # auth hook, fetch wrapper
├── docker-compose.yaml    # MySQL service
├── .env.local             # frontend env
└── README.md
```

## Edge Cases & Validation

* Zod schemas enforce:

  * Valid email/password on login & register.
  * URL must be a valid HTTP/HTTPS URL.
* Inline handling of 409 Duplicate URL error.
* Detail page truncates broken-links list at 100 with notice.

## License

MIT © Your Name
