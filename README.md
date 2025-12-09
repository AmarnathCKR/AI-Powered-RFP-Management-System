# AI-Powered RFP Management System

An AI-augmented Request for Proposal (RFP) management system — full-stack TypeScript. This repository contains a backend (Express + TypeScript + MongoDB) and a frontend (Vite + React + TypeScript + MUI). The system helps create RFPs from natural language, extract structured requirements, manage vendors, and send/receive emails (SMTP/IMAP). It also includes stubs for integrating LLMs via OpenRouter.

This README is intentionally comprehensive and designed to be copy-pasted into the repository root as `README.md`. It contains diagrams (ASCII + Mermaid), detailed instructions, API examples, architecture, development notes, and contribution guidelines.

---

Table of Contents
- Project summary
- Goals & use cases
- Architecture (ASCII + Mermaid)
- Component responsibilities
- Quickstart (local & Docker)
  - Prerequisites
  - Backend (dev & prod)
  - Frontend (dev & prod)
- Configuration & environment variables
  - Backend .env template
  - Frontend .env (VITE_) template
- Project structure (file tree + explanation)
- API reference (endpoints, payloads, examples)
- Common workflows & examples
  - Create RFP from text
  - Add vendors and send RFPs
  - Ingest email (overview)
- AI integration notes & best practices
- Testing & debugging tips
- CI / Docker / Deployment
- Security & secrets handling
- Contributing
- Roadmap & ideas
- Troubleshooting & FAQ
- License (placeholder)
- Appendix: Useful commands & snippets

---

Project summary
---------------
This project provides a practical starting point to build an AI-augmented RFP management product. It demonstrates:
- Creating RFPs via REST API or UI.
- Extracting structured information from free text (LLM integration points).
- Managing vendor lists and sending RFP emails.
- IMAP/SMTP email integration for ingestion and notifications.
- A modern TypeScript stack (backend + frontend) with Docker friendly configs.

Goals & target users
--------------------
- Procurement teams who want to convert email/notes into structured RFPs.
- Software teams prototyping AI-assisted document understanding.
- Developers learning full-stack TypeScript architecture with LLM integration.

Primary use cases:
- Draft RFPs quickly from free-text descriptions.
- Associate vendors and send invitations to bid.
- Store and list RFPs and vendor replies.
- Extend with AI to extract requirements, budgets, deadlines.

---

# Architecture Diagrams - AI-Powered RFP Management System

## High-Level System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER INTERFACE LAYER                         │
│            (Browser / SPA - Vite + React + MUI)                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    HTTP/REST (JSON)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    EXPRESS API LAYER                             │
│              (TypeScript + Node.js Backend)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Routes → Controllers → Services → Models                │  │
│  └──────────────────────────────────────────────────────────┘  │
└────┬──────────────────────┬──────────────────────┬──────────────┘
     │                      │                      │
     v                      v                      v
┌────────────────┐  ┌──────────────────┐  ┌───────────────────┐
│   MongoDB      │  │  Email Service   │  │  LLM Integration  │
│   (Mongoose)   │  │  (SMTP / IMAP)   │  │  (OpenRouter API) │
└────────────────┘  └──────────────────┘  └───────────────────┘
     │                      │                      │
     │                      v                      v
     │              ┌──────────────────┐  ┌───────────────────┐
     │              │ Gmail/SMTP       │  │ OpenRouter LLM    │
     │              │ Provider         │  │ External Service  │
     │              └──────────────────┘  └───────────────────┘
     │
     v
 (Data Persistence)
```

## Detailed Component Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐      │
│  │ RFP List Page  │  │ RFP Create Pg  │  │ RFP Detail Page  │      │
│  └────────────────┘  └────────────────┘  └──────────────────┘      │
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐                             │
│  │ Vendor Page    │  │ API Client     │                             │
│  └────────────────┘  │ (fetch/axios)  │                             │
│                      └────────────────┘                             │
│                                                                      │
│  Material-UI Theme & Components                                     │
│                                                                      │
└──────────────────────┬───────────────────────────────────────────────┘
                       │ HTTP/REST
                       │ JSON Payload
                       │
┌──────────────────────▼───────────────────────────────────────────────┐
│                      BACKEND API LAYER                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Routes Layer (/api/rfps/*)                                         │
│  ├─ POST   /api/rfps/nl         → createFromNaturalLanguage        │
│  ├─ GET    /api/rfps            → listAllRFPs                      │
│  ├─ GET    /api/rfps/:id        → getRFPDetail                     │
│  ├─ POST   /api/rfps/:id/vendors→ addVendorsToRFP                 │
│  └─ POST   /api/rfps/:id/send   → sendRFPToVendors                │
│                                                                      │
│  Controllers Layer (Business Logic Orchestration)                   │
│  ├─ rfp.controller.ts                                              │
│  │  ├─ postRfpFromText()                                           │
│  │  ├─ getRfps()                                                   │
│  │  ├─ getRfp()                                                    │
│  │  ├─ postRfpVendors()                                            │
│  │  └─ postRfpSend()                                               │
│  │                                                                   │
│  └─ vendor.controller.ts                                           │
│     └─ (future: vendor-specific endpoints)                         │
│                                                                      │
│  Services Layer (Core Business Logic)                               │
│  ├─ rfp. service.ts                                                 │
│  │  ├─ createRFP(rawText)                                          │
│  │  ├─ parseWithLLM(text) → LLM Call                              │
│  │  ├─ listRFPs()                                                  │
│  │  ├─ getRFPById(id)                                              │
│  │  └─ updateRFP(id, data)                                         │
│  │                                                                   │
│  ├─ email.service.ts                                               │
│  │  ├─ sendRFPEmail(vendorEmail, rfpData)                         │
│  │  ├─ startIMAPPoller()                                           │
│  │  └─ parseIncomingEmail(message)                                │
│  │                                                                   │
│  ├─ llm.service.ts                                                 │
│  │  ├─ parseRFPDescription(text) → OpenRouter API Call           │
│  │  ├─ extractRequirements(text)                                   │
│  │  ├─ suggestBudget(text)                                         │
│  │  └─ validateLLMOutput(json)                                     │
│  │                                                                   │
│  └─ vendor.service.ts                                              │
│     ├─ addVendor(rfpId, vendorData)                               │
│     ├─ getVendorsByRFP(rfpId)                                      │
│     └─ updateVendor(vendorId, data)                               │
│                                                                      │
│  Config Layer                                                       │
│  ├─ db.ts          → MongoDB Connection (Mongoose)                │
│  ├─ email.ts       → nodemailer SMTP Transporter                  │
│  └─ env.ts         → Environment Variables Loader                 │
│                                                                      │
│  Utils & Helpers                                                    │
│  ├─ apiResponse.ts → Standardized API Response Format             │
│  ├─ logger.ts      → Logging Utility                               │
│  └─ validators.ts  → Input Validation (optional)                  │
│                                                                      │
└──────────────┬────────────────────────┬──────────────┬──────────────┘
               │                        │              │
               v                        v              v
        ┌──────────────┐        ┌──────────────┐  ┌─────────────┐
        │   MongoDB    │        │Email Service │  │ LLM Service │
        │  (Mongoose)  │        │(SMTP/IMAP)   │  │ (OpenRouter)│
        └──────────────┘        └──────────────┘  └─────────────┘
               │                        │              │
               v                        v              v
        ┌──────────────┐        ┌──────────────┐  ┌─────────────┐
        │ RFP Model    │        │Gmail SMTP    │  │OpenRouter   │
        │ Vendor Model │        │Gmail IMAP    │  │API Endpoint │
        │ Schema def   │        │(imapflow lib)│  │(SDK)        │
        └──────────────┘        └──────────────┘  └─────────────┘
```

## Data Flow Diagram:  Creating an RFP

```
User Input (Natural Language)
         │
         v
    ┌─────────────────────┐
    │  Frontend SPA       │
    │  (RfpCreatePage)    │
    │                     │
    │  User types:         │
    │  "We need 10        │
    │   laptops..."       │
    └──────────┬──────────┘
               │
               │ HTTP POST /api/rfps/nl
               │ { description: "..." }
               │
               v
    ┌─────────────────────────────────────┐
    │  Backend:  rfp.controller.ts         │
    │  postRfpFromText(req, res)          │
    └──────────────┬──────────────────────┘
                   │
                   v
    ┌─────────────────────────────────────┐
    │  Backend: rfp.service.ts            │
    │  createRFP(rawDescription)          │
    │                                     │
    │  1. Call LLM service                │
    │  2. Parse response                  │
    │  3. Create RFP document             │
    └──────────────┬──────────────────────┘
                   │
                   ├─────────────────────────────┐
                   │                             │
                   v                             v
        ┌─────────────────────┐       ┌──────────────────────┐
        │  llm.service.ts     │       │  rfp.service.ts      │
        │  parseRFP(text)     │       │  (continued)         │
        │                     │       │                      │
        │ Calls OpenRouter    │       │  4. Save to MongoDB  │
        │ API with prompt     │       │  5. Return created   │
        │ Returns:  JSON       │       │     RFP object       │
        └──────────┬──────────┘       └──────────┬───────────┘
                   │                             │
                   v                             │
        ┌─────────────────────┐                 │
        │  OpenRouter API     │                 │
        │  LLM Model          │                 │
        │ (e.g., GPT-4)       │                 │
        │                     │                 │
        │ Returns structured  │                 │
        │ JSON:                │                 │
        │ {                   │                 │
        │  title: ".. .",      │                 │
        │  budget: "...",     │                 │
        │  requirements: [    │                 │
        │   {... }, {... }      │                 │
        │  ]                  │                 │
        │ }                   │                 │
        └─────────┬───────────┘                 │
                  │                             │
                  └──────────────┬──────────────┘
                                 │
                                 v
                        ┌──────────────────────┐
                        │  MongoDB             │
                        │  (Mongoose RFP Model)│
                        │                      │
                        │  Stored document:     │
                        │  {                   │
                        │   _id: "xxx",        │
                        │   title: "...",      │
                        │   descriptionRaw,    │
                        │   budget,            │
                        │   requirements:  [],  │
                        │   vendors: [],       │
                        │   createdAt,         │
                        │   updatedAt          │
                        │  }                   │
                        └──────────────────────┘
                                 │
                                 v
                        ┌──────────────────────┐
                        │  HTTP Response       │
                        │  to Frontend         │
                        │                      │
                        │  Status: 201         │
                        │  Body:  {             │
                        │    success: true,    │
                        │    data: {... }       │
                        │  }                   │
                        └──────────────────────┘
                                 │
                                 v
                        ┌──────────────────────┐
                        │  Frontend SPA        │
                        │  Update UI           │
                        │  Show created RFP    │
                        │  Navigate to detail  │
                        └──────────────────────┘
```

## Data Flow Diagram: Sending RFP to Vendors

```
User Action:  Click "Send RFP"
         │
         v
    ┌─────────────────────────────────┐
    │  Frontend SPA                   │
    │  (RfpDetailPage)                │
    │                                 │
    │  Select vendors & compose msg   │
    └──────────────┬──────────────────┘
                   │
                   │ HTTP POST /api/rfps/: id/send
                   │ {
                   │   vendorEmails: ["a@x.com", "b@y.com"],
                   │   message: "Please provide quote..."
                   │ }
                   │
                   v
    ┌───────────────────────────────────────┐
    │  Backend: rfp.controller.ts           │
    │  postRfpSend(req, res)                │
    │                                       │
    │  1. Validate request                  │
    │  2. Load RFP & vendors                │
    │  3. Call email service                │
    └──────────────┬────────────────────────┘
                   │
                   v
    ┌───────────────────────────────────────┐
    │  Backend: email.service.ts            │
    │  sendRFPEmail(vendorEmails, rfpData)  │
    │                                       │
    │  For each vendor email:               │
    │    1. Build HTML email template       │
    │    2. Insert RFP data                 │
    │    3. Create nodemailer transport     │
    │    4. Send via SMTP                   │
    └──────────────┬────────────────────────┘
                   │
                   v
    ┌──────────────────────────────────┐
    │  nodemailer SMTP Transporter     │
    │  (configured via . env)           │
    │                                  │
    │  SMTP_HOST:  smtp.gmail.com       │
    │  SMTP_PORT: 587                  │
    │  SMTP_USER: your-email@gmail.com │
    │  SMTP_PASS: app-password         │
    └──────────────┬───────────────────┘
                   │
                   v
    ┌──────────────────────────────────┐
    │  Gmail SMTP Server               │
    │  (or configured provider)        │
    │                                  │
    │  Email delivered                 │
    └──────────────┬───────────────────┘
                   │
                   v
    ┌──────────────────────────────────┐
    │  Vendor Email Inbox              │
    │                                  │
    │  Receives RFP details            │
    └──────────────┬───────────────────┘
                   │
                   v
    ┌──────────────────────────────────┐
    │  MongoDB - Log/Update            │
    │  RFP send_log / timestamps       │
    │  (optional tracking)             │
    └──────────────┬───────────────────┘
                   │
                   v
    ┌──────────────────────────────────┐
    │  HTTP Response to Frontend       │
    │                                  │
    │  Status: 200                     │
    │  Message: "RFPs sent to          │
    │   2 vendors"                     │
    └──────────────┬───────────────────┘
                   │
                   v
    ┌──────────────────────────────────┐
    │  Frontend SPA                    │
    │  Show success notification       │
    │  Update UI state                 │
    └──────────────────────────────────┘
```

## Technology Stack & Integration Points

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Framework:       Vite + React 18+ + TypeScript                │
│  Styling:        Material-UI (MUI v5+)                         │
│  State Mgmt:     React Hooks / Context (or Redux)             │
│  HTTP Client:    Fetch API / Axios                             │
│  Build Tool:     Vite (lightning-fast)                         │
│  Package Mgr:    npm / pnpm                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Runtime:        Node.js 22. x                                  │
│  Framework:       Express.js (TypeScript)                       │
│  Language:       TypeScript 5.x                                │
│  Database:       MongoDB + Mongoose ODM                        │
│  Email SMTP:     nodemailer v6.x                              │
│  Email IMAP:     imapflow v1.x                                │
│  LLM SDK:        @openrouter/sdk                              │
│  Logging:        winston / custom logger                       │
│  Env Mgmt:       dotenv                                        │
│  Build:           tsc (TypeScript Compiler)                     │
│  Dev Server:     ts-node-dev                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Database:       MongoDB Atlas (cloud) or local Docker         │
│  Email:           Gmail (SMTP/IMAP) or SendGrid, SES            │
│  LLM Provider:   OpenRouter. ai (proxy to multiple LLMs)        │
│                  - Supports:  OpenAI, Claude, Mistral, etc.     │
│                  - Free & paid models available                │
│                                                                 │
│  (Optional)      Redis - for caching & job queue              │
│  (Optional)      S3/Cloud Storage - for file attachments       │
│  (Optional)      Slack/Teams - for notifications               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Request/Response Cycle Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                   REQUEST LIFECYCLE                              │
└──────────────────────────────────────────────────────────────────┘

User Initiates Request
        │
        v
  Browser SPA (React)
        │
        v
  fetch() / axios HTTP call
        │
        │ GET /api/rfps/123
        │ POST /api/rfps/nl
        │ etc.
        │
        v
  Express Middleware Stack
        ├─ cors() - Enable CORS
        ├─ express.json() - Parse JSON body
        ├─ custom logger - Log request
        └─ error handler - Catch errors
        │
        v
  Route Matching
        │
        ├─ GET  /api/rfps
        ├─ POST /api/rfps/nl
        ├─ GET  /api/rfps/:id
        ├─ POST /api/rfps/:id/vendors
        └─ POST /api/rfps/:id/send
        │
        v
  Controller Execution
        │
        ├─ Input validation
        ├─ Call appropriate service
        └─ Handle errors
        │
        v
  Service Layer
        │
        ├─ Business logic
        ├─ Database queries
        ├─ External API calls (LLM, email)
        └─ Data transformation
        │
        v
  Mongoose Models / MongoDB
        │
        ├─ Query:  find(), findById(), create(), updateOne()
        ├─ Validation: schema validation
        └─ Return: document(s) or null
        │
        v
  Service returns result to Controller
        │
        v
  Controller formats response
        │
        ├─ Success: apiResponse.success(data)
        │           HTTP 200/201 + JSON
        │
        └─ Error: apiResponse.error(message)
                   HTTP 400/500 + JSON error
        │
        v
  Express sends HTTP Response
        │
        ├─ Status Code (200, 201, 400, 500, etc.)
        ├─ Headers (Content-Type:  application/json)
        └─ Body (JSON)
        │
        v
  Browser receives Response
        │
        v
  React state update
        │
        v
  Component re-render
        │
        v
  UI update shown to user

```

## Database Schema Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                    MONGODB COLLECTIONS                           │
└──────────────────────────────────────────────────────────────────┘

Collection: rfps
┌─────────────────────────────────────────────────────────────────┐
│ {                                                               │
│   _id: ObjectId,                                               │
│   title: String,                                               │
│   descriptionRaw: String,   (original user input)             │
│   budget: String | Number, (e.g., "$50,000" or 50000)         │
│   requirements: [                                              │
│     {                                                          │
│       description: String,                                     │
│       quantity: String | Number,                              │
│       priority: "high" | "medium" | "low"                    │
│     },                                                         │
│     ...                                                        │
│   ],                                                           │
│   vendors: [                                                   │
│     {                                                          │
│       name: String,                                           │
│       email: String,                                          │
│       status: "pending" | "replied" | "selected",            │
│       createdAt:  Date                                         │
│     },                                                         │
│     ...                                                         │
│   ],                                                           │
│   deliveryDate: Date | String,                                │
│   notes: String,                                              │
│   status: "draft" | "sent" | "closed",                       │
│   createdAt: Date,                                            │
│   updatedAt:  Date,                                            │
│   createdBy: String (optional, if auth added)                │
│ }                                                              │
└─────────────────────────────────────────────────────────────────┘

Example Document:
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Office Equipment Procurement",
  "descriptionRaw": "We need 10 laptops with 16GB RAM and 512GB SSD.. .",
  "budget": "$50,000",
  "requirements": [
    {
      "description": "Laptop - 16GB RAM, 512GB SSD",
      "quantity": 10,
      "priority": "high"
    },
    {
      "description":  "Office chairs - ergonomic",
      "quantity": 20,
      "priority": "medium"
    }
  ],
  "vendors": [
    {
      "name": "TechCorp Ltd",
      "email": "sales@techcorp.com",
      "status": "sent",
      "createdAt":  "2025-12-10T10:30:00Z"
    }
  ],
  "deliveryDate": "2026-01-31",
  "notes": "Expedited shipping preferred",
  "status": "sent",
  "createdAt":  "2025-12-09T15:00:00Z",
  "updatedAt": "2025-12-10T10:35:00Z"
}
```

## Deployment & Infrastructure Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    PRODUCTION DEPLOYMENT                         │
└──────────────────────────────────────────────────────────────────┘

Option 1: Cloud Platform (Recommended for scaling)
─────────────────────────────────────────────────

  ┌────────────────────────────────────────────┐
  │         Load Balancer / CDN                │
  │      (CloudFlare / AWS CloudFront)         │
  └────────────────────────────────────────────┘
           │                        │
           v                        v
   ┌──────────────┐        ┌──────────────────┐
   │  Frontend    │        │   Static Assets  │
   │  (Vercel /   │        │   (CDN)          │
   │   Netlify)   │        │                  │
   └──────────────┘        └──────────────────┘
           │
           │
   ┌──────────────────────────────────────────┐
   │    Backend Deployment (Heroku / Railway) │
   │                                          │
   │  ┌──────────────────────────────────┐  │
   │  │  Docker Container                │  │
   │  │  - Express API (Node.js)         │  │
   │  │  - Mongoose (MongoDB driver)     │  │
   │  │  - Email & LLM services          │  │
   │  └──────────────────────────────────┘  │
   │                                          │
   │  Environment Variables (via .env)       │
   │  - MONGO_URI                            │
   │  - SMTP credentials                     │
   │  - OPENROUTER_API_KEY                   │
   └──────────────────────────────────────────┘
           │
   ┌───────┴─────────────────┬──────────────┐
   │                         │              │
   v                         v              v
┌──────────────┐  ┌────────────────────┐  ┌──────────────┐
│ MongoDB Atlas│  │ Gmail SMTP/IMAP    │  │ OpenRouter   │
│ (Cloud DB)   │  │ (Email Service)    │  │ (LLM API)    │
└──────────────┘  └────────────────────┘  └──────────────┘


Option 2: Docker Compose (Local / Self-hosted)
───────────────────────────────────────────────

docker-compose.yml
├─ Service: backend
│  ├─ Build: ./backend
│  ├─ Port: 4000:4000
│  ├─ Env: . env file
│  └─ Depends:  mongo
│
├─ Service: frontend (optional)
│  ├─ Build: ./frontend
│  ├─ Port: 8080:80 (nginx)
│  └─ Copy:  dist from build
│
└─ Service: mongo
   ├─ Image: mongo:6
   ├─ Port: 27017:27017
   └─ Volumes: ./data:/data/db

Command:
$ docker-compose up -d


Option 3: Kubernetes (Advanced / Enterprise)
──────────────────────────────────────────────

Deployment Manifests:
├─ backend-deployment.yaml
│  ├─ Replicas: 3
│  ├─ Image: rfp-backend:latest
│  ├─ Env: ConfigMap + Secrets
│  └─ Resources: CPU/Memory limits
│
├─ frontend-deployment.yaml
│  └─ Serves static assets
│
├─ mongodb-statefulset.yaml
│  └─ Persistent storage
│
├─ service-backend.yaml
│  └─ ClusterIP: 4000
│
└─ ingress.yaml
   └─ Routes: /api → backend, / → frontend
```

Component responsibilities
--------------------------
- Frontend: Render RFP list, creation wizard (free text -> structured), send UI, vendor management.
- Express API: Authentication (if added), business logic, LLM orchestration, email sending, persistence.
- Email Service: Build/send RFP emails (templating), receive and parse incoming messages (imap).
- LLM Adapter: Encapsulate calls to OpenRouter/OpenAI, handle retries, prompt templates and model selection.
- Persistence: Store RFP documents (title, descriptionRaw, parsedRequirements, vendors[], budget, timestamps).

---

Quickstart (local)
------------------
Prerequisites
- Node.js 22.x (project references Node 22 in Dockerfile / package.json)
- npm (or pnpm, yarn)
- MongoDB URI (Atlas or local)
- Optional: Docker & docker-compose
- Optional: Gmail App Password (for SMTP/IMAP testing) — see Security section

Backend (development)
1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` in `backend/` from the template below.

3. Start dev server:
```bash
npm run dev
```
- This uses `ts-node-dev`/similar and runs `src/server.ts`.
- Default port is read from `PORT` (commonly 4000).

Backend (production)
1. Build:
```bash
npm run build
```
2. Start:
```bash
npm run start
```
- Produces `dist` and runs `node dist/server.js`.

Frontend (development)
1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start dev server:
```bash
npm run dev
```
- Vite default dev server: check `vite.config.ts` (commonly 8080 or 5173).

Frontend (production)
1. Build:
```bash
npm run build
```
2. Preview:
```bash
npm run preview
```
3. Deploy built `dist` to your static host (Netlify, Vercel, S3 + CloudFront).

Docker (backend)
----------------
Backend contains a multi-stage Dockerfile.
Example:
```bash
cd backend
docker build -t rfp-backend:latest .
docker run -p 4000:4000 --env-file .env rfp-backend:latest
```

To run MongoDB quickly for local development:
```bash
docker run -d --name mongo-local -p 27017:27017 mongo:6
```

---

Configuration & environment variables
-------------------------------------
Never commit secrets. Use `.env` files or a secrets store.

Backend `.env` template (backend/.env)
```
PORT=4000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/rfp_db

# SMTP (sending)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SECURE=false

# IMAP (receiving)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASS=your-app-password
IMAP_SECURE=true

# LLM/OpenRouter
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxxxxx
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
RFP_MODEL=openai/gpt-oss-20b:free

# Logging
LOG_LEVEL=info
```
Important: The backend compares IMAP_SECURE and SMTP_SECURE string values to "true" — set them exactly as strings "true" or "false".

Frontend `.env` template (frontend/.env or VITE_ prefixed)
```
VITE_API_BASE_URL=http://localhost:4000/api
VITE_APP_NAME="AI RFP Manager"
```

---

Project structure (annotated)
-----------------------------
A concise tree (based on repository contents):
```
/
├─ backend/
│  ├─ src/
│  │  ├─ server.ts          # bootstrap + connect to DB
│  │  ├─ app.ts             # express app, middleware, routes mount
│  │  ├─ config/
│  │  │  ├─ db.ts           # mongoose connection
│  │  │  └─ email.ts        # nodemailer transporter
│  │  ├─ routes/
│  │  │  └─ rfp.routes.ts
│  │  ├─ controllers/
│  │  │  └─ rfp.controller.ts
│  │  ├─ models/
│  │  │  └─ rfp.model.ts
│  │  ├─ services/          # (suggested) business logic and LLM adapter
│  │  └─ utils/             # apiResponse, logger, error handling
│  ├─ package.json
│  └─ Dockerfile
├─ frontend/
│  ├─ src/
│  │  ├─ main.tsx
│  │  ├─ App.tsx
│  │  ├─ pages/
│  │  │  ├─ RfpListPage.tsx
│  │  │  ├─ RfpCreatePage.tsx
│  │  │  ├─ RfpDetailPage.tsx
│  │  │  └─ VendorListPage.tsx
│  │  └─ theme.ts
│  ├─ package.json
│  └─ vite.config.ts
├─ .gitignore
└─ README.md  # (this file)
```

Notes:
- Controllers should be thin: accept request, validate, and call services.
- Services implement business logic and interact with models and external APIs (LLM, email).
- Keep prompt templates and LLM orchestration centralized (`services/llmService.ts` recommended).

---

API reference
-------------
Base URL: http://localhost:4000/api (adjust via env)

Common endpoints (observed from code)
- POST /api/rfps/nl
  - Description: Create an RFP from natural language description.
  - Request JSON:
    ```json
    {
      "description": "We need 10 laptops with 16GB RAM and 512GB SSDs for the engineering team. Budget $25,000. Delivery in 6 weeks."
    }
    ```
  - Response: created RFP JSON with parsed fields (title, requirements, budget, etc.)

- GET /api/rfps
  - Description: List RFPs.
  - Query params: pagination filters may be supported.
  - Response: array of RFP documents.

- GET /api/rfps/:id
  - Description: Get a single RFP by id.
  - Response: RFP document.

- POST /api/rfps/:id/vendors
  - Description: Add vendors to an RFP.
  - Request JSON:
    ```json
    {
      "vendors": [
        { "name": "Vendor A", "email": "vendorA@example.com" },
        { "name": "Vendor B", "email": "vendorB@example.com" }
      ]
    }
    ```

- POST /api/rfps/:id/send
  - Description: Send RFP to vendor emails.
  - Request JSON:
    ```json
    {
      "vendorEmails": ["vendorA@example.com"],
      "message": "Please review and submit proposals by 2026-01-31."
    }
    ```
  - Behavior: Builds an email from template, attaches RFP data, and sends via configured SMTP transporter.

Example curl: Create RFP from text
```bash
curl -X POST "http://localhost:4000/api/rfps/nl" \
  -H "Content-Type: application/json" \
  -d '{"description":"We need 10 laptops with 16GB RAM..."}'
```

Example curl: Send RFP
```bash
curl -X POST "http://localhost:4000/api/rfps/6432a3e2/send" \
  -H "Content-Type: application/json" \
  -d '{"vendorEmails":["vendor@example.com"],"message":"Please provide quote"}'
```

Response conventions
- Standard REST JSON responses; check `apiResponse` util for exact schema. Errors return HTTP error codes and JSON error messages.

---

Common workflows & examples
---------------------------

1) Create an RFP from raw text (developer flow)
- Call POST /api/rfps/nl with a natural language description.
- The backend runs an LLM parsing step (stubbed in controllers).
- The returned object contains structured `requirements` (array), `budget`, and `title`.

2) Add vendors & send RFP
- POST /api/rfps/:id/vendors to attach vendor objects (name, email).
- POST /api/rfps/:id/send with `vendorEmails` and optional `message`.
- The Email Service builds an HTML email and sends via SMTP.

3) Ingest email (overview)
- IMAP watch process (imapflow) connects to mailbox and polls for new messages.
- When an inbound message matches criteria, the backend parses it and can:
  - Create an RFP draft.
  - Attach message text to an existing RFP.
  - Notify UI via webhook or push (not implemented by default).

---

AI integration notes & best practices
------------------------------------
The repository includes references to the OpenRouter SDK and environment variables (`OPENROUTER_API_KEY`, `RFP_MODEL`). The code currently contains stubs where LLM calls should be placed.

Best practices when integrating the LLM:
- Keep prompts in one place (e.g., `services/promptTemplates.ts`).
- Use a prompt engineering approach:
  - System / instruction: define role and expected JSON schema.
  - Example-based prompts: provide examples mapping raw text to structured JSON.
- Validate and sanitize LLM outputs. Use JSON schema or custom validators to avoid malformed data.
- Add a fallback parser or heuristics when the model output is ambiguous.
- Keep model keys secret and rotate regularly.
- Rate-limit and cache LLM responses as appropriate.

Example prompt pattern (psuedocode)
```
System: You are a JSON extraction assistant that converts RFP descriptions into this schema:
{"title":"", "budget":"", "requirements":[{"desc":"","qty":"","priority":""}], "delivery":"", "notes":""}

User: "<raw rfp description text>"

Assistant: <Return only valid JSON>
```

---

Testing & debugging
-------------------
- Backend:
  - Use `npm run dev` for hot reload.
  - Add unit tests in `backend/src/__tests__` using Jest (not included by default).
  - Useful logs: DB connection, mailer verification errors, route-level errors.

- Frontend:
  - Use Vite dev server and React devtools.
  - Mock API responses with MSW or a local backend.

- Email:
  - For SMTP testing, use Mailtrap, Ethereal, or a Gmail App Password + test account.
  - Check transporter verification logs printed at startup.

---

CI / Docker / Deployment
------------------------
- The backend has a multi-stage Dockerfile:
  - Build stage: install deps and compile TypeScript.
  - Runtime stage: install production deps and copy `dist`.
- Deploy frontend to Netlify / Vercel or serve static files from an Nginx container.

Example docker-compose (recommended)
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    env_file: ./backend/.env
    ports:
      - "4000:4000"
    depends_on:
      - mongo
  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
```

---

Security & secrets
------------------
- Do NOT commit `.env` or secrets.
- For Gmail use:
  - Enable 2FA and create an App Password (use these in SMTP_PASS and IMAP_PASS).
  - Avoid using personal accounts in production; prefer transactional providers (SendGrid, SES).
- Use HTTPS in production, and secure cookies / tokens if you add authentication.
- Sanitize all inputs stored into the DB or sent to external services.

---

Contributing
------------
We welcome contributions. Suggested workflow:
1. Fork the repository.
2. Create a descriptive branch:
   - feat/your-feature
   - fix/bug-description
3. Run linters and tests.
4. Open a PR with a clear description, screenshots, and test steps.

Contribution checklist:
- Follow TypeScript types closely.
- Keep controllers thin; add tests for services and utilities.
- Add or update README sections as you introduce new features.

Code of conduct & issue reporting
- Add a CODE_OF_CONDUCT.md and issue templates if you plan to open this project publicly.
- For security reports, do not post secrets in public issues. Use a private channel or contact the maintainers.

---

Roadmap & ideas
---------------
Here are ideas to extend the project:
- Add authentication (JWT / OAuth / SSO).
- Add a user & team model (teams manage RFPs).
- Add attachments to RFPs (S3).
- Introduce a job queue (BullMQ / Redis) for background email sending and LLM calls.
- Add automated RFP scoring using an LLM or rules engine.
- Add advanced vendor matching and supplier scoring.
- Add notifications (Slack, Teams).

---

Troubleshooting & FAQ
---------------------
Q: LLM returns invalid JSON or malformatted output.
A: Use a schema validator. Send the LLM a strict instruction to "output only JSON" and provide examples. If necessary, wrap the model call in a retry loop that tries to fix common issues (strip extraneous text, fix trailing commas).

Q: SMTP fails to authenticate for Gmail.
A: Ensure 2FA and App Password. Verify `SMTP_PASS` is the app password. Inspect transporter verification logs.

Q: Mongo connection refuses.
A: Ensure `MONGO_URI` is correct and network allows connections. Use local Mongo via Docker for local dev.

---

License
-------
Choose a license for your project. If you want a permissive license, add an MIT LICENSE file. Example MIT header below — replace owner/year accordingly.

```
MIT License

Copyright (c) 2025 <Your Name>

Permission is hereby granted, free of charge, to any person obtaining a copy...
```

(Replace the license text above with the full license file in `LICENSE`.)

---

Appendix: Useful commands & snippets
-----------------------------------
Start backend dev:
```bash
cd backend
npm install
npm run dev
```

Start frontend dev:
```bash
cd frontend
npm install
npm run dev
```

Build & run backend docker:
```bash
cd backend
docker build -t rfp-backend .
docker run -p 4000:4000 --env-file .env rfp-backend
```

cURL example:
```bash
curl -X POST "http://localhost:4000/api/rfps/nl" \
  -H "Content-Type: application/json" \
  -d '{"description":"We need 20 office chairs with ergonomic support..."}'
```

Prompt template example (store in services/promptTemplates.ts)
```ts
export const RFP_PARSING_PROMPT = `
You are an extraction assistant. Convert the user's RFP description into JSON with:
{
  "title": string,
  "budget": string,
  "requirements": [{"description":string,"qty":string,"priority":string}],
  "delivery": string,
  "notes": string
}
Return only valid JSON.
`;
```

---
