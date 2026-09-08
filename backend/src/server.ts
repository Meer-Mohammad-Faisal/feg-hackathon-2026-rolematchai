import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { content, sessions, allEvents, findContent } from './data';
import { detectIntent, detectIntentWithAI } from './services/intentService';
import { recommend } from './services/recommendationService';
import { analytics } from './services/analyticsService';
import { setSessionContext, getSessionContext, setRecommendations, getRecommendations } from './cache';

const app = express();
app.use(cors());
app.use(express.json());

const error = (res: express.Response, message: string, status = 400) =>
  res.status(status).json({ error: { message } });

app.get('/api/health', (_, res) => res.json({ ok: true, mode: process.env.NODE_ENV || 'demo' }));

app.get('/api/content', (req, res) => {
  const q = String(req.query.q ?? '').toLowerCase();
  const category = String(req.query.category ?? '');
  res.json({
    data: content.filter(c =>
      (!q || `${c.title} ${c.category} ${c.tags.join(' ')}`.toLowerCase().includes(q)) &&
      (!category || c.category === category)
    )
  });
});

app.get('/api/content/:id', (req, res) => {
  const item = findContent(req.params.id);
  return item ? res.json({ data: item }) : error(res, 'Content not found', 404);
});

app.post('/api/session/start', async (req, res) => {
  const id = `session_${Date.now()}`;
  const mode = req.body?.mode === 'control' ? 'control' : 'intelligent';
  const s = {
    id,
    userId: String(req.body?.userId ?? 'demo-user'),
    startedAt: new Date().toISOString(),
    mode,
    events: [],
    intent: detectIntent([])
  } as any;
  sessions.set(id, s);

  // Store in Redis if available
  try {
    await setSessionContext(id, s);
  } catch (err) {
    console.log('Redis unavailable, using in-memory storage');
  }

  res.status(201).json({ data: s });
});

app.post('/api/events', async (req, res) => {
  const schema = z.object({
    sessionId: z.string(),
    eventType: z.enum([
      'SESSION_STARTED',
      'SEARCH',
      'CONTENT_VIEWED',
      'FILTER_USED',
      'RECOMMENDATION_SHOWN',
      'RECOMMENDATION_CLICKED',
      'ACTION_STARTED',
      'ACTION_COMPLETED',
      'SESSION_ENDED'
    ]),
    contentId: z.string().optional(),
    metadata: z.record(z.unknown()).default({})
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return error(res, 'Invalid event payload');

  const s = sessions.get(parsed.data.sessionId);
  if (!s) return error(res, 'Session not found', 404);

  const event = {
    id: `evt_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    ...parsed.data,
    createdAt: new Date().toISOString()
  };

  s.events.push(event);
  allEvents.push(event);

  // Use AI intent parsing if available for search events
  if (parsed.data.eventType === 'SEARCH' && parsed.data.metadata.query) {
    s.intent = await detectIntentWithAI(s.events, String(parsed.data.metadata.query));
  } else {
    s.intent = detectIntent(s.events);
  }

  res.status(201).json({ data: { event, intent: s.intent } });
});

app.get('/api/recommendations/:sessionId', async (req, res) => {
  const s = sessions.get(req.params.sessionId);
  if (!s) return error(res, 'Session not found', 404);

  // Check cache first
  try {
    const cached = await getRecommendations(req.params.sessionId);
    if (cached && s.mode === 'control') {
      return res.json({ data: cached, intent: s.intent, cached: true });
    }
  } catch (err) {
    console.log('Redis unavailable, generating fresh recommendations');
  }

  const recommendations = recommend(content, s.intent, s.events);

  // Cache recommendations for intelligent mode
  if (s.mode === 'intelligent') {
    try {
      await setRecommendations(req.params.sessionId, recommendations);
    } catch (err) {
      console.log('Redis unavailable, skipping cache');
    }
  }

  res.json({ data: recommendations, intent: s.intent, cached: false });
});

app.post('/api/session/end', async (req, res) => {
  const s = sessions.get(String(req.body?.sessionId));
  if (!s) return error(res, 'Session not found', 404);
  s.endedAt = new Date().toISOString();
  res.json({ data: s });
});

app.get('/api/analytics/overview', (_, res) =>
  res.json({
    data: analytics([...sessions.values()]),
    comparison: {
      control: { timeToFirstAction: 31, actionsPerSession: 1.5, conversionRate: 0.124 },
      intelligent: { timeToFirstAction: 18, actionsPerSession: 2.4, conversionRate: 0.187 }
    }
  })
);

app.get('/api/analytics/session/:id', (req, res) => {
  const s = sessions.get(req.params.id);
  return s
    ? res.json({ data: { session: s, intent: s.intent } })
    : error(res, 'Session not found', 404);
});

const port = Number(process.env.BACKEND_PORT ?? 4000);
app.listen(port, () => console.log(`SessionIQ backend listening on ${port}`));
