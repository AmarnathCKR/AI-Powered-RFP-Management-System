# AI-Powered RFP Management System

An AI-augmented Request for Proposal (RFP) management system with a TypeScript full-stack codebase. The project provides basic RFP creation, analysis, vendor management, and email integration (SMTP/IMAP). The backend uses Express + Mongoose and integrates with OpenRouter for LLM access. The frontend is a Vite + React app (MUI + Radix + Tailwind).

This README is tailored to the repository contents (backend and frontend folders). Copy this file into your repository root as README.md.

---

Table of Contents
- Overview
- Features
- Quickstart
  - Prerequisites
  - Backend (dev & production)
  - Frontend (dev & production)
- Environment variables
  - Backend .env template
  - Frontend .env template
- Project structure (short)
- Important files & endpoints
- Docker
- Notes on AI integration
- Security & Gmail setup
- Contributing
- License

Overview
--------
This project implements:
- Backend: Express + TypeScript, Mongoose (MongoDB), IMAP polling (imapflow), SMTP (nodemailer), OpenRouter SDK.
- Frontend: React (Vite, TSX), Material-UI theme, routing, pages for RFP list / create / detail and vendors.
- Basic RFP model (title, raw description, requirements, vendors, budget, timestamps).
- Routes to create RFPs from natural language, list RFPs, get detail, attach vendors and send RFPs by email.

Features
--------
- Create RFP documents (via API)
- Extract structured data from free text (backed by project stubs to plug in LLM)
- Vendor association and email sending (SMTP)
- IMAP / email ingestion support (imapflow)
- Frontend SPA for listing, creating, and viewing RFPs

Quickstart
----------
Prerequisites
- Node.js 22.x (the Dockerfile and package.json reference Node 22)
- npm (or another package manager)
- MongoDB (Atlas or local)
- (Optional) Docker and Docker Compose

Backend (development)
1. Install deps:
   cd backend
   npm install

2. Create .env in backend/ (see Environment variables below).

3. Start dev server:
   npm run dev
   - This uses ts-node-dev and runs src/server.ts
   - Backend listens on PORT from env (default shown below is 4000)

Backend (production)
1. Build:
   npm run build
2. Start:
   npm run start
   - Compiles TypeScript into dist and runs node dist/server.js

Frontend (development)
1. Install deps:
   cd frontend
   npm install

2. Start dev server:
   npm run dev
   - Vite default dev port in config is 8080

Frontend (production)
1. Build:
   npm run build
2. Serve the built assets using your chosen static host (Netlify, Vercel, nginx) or use vite preview:
   npm run preview

Environment variables
---------------------
Never commit real credentials. Use a .env file per service. Below are recommended variables based on code and configuration observed in the repository.

Backend .env template (backend/.env)
- PORT=4000
- NODE_ENV=development

# MongoDB
- MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/rfp_db

# SMTP (sending email)
- SMTP_HOST=smtp.gmail.com
- SMTP_PORT=587
- SMTP_USER=your-email@gmail.com
- SMTP_PASS=your-gmail-app-password
- SMTP_SECURE=false

# IMAP (receiving email)
- IMAP_HOST=imap.gmail.com
- IMAP_PORT=993
- IMAP_USER=your-email@gmail.com
- IMAP_PASS=your-gmail-app-password
- IMAP_SECURE=true

# OpenRouter / LLM
- OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxxxxx
- OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
- RFP_MODEL=openai/gpt-oss-20b:free

# Optional logging
- LOG_LEVEL=info

Important: The code reads SMTP_SECURE and IMAP_SECURE and compares to "true" — set values exactly as strings "true" or "false".

Frontend .env template (frontend/.env or VITE_ prefixed)
- VITE_API_BASE_URL=http://localhost:4000/api
- VITE_APP_NAME="AI RFP Manager"

Project structure (short)
-------------------------
Root
- backend/ — Express backend (TypeScript)
  - src/
    - server.ts — bootstrap
    - app.ts — express app & middleware
    - config/ (db.ts, email.ts, env.ts)
    - routes/ (rfp.routes.ts)
    - controllers/ (rfp.controller.ts)
    - models/ (rfp.model.ts)
    - utils/ (apiResponse.ts, logger.ts)
  - package.json
  - Dockerfile
- frontend/ — Vite + React + TypeScript app
  - src/
    - main.tsx — app entry
    - App.tsx — router + pages
    - pages/ (RfpListPage, RfpCreatePage, RfpDetailPage, VendorListPage)
    - theme.ts — MUI theme
  - package.json
  - vite.config.ts

Important files & endpoints
---------------------------
Backend:
- server.ts — connects to MongoDB and starts the server (uses env.MONGO_URI and env.PORT)
- app.ts — sets up Express, CORS and mounts routes at /api
- routes/rfp.routes.ts:
  - POST /api/rfps/nl         — create RFP from natural language (postRfpFromText)
  - GET  /api/rfps            — list RFPs (getRfps)
  - GET  /api/rfps/:id        — get a single RFP (getRfp)
  - POST /api/rfps/:id/vendors— add vendors to an RFP (postRfpVendors)
  - POST /api/rfps/:id/send   — send RFP to vendor emails (postRfpSend)

Model:
- backend/src/models/rfp.model.ts — Mongoose schema and interface (title, descriptionRaw, budget, requirements, vendors, timestamps)

Email:
- backend/src/config/email.ts — nodemailer transporter is created from env variables. The code verifies transporter at startup and logs errors if misconfigured.

Example API calls
-----------------
Create an RFP from text:
curl -X POST "http://localhost:4000/api/rfps/nl" -H "Content-Type: application/json" -d '{"description":"We need 10 laptops with 16GB RAM..."}'

List RFPs:
GET http://localhost:4000/api/rfps

Get RFP:
GET http://localhost:4000/api/rfps/<id>

Send RFP to vendors:
POST http://localhost:4000/api/rfps/<id>/send
body: { "vendorEmails": ["vendor@example.com"], "message": "Please review and send proposal" }

Docker
------
Backend Dockerfile present (backend/Dockerfile) is multi-stage:
- Builder stage: installs dependencies and runs npm run build
- Runtime stage: installs production deps and copies dist

Example build & run:
cd backend
docker build -t rfp-backend:latest .
docker run -p 4000:4000 --env-file .env rfp-backend:latest

Notes on AI integration
-----------------------
- The backend lists @openrouter/sdk in package.json and uses OPENROUTER_API_KEY + OPENROUTER_BASE_URL.
- There is a RFP_MODEL env var shown in repo examples. Use it to switch models available via OpenRouter.
- The repo currently includes controller stubs and routes to plug in AI calls — implement the actual LLM call in controllers/services where you need parsing or generation.

Security & Gmail (IMAP/SMTP) setup
---------------------------------
Gmail & Google accounts require special setup to allow programmatic SMTP/IMAP access:
1. Enable 2FA on the Google account.
2. Generate an App Password and use that 16-character password for SMTP_PASS and IMAP_PASS (do NOT use your regular account password).
3. Verify IMAP is enabled in Gmail settings.
4. For production, use a managed transactional email service (SendGrid, SES) instead of direct Gmail.

Sensitive data
--------------
- Do NOT commit .env with secrets.
- Rotate API keys and app passwords if they are accidentally leaked.

Contributing
------------
- Fork the repo
- Create a topic branch: git checkout -b feat/your-feature
- Run tests and linters (add tests where relevant)
- Open a PR with a clear description and testing steps

Development tips
----------------
- Backend dev: npm run dev (in backend) — uses ts-node-dev for fast iteration.
- Frontend dev: npm run dev (in frontend) — Vite server.
- Use a MongoDB Atlas free tier for quick testing or run Mongo locally via Docker.
- Logs: backend prints request method + path for each /api call (see app.ts middleware).

┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│              (React/Vue.js, Tailwind CSS)                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ HTTP/REST
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    API Gateway Layer                         │
│            (FastAPI, JWT Authentication)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  RFP Service │  │Document Svc  │  │Response Svc  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   AI Layer   │  │ Auth Service │  │Analytics Svc │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼────┐ ┌──────▼──────┐ ┌──▼──────────┐
│ PostgreSQL │ │   Redis     │ │ Elasticsearch│
│  Database  │ │   Cache     │ │  Search     │
└────────────┘ └─────────────┘ └─────────────┘
        │
┌───────▼────┐
│   Celery   │
│  Task Queue│
└────────────┘
        │
┌───────▼────────────────────┐
│  External Services         │
│ (OpenAI, Hugging Face, S3) │
└────────────────────────────┘
