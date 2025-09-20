# Drip Campaign Manager

A comprehensive post-stay drip campaign management system for short-term rental (STR) management companies. This application processes guest data, assigns segments based on deterministic rules, generates personalized outreach campaigns, and exports CRM-ready data.

## Features

- **Deterministic Segmentation**: Rule-based guest segmentation using configurable criteria
- **Multi-Channel Outreach**: Email and SMS campaigns with tone personalization
- **Template System**: Flexible template system with placeholder substitution
- **Data Export**: JSONL export format compatible with CRM systems
- **Interactive UI**: Web-based interface for data preview and filtering
- **Timezone Support**: Property-specific timezone handling for send dates

## Architecture

### Core Components

1. **Segmentation Engine** (`lib/segmentation.ts`)
   - Evaluates segmentation rules in priority order
   - Supports complex conditions with AND/OR logic
   - Handles numeric and string comparisons

2. **Workflow Processor** (`lib/workflow.ts`)
   - Processes guest data through the complete workflow
   - Generates contacts, custom fields, and actions
   - Handles template filling and placeholder substitution

3. **API Routes**
   - `/api/process` - Processes guest data and generates campaign data
   - `/api/export` - Exports data in JSONL or JSON format

4. **UI Components**
   - Tabbed interface for viewing contacts, custom fields, and actions
   - Filtering and search capabilities
   - Export functionality

## Data Flow

1. **Input**: Guest data from `str_past_guests_seed_with_segments.json`
2. **Segmentation**: Assign segments based on rules in `segmentation_rules.json`
3. **Template Selection**: Choose templates and tones based on segment
4. **Placeholder Filling**: Replace placeholders with guest-specific data
5. **Output**: Generate three JSONL files for CRM integration

## Segmentation Rules

The system uses priority-ordered rules to assign exactly one segment per guest:

- **Promoter_VIP**: High spend (>$2000) + high reviews (≥4.8) + recent (≤180 days)
- **Promoter**: High reviews (≥4.5) + recent (≤365 days)
- **HighValue_Recent**: High spend (>$1000) + very recent (≤90 days)
- **AtRisk**: Old guests (>365 days) OR negative communication sentiment
- **Neutral**: Default segment for all other guests

## Outreach Cadence

- **Outreach1**: T+3 days - Thank you + review request
- **Outreach2**: T+14 days - Value content + soft CTA
- **Outreach3**: T+30 days - Incentive with promo code
- **Outreach4**: T+60 days - Alternative offer
- **Outreach5**: T+110 days - Final reminder before blackout

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd drip-campaign
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Data Files

The application expects the following input files in the `inputs/` directory:

- `str_past_guests_seed_with_segments.json` - Guest and property data
- `segmentation_rules.json` - Segmentation rule definitions
- `tones.json` - Tone mapping per segment
- `outreach_templates.json` - Email and SMS templates
- `offer_texts.json` - Primary offer texts per segment
- `alt_offer_texts.json` - Alternative offer texts per segment
- `promo_codes.json` - Promo codes per segment and outreach

## Usage

### Processing Data

1. The application automatically loads and processes the seed data on startup
2. Use the filter panel to narrow down results by segment, property, consent, etc.
3. Switch between tabs to view different data types:
   - **Contacts**: Guest contact information
   - **Custom Fields**: Segmentation and workflow state
   - **Actions**: Scheduled outreach actions

### Exporting Data

1. Click "Export JSONL" to download three separate files:
   - `contacts.jsonl` - Guest contact records
   - `custom_fields.jsonl` - Workflow state and segmentation
   - `actions.jsonl` - Scheduled outreach actions

2. Click "Export JSON" to download all data as a single JSON file

### CRM Integration

The exported JSONL files are designed for easy CRM integration:

- **Idempotency**: Each action has a unique `dedupeKey` to prevent duplicates
- **Timezone Support**: Send dates include proper timezone information
- **Template Rendering**: All placeholders are pre-filled with guest data
- **Booking URLs**: Generated with property slugs and promo codes

## Configuration

### Segmentation Rules

Modify `inputs/segmentation_rules.json` to adjust segmentation logic:

```json
{
  "rules": [
    {
      "name": "Promoter_VIP",
      "conditions": {
        "lifetime_spend": "> 2000",
        "avg_review_score": ">= 4.8",
        "recency_days": "<= 180"
      }
    }
  ]
}
```

### Templates

Update `inputs/outreach_templates.json` to modify email and SMS templates. Use placeholders like `{first_name}`, `{last_property}`, `{offer_text}`, etc.

### Offers and Promo Codes

Configure segment-specific offers in `inputs/offer_texts.json` and `inputs/alt_offer_texts.json`, and promo codes in `inputs/promo_codes.json`.

## Technical Details

### Property Slug Generation

Property names are converted to URL-safe slugs:
- Convert to lowercase
- Remove special characters except spaces and hyphens
- Replace spaces with hyphens
- Collapse multiple hyphens

Example: `"WhiteSmoke Bungalow #14"` → `"whitesmoke-bungalow-14"`

### Booking URL Format

```
https://yourstrplatform.com/bookings/{property_slug}?guest_id={guest_id}&promo={promo_code}
```

### Send Date Calculation

Send dates are calculated as:
- Base date: `last_check_out`
- Offset: Days from cadence (3, 14, 30, 60, 110)
- Time: 9:00 AM local time
- Timezone: Property-specific timezone

### Template Placeholders

Available placeholders in templates:
- `{first_name}` - Guest's first name
- `{last_property}` - Property name from last stay
- `{city}` - Property city
- `{booking_url}` - Generated booking URL
- `{offer_text}` - Primary offer text
- `{alt_offer_text}` - Alternative offer text
- `{promo_code}` - Promo code (if applicable)
- `{date}` - Offer expiry date (send date + 7 days)

## Development

### Project Structure

```
drip-campaign/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
├── inputs/               # Input data files
├── lib/                  # Core business logic
├── types/                # TypeScript type definitions
└── README.md
```

### Building for Production

```bash
npm run build
npm start
```

### Linting and Formatting

```bash
npm run lint
npm run format
```

## License

This project is licensed under the MIT License.
