# Drip Campaign Dashboard

A comprehensive post-stay guest outreach campaign management system for short-term rental (STR) management companies. This application processes guest data, applies segmentation rules, schedules outreach campaigns, and provides a modern web interface for managing drip campaigns.

## Features

- **Automated Segmentation**: Rule-based guest segmentation using lifetime spend, review scores, recency, and communication sentiment
- **Outreach Scheduling**: Automated scheduling with T+3, T+14, T+30, T+60, and T+110 day cadence
- **Template Engine**: Dynamic template filling with personalized content based on guest segments
- **Multi-Channel Support**: Email and SMS outreach with consent management
- **Modern UI**: Responsive design with dark/light theme support and smooth animations
- **Data Export**: JSONL export functionality for CRM integration
- **Real-time Preview**: Live preview of scheduled campaigns and guest data

## Tech Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **UI Components**: Custom components with Lucide React icons
- **Theme**: Dark/Light mode with system preference detection
- **Data Processing**: Server-side processing with file-based data storage
- **Export**: JSONL format for CRM integration

## Project Structure

```
drip-campaign/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── components/        # React components
│   │   ├── data-table.tsx # Data table with sorting/filtering
│   │   ├── tabs.tsx       # Tab component
│   │   ├── theme-provider.tsx # Theme context
│   │   └── theme-toggle.tsx   # Theme switcher
│   ├── lib/               # Utility libraries
│   │   ├── data-loader.ts     # Data loading utilities
│   │   ├── segmentation.ts    # Segmentation engine
│   │   ├── outreach-scheduler.ts # Outreach scheduling
│   │   ├── template-engine.ts    # Template processing
│   │   ├── drip-campaign-processor.ts # Main processor
│   │   └── utils.ts           # General utilities
│   ├── types/             # TypeScript type definitions
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard
├── inputs/                # Input data files
│   ├── str_past_guests_seed_with_segments.json
│   ├── segmentation_rules.json
│   ├── tones.json
│   ├── outreach_templates.json
│   ├── offer_texts.json
│   ├── alt_offer_texts.json
│   └── promo_codes.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ or Bun
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd drip-campaign
   ```

2. **Install dependencies**
   ```bash
   # Using Bun (recommended)
   bun install
   
   # Or using npm
   npm install
   ```

3. **Start the development server**
   ```bash
   # Using Bun
   bun run dev
   
   # Or using npm
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Data Processing Workflow

### 1. Guest Segmentation

The system applies deterministic rules to segment guests into categories:

- **Promoter_VIP**: High spend (>$2000), high reviews (≥4.8), recent (≤180 days)
- **Promoter**: High reviews (≥4.5), recent (≤365 days)
- **HighValue_Recent**: High spend (>$1000), very recent (≤90 days)
- **AtRisk**: Old guests (>365 days) or negative sentiment
- **Neutral**: Default segment for all other guests

### 2. Outreach Scheduling

Outreach campaigns are scheduled based on days since last checkout:

- **Outreach1**: T+3 days - Thank you + review request
- **Outreach2**: T+14 days - Value content + soft CTA
- **Outreach3**: T+30 days - Incentive offer (time-boxed)
- **Outreach4**: T+60 days - Alternative perk reminder
- **Outreach5**: T+110 days - Final chance before blackout

### 3. Template Personalization

Templates are filled with:
- Guest information (name, property, city)
- Segment-specific offers and promo codes
- Dynamic booking URLs
- Tone-appropriate messaging

### 4. Multi-Channel Delivery

- **Email**: Sent to guests with email consent
- **SMS**: Sent to guests with SMS consent
- **Deduplication**: Unique dedupe keys prevent duplicate actions

## Export Files

The system generates three JSONL files for CRM integration:

### contacts.jsonl
```json
{"guest_id": "g_2076", "first_name": "Jennifer", "last_name": "Henry", "email": "jennifer.henry@example.com", "phone": "+16215279487"}
```

### custom_fields.jsonl
```json
{"guest_id": "g_2076", "segment": "AtRisk", "current_outreach": "Outreach2", "next_outreach": "Outreach3", "planned_send_date": "2025-09-21"}
```

### actions.jsonl
```json
{"guest_id": "g_2076", "outreach": "Outreach3", "send_date": "2025-09-21", "channel": "email", "template_id": "Outreach3", "dedupeKey": "g_2076-Outreach3", "promo_code": "RISK10", "offer_text": "20% off to welcome you back", "booking_url": "https://yourstrplatform.com/bookings/..."}
```

## Configuration

### Segmentation Rules

Edit `inputs/segmentation_rules.json` to modify guest segmentation logic:

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

### Outreach Templates

Modify `inputs/outreach_templates.json` to customize email and SMS templates:

```json
{
  "Outreach1": {
    "friendly": {
      "email": {
        "subject": "Thanks a bunch, {first_name}! 🌟",
        "body": "Hey {first_name}, thanks for staying at {last_property}! 💛",
        "preview": "We'd love your feedback on your stay at {last_property}."
      },
      "sms": "Thx {first_name}! Hope {last_property} felt like home 🏡. Quick review? {booking_url}"
    }
  }
}
```

### Offers and Promo Codes

Customize segment-specific offers in:
- `inputs/offer_texts.json` - Primary offers
- `inputs/alt_offer_texts.json` - Alternative offers
- `inputs/promo_codes.json` - Promo codes by segment and outreach

## Development

### Available Scripts

```bash
# Development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Lint code
bun run lint

# Format code
bun run format
```

### Adding New Features

1. **New Segmentation Rules**: Add rules to `segmentation_rules.json` and update the segmentation engine
2. **New Outreach Types**: Add templates to `outreach_templates.json` and update the scheduler
3. **New UI Components**: Create components in `src/components/` following the existing patterns
4. **API Endpoints**: Add new routes in `src/app/api/`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with default settings

### Other Platforms

1. Build the application: `bun run build`
2. Start the production server: `bun run start`
3. Configure environment variables as needed

## Troubleshooting

### Common Issues

1. **Data Loading Errors**: Ensure all input files are present in the `inputs/` directory
2. **Build Errors**: Check TypeScript types and ensure all imports are correct
3. **Theme Issues**: Clear browser cache and check for CSS conflicts

### Performance

- The application processes data server-side for better performance
- Large datasets are handled efficiently with streaming and pagination
- Client-side filtering and sorting provide responsive UI interactions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.