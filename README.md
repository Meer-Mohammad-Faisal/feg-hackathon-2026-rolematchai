# SessionIQ — Session Intelligence

**FEG Innovation Hackathon 2026, Challenge 1: Session Quality and Session-to-Action Conversion**

## Team Name
[Placeholder Team Name]

## Challenge
Challenge 1: Session Quality and Session-to-Action Conversion

## Solution Title
SessionIQ — Session Intelligence

## Problem Statement
Users frequently open the product but many sessions end in browsing without meaningful actions. Generic layouts create discovery friction, and users may reach high-intent stages but drop off before completing actions. The goal is to improve session quality without pressuring users to do more than they want.

## Solution Overview
SessionIQ is a session intelligence layer that observes user behavior in real-time, detects immediate intent, ranks relevant content, provides contextual guidance, and measures session quality. The system focuses on making each session more valuable through contextual intelligence rather than increasing engagement through pressure or manipulation.

## Key Innovation
- **Session-Scoped Intelligence**: Focuses on current session behavior, not long-term profiling
- **Transparent Recommendations**: Users see clear explanations for why content is recommended
- **Deterministic + AI**: Uses deterministic intent engine with optional AI enhancement
- **Graceful Degradation**: Works fully without external dependencies (PostgreSQL, Redis, AI)
- **Responsible Design**: No pressure tactics, artificial urgency, or dark patterns

## User Journey

### Control Mode (Baseline)
1. User opens application
2. Browses generic content feed
3. Searches for specific content
4. Views multiple items
5. Receives static recommendations
6. May or may not complete an action

### Session Intelligence Mode (Enhanced)
1. User opens application
2. Searches for content (e.g., "football tonight")
3. Views multiple items in a category
4. Session engine detects intent (e.g., FOOTBALL_DISCOVERY)
5. Recommendations update based on detected intent
6. Session Insight panel appears with contextual guidance
7. User selects relevant content
8. User completes a meaningful action
9. Analytics measure session quality improvement

## Architecture

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI**: React 19 with TypeScript
- **Styling**: Tailwind CSS
- **Components**: Modular component structure (Header, ContentCard, SessionInsight, AnalyticsDashboard)

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (primary data store)
- **Cache**: Redis (session context, recommendations)
- **AI**: OpenAI/Gemini API (optional, with deterministic fallback)

### Services
- **Intent Engine**: Deterministic rule-based intent detection
- **AI Intent Parser**: Optional AI enhancement with fallback
- **Recommendation Engine**: Transparent scoring with explanations
- **Analytics Service**: Session quality metrics calculation

See [docs/architecture.md](docs/architecture.md) for detailed architecture.

## Technology Stack

### Frontend
- Next.js 15.1.3
- React 19.0.0
- TypeScript 5.7.2
- Tailwind CSS 3.4.17

### Backend
- Node.js 20+
- Express.js 4.21.2
- TypeScript 5.7.2
- PostgreSQL 14+
- Redis 7+
- pg 8.13.1
- redis 4.7.0

### Testing
- Playwright 1.51.1 (E2E)
- Vitest 2.1.8 (Unit)

### Deployment
- Docker & Docker Compose
- Environment variables configuration

## Prerequisites

- Node.js 18+ (recommended 20+)
- npm 9+
- PostgreSQL 12+ (optional, falls back to in-memory)
- Redis 6+ (optional, falls back to in-memory)
- Git

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd feg-hackathon-2026-sessioniq
```

### 2. Install Dependencies

Install root dependencies:
```bash
npm install
```

Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

Install backend dependencies:
```bash
cd backend
npm install
cd ..
```

### 3. Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```bash
# Backend
DATABASE_URL=postgresql://localhost:5432/sessioniq
REDIS_URL=redis://localhost:6379
BACKEND_PORT=4000
OPENAI_API_KEY=optional_ai_key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Database Setup

### Option 1: PostgreSQL (Recommended for Production)

#### Using Docker Compose
```bash
docker-compose up postgres redis
```

#### Manual Setup
```bash
# Create database
createdb sessioniq

# Run migrations
psql sessioniq < backend/schema.sql

# Seed data
cd backend
npm run seed
```

### Option 2: In-Memory Fallback (Demo Mode)
The application works without PostgreSQL by using in-memory data structures. No database setup required for demo purposes.

## Redis Setup

### Option 1: Redis (Recommended for Production)

#### Using Docker Compose
```bash
docker-compose up redis
```

#### Manual Setup
```bash
# Start Redis server
redis-server
```

### Option 2: In-Memory Fallback (Demo Mode)
The application works without Redis by using in-memory session storage. No Redis setup required for demo purposes.

## Seed Data

Run the seed script to populate the database with sample content:
```bash
cd backend
npx tsx src/db/seed.ts
```

Or use the npm script:
```bash
npm run seed
```

## Running the Application

### Development Mode

#### Start Both Frontend and Backend
```bash
npm run dev
```

This starts:
- Frontend on http://localhost:3000
- Backend on http://localhost:4000

#### Start Frontend Only
```bash
cd frontend
npm run dev
```

#### Start Backend Only
```bash
cd backend
npm run dev
```

### Production Mode

#### Using Docker Compose
```bash
docker-compose up
```

This starts all services including PostgreSQL and Redis.

#### Manual Production Build
```bash
# Build backend
cd backend
npm run build
npm start

# Build frontend
cd frontend
npm run build
npm start
```

## Running Tests

### E2E Tests with Playwright
```bash
npm run test:e2e
```

### Unit Tests with Vitest
```bash
cd backend
npm test
```

## Demo Flow

### Scenario 1: Control Mode
1. Open http://localhost:3000
2. Select "Control Mode" on demo selection screen
3. Browse content with static recommendations
4. Search for "football"
5. View multiple items
6. Observe generic recommendations (no contextual guidance)
7. Session ends without clear value

### Scenario 2: Session Intelligence
1. Open http://localhost:3000
2. Select "Session Intelligence" on demo selection screen
3. Search for "football tonight"
4. View multiple football items
5. Observe Session Insight panel appears
6. See recommendations update based on detected intent
7. View recommendation explanations
8. Complete an action (Save as useful next step)
9. Check Analytics dashboard for session quality metrics

## Known Limitations

- **Demo Data Only**: All content and users are fictional for demonstration
- **No Authentication**: Simplified for hackathon prototype
- **In-Memory Fallback**: PostgreSQL and Redis are optional
- **Single User**: Demo uses a single demo user
- **No Real FEG Integration**: Prototype does not connect to production systems
- **Simulated Analytics**: Comparison metrics are simulated for demo narrative
- **Basic Error Handling**: Production-ready error handling not fully implemented
- **No Real-Time Updates**: WebSocket or SSE not implemented
- **Limited AI Integration**: AI intent parsing is optional and basic

## Future Improvements

### Phase 2
- Multi-session intent patterns (with user consent)
- Personalized ranking based on historical preferences
- A/B testing framework for recommendation explanations
- Advanced AI models for intent detection
- Real-time analytics dashboard for operators

### Phase 3
- Cross-category intent detection
- Time-of-day and day-of-week context
- Social proof integration
- Collaborative filtering (with privacy safeguards)
- Advanced anomaly detection for session quality

### Infrastructure
- Kubernetes deployment manifests
- CI/CD pipeline configuration
- Monitoring and alerting setup
- Load testing and optimization
- Multi-region deployment

## Documentation

- [Architecture](docs/architecture.md) - System architecture and data flow
- [Impact Case](docs/impact-case.md) - Problem, solution, and metrics
- [Compliance Note](docs/compliance-note.md) - Responsible design and privacy
- [Dependencies](docs/dependencies.md) - Libraries, frameworks, and licenses

## Environment Variables

### Backend
- `DATABASE_URL` - PostgreSQL connection string (optional)
- `REDIS_URL` - Redis connection string (optional)
- `BACKEND_PORT` - Backend server port (default: 4000)
- `OPENAI_API_KEY` - OpenAI API key for AI intent parsing (optional)
- `NODE_ENV` - Environment (development/production)

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:4000/api)

## API Endpoints

### Session Management
- `POST /api/session/start` - Initialize a new session
- `POST /api/session/end` - End a session
- `POST /api/events` - Track session events

### Content & Recommendations
- `GET /api/content` - List all content with filters
- `GET /api/content/:id` - Get specific content
- `GET /api/recommendations/:sessionId` - Get personalized recommendations

### Analytics
- `GET /api/analytics/overview` - Overall session quality metrics
- `GET /api/analytics/session/:id` - Individual session details

### Health
- `GET /api/health` - Service health check

## Security Considerations

- No API keys or secrets committed to repository
- Environment variables for sensitive configuration
- CORS configured for frontend access
- Input validation via Zod schemas
- No real customer data used
- Session-scoped data only (no long-term profiling)

## License

[To be determined for hackathon submission]

## Support

For questions or issues during the hackathon, contact the team.

---

**Built for FEG Innovation Hackathon 2026**
