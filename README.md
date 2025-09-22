# Drip Campaign Manager

_A comprehensive post-stay drip campaign management system for short-term rental (STR) management companies._  

[Optional: Brief high-level description / purpose of repo]

---

## Table of Contents

- [Prerequisites](#prerequisites)  
- [Installation](#installation)
- [Running the Application](#running-the-application)  
- [Usage](#usage)
- [Expected Outputs](#expected-outputs)  
- [Project Structure](#project-structure)  

---

## Prerequisites

Before getting started, ensure you have the following:

- **Node.js** version `>= 18` (or your required minimum version)  
- A package manager: `bun` version `>= 1.2.21`  
- [Optional] A Git client installed, if cloning from remote

---

## Installation

1. Clone the repository  

```
git clone <REPO_URL>
cd drip-campaign
```

2. Install dependencies  
```
bun install
```

## Running the Application

### Development Mode

To start the app locally for development:

```
bun run dev
```

Then visit `http://localhost:<PORT>` (default `3000`) in your browser.

### Production Mode

1. Build the application
```
bun run build
bun run start
```
Then visit `http://localhost:<PORT>` (default `3000`) in your browser.

## Usage

Once the app is running:

- The application will automatically load and process the seed data on startup.  
- Use the UI to filter and preview data: contacts, custom fields (segmentation/workflow), actions (scheduled outreaches).  
- Export data via the provided “Export JSONL” / “Export JSON” options.

---

## Expected Outputs

Upon successful run, you can expect:

- UI rendering with tabs for **Contacts**, **Custom Fields**, **Actions**  
- Filters for segment, property, consent, etc.  
- Exported files:

- `contacts.jsonl` — Guest contact information  
- `custom_fields.jsonl` — Workflow state / segment & rule info  
- `actions.jsonl` — Scheduled outreach actions  
- Optionally a single `data.json` when exporting all in JSON  

- Generated booking URLs / promo codes / placeholders resolved correctly.

---

## Project Structure

An overview of key directories & files:

```
drip-campaign/
├── app/ # Next.js application (UI + API routes)
│ ├── api/ # Backend endpoints
│ ├── globals.css # Global stylesheet
│ ├── layout.tsx # Root layout
│ └── page.tsx # Landing / main page
├── components/ # React frontend components
├── _lib/ # Core business logic (segmentation, workflow, etc.)
├── types/ # TypeScript type definitions
├── public/ # Static assets (Json files are in json folder inside public)
├── next.config.ts # Next.js configuration
├── package.json # NPM/Yarn metadata & scripts
├── tsconfig.json # TS configuration
└── README.md # This file
```
