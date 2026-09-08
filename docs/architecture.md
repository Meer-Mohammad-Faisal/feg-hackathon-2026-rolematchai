# SessionIQ Architecture

## Overview

SessionIQ is a session intelligence layer that observes user behavior in real-time, detects intent, and provides contextual recommendations to improve session quality and conversion rates.

## System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │    Backend      │     │   Data Layer    │
│   (Next.js)     │────▶│   (Express)     │────▶│  PostgreSQL     │
│                 │ API │                 │ SQL │                 │
│ - Discovery    │     │ - Intent Engine │     │ - Users         │
│ - Search       │     │ - Recommender   │     │ - Content       │
│ - Detail View  │     │ - Analytics     │     │ - Sessions      │
│ - Analytics    │     │ - Event API     │     │ - Events        │
└─────────────────┘     └─────────────────┘     │ - Recommendations│
                        │         │             └─────────────────┘
                        │         │                    ▲
                        │         │                    │
                        │         └────────────────────┘
                        │              Redis
                        │         - Session Context
                        │         - Recommendations
                        │         - Popular Content
                        │
                        ▼
                ┌─────────────────┐
                │  AI Service     │
                │  (Optional)     │
                │  - OpenAI/Gemini│
                │  - Intent Parse │
                └─────────────────┘
```

## Frontend Architecture

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **UI**: React 19 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useState, useEffect, useMemo)

### Component Structure
```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main application page
│   └── globals.css         # Global styles
├── components/
│   ├── Header.tsx          # Navigation header
│   ├── ContentCard.tsx     # Content item display
│   ├── ContentDetail.tsx   # Content detail view
│   ├── SessionInsight.tsx  # Contextual guidance panel
│   └── AnalyticsDashboard.tsx # Analytics visualization
├── hooks/
│   ├── useSession.ts       # Session management
│   └── useRecommendations.ts # Recommendation fetching
├── lib/
│   └── api.ts              # API client utility
└── types.ts                # TypeScript type definitions
```

### Key Features
- **Demo Mode Selection**: Choose between Control (generic) and Intelligence (context-aware) modes
- **Real-time Intent Display**: Shows current session intent and signals
- **Session Insight Panel**: Contextual guidance based on detected intent
- **Analytics Dashboard**: Session quality metrics and control vs intelligent comparison

## Backend Architecture

### Technology Stack
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (primary data store)
- **Cache**: Redis (session context, recommendations)
- **AI**: OpenAI/Gemini API (optional, with deterministic fallback)

### Service Structure
```
src/
├── server.ts               # Express server and API routes
├── data.ts                 # In-memory fallback data
├── types.ts                # TypeScript type definitions
├── db/
│   ├── index.ts            # PostgreSQL client
│   ├── migrations/
│   │   └── 001_initial.sql # Database schema
│   └── seed.ts             # Database seeding
├── cache/
│   └── index.ts            # Redis client and utilities
└── services/
    ├── intentService.ts    # Deterministic intent detection
    ├── aiIntentService.ts  # AI intent parsing (optional)
    ├── recommendationService.ts # Content recommendation
    └── analyticsService.ts # Session quality metrics
```

### API Endpoints

#### Session Management
- `POST /api/session/start` - Initialize a new session
- `POST /api/session/end` - End a session
- `POST /api/events` - Track session events

#### Content & Recommendations
- `GET /api/content` - List all content with filters
- `GET /api/content/:id` - Get specific content
- `GET /api/recommendations/:sessionId` - Get personalized recommendations

#### Analytics
- `GET /api/analytics/overview` - Overall session quality metrics
- `GET /api/analytics/session/:id` - Individual session details

#### Health
- `GET /api/health` - Service health check

## Data Flow

### Session Flow
1. User opens application → Frontend calls `/api/session/start`
2. Backend creates session with mode (control/intelligent)
3. Session stored in memory and optionally in Redis
4. User interacts (search, view, filter) → Events sent to `/api/events`
5. Intent engine analyzes events → Updates session intent
6. Recommendation engine scores content based on intent
7. Recommendations cached in Redis (intelligent mode)
8. Frontend displays contextual guidance (Session Insight)
9. User completes action → Event tracked
10. Analytics calculate session quality metrics

### Intent Detection Flow
```
Events → Deterministic Engine → Intent
            ↓
         (Optional)
            ↓
      AI Service → Fallback to Deterministic
```

### Recommendation Scoring
```
score = 0.35 * interestMatch
      + 0.25 * sessionIntentMatch
      + 0.20 * recency
      + 0.10 * contextMatch
      + 0.10 * popularity
```

## Database Schema

### Tables

#### users
- `id` (TEXT, PK)
- `display_name` (TEXT)
- `created_at` (TIMESTAMPTZ)

#### content
- `id` (TEXT, PK)
- `title` (TEXT)
- `category` (TEXT)
- `start_time` (TEXT)
- `tags` (JSONB)
- `popularity` (NUMERIC)
- `status` (TEXT)
- `venue` (TEXT)
- `description` (TEXT)
- `accent` (TEXT)
- `created_at` (TIMESTAMPTZ)

#### sessions
- `id` (TEXT, PK)
- `user_id` (TEXT, FK)
- `started_at` (TIMESTAMPTZ)
- `ended_at` (TIMESTAMPTZ)
- `mode` (TEXT) - 'control' or 'intelligent'
- `created_at` (TIMESTAMPTZ)

#### session_events
- `id` (TEXT, PK)
- `session_id` (TEXT, FK)
- `event_type` (TEXT)
- `content_id` (TEXT, FK)
- `metadata` (JSONB)
- `created_at` (TIMESTAMPTZ)

#### recommendations
- `id` (BIGSERIAL, PK)
- `session_id` (TEXT, FK)
- `content_id` (TEXT, FK)
- `score` (NUMERIC)
- `reasons` (JSONB)
- `created_at` (TIMESTAMPTZ)

### Indexes
- `session_events_session_created_idx` on (session_id, created_at)
- `session_events_type_idx` on (event_type)
- `recommendations_session_idx` on (session_id)
- `content_category_idx` on (category)
- `content_status_idx` on (status)

## Redis Cache Keys

- `session:{sessionId}` - Session context (TTL: 1 hour)
- `recommendations:{sessionId}` - Cached recommendations (TTL: 30 minutes)
- `content:popular` - Popular content cache (TTL: 5 minutes)

## Graceful Degradation

The system is designed to work without external dependencies:

1. **PostgreSQL Unavailable**: Falls back to in-memory data structures
2. **Redis Unavailable**: Continues with in-memory session storage
3. **AI API Unavailable**: Uses deterministic intent engine
4. **Backend Unavailable**: Frontend uses fallback data and local state

## Deployment Considerations

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `OPENAI_API_KEY` - Optional AI API key
- `BACKEND_PORT` - Backend server port (default: 4000)
- `NEXT_PUBLIC_API_URL` - Frontend API URL

### Scaling
- Stateless backend design allows horizontal scaling
- Redis provides shared session context across instances
- PostgreSQL handles persistent data with proper indexing

### Security
- No sensitive data in sample/demo data
- API keys never committed to repository
- CORS configured for frontend access
- Input validation via Zod schemas

## Monitoring & Observability

### Key Metrics
- Session creation rate
- Intent detection accuracy
- Recommendation cache hit rate
- API response times
- Database query performance

### Logging
- Session lifecycle events
- Intent detection results
- Recommendation generation
- API errors and fallbacks
