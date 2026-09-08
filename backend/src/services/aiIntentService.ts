import { Intent } from '../types';

interface AIIntentResponse {
  intent: string;
  category?: string;
  timeContext?: string;
  confidence: number;
  signals: string[];
}

export class AIIntentService {
  private apiKey: string | null = null;
  private apiUrl: string = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || null;
  }

  isAvailable(): boolean {
    return this.apiKey !== null && this.apiKey.length > 0;
  }

  async parseIntent(query: string, context: any): Promise<Intent> {
    if (!this.isAvailable()) {
      throw new Error('AI service not available - missing API key');
    }

    const systemPrompt = `You are an intent parser for a content discovery platform. 
Analyze user queries and session context to determine their intent.
Return ONLY valid JSON with this structure:
{
  "intent": "FOOTBALL_DISCOVERY" | "BASKETBALL_DISCOVERY" | "TENNIS_DISCOVERY" | "UPCOMING_DISCOVERY" | "GENERAL_DISCOVERY",
  "category": "Football" | "Basketball" | "Tennis" | "Live" | null,
  "timeContext": "Tonight" | "Upcoming" | "Weekend" | null,
  "confidence": 0.0-1.0,
  "signals": ["signal1", "signal2"]
}

Categories: Football, Basketball, Tennis, Live
Time contexts: Tonight, Upcoming, Weekend
Intent types: FOOTBALL_DISCOVERY, BASKETBALL_DISCOVERY, TENNIS_DISCOVERY, UPCOMING_DISCOVERY, GENERAL_DISCOVERY`;

    const userPrompt = `Query: "${query}"
Context: ${JSON.stringify(context)}

Parse the intent and return JSON only.`;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 200
        })
      });

      if (!response.ok) {
        throw new Error(`AI API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '{}';
      const parsed: AIIntentResponse = JSON.parse(content);

      return {
        intent: parsed.intent || 'GENERAL_DISCOVERY',
        category: parsed.category,
        timeContext: parsed.timeContext,
        confidence: parsed.confidence || 0.5,
        signals: parsed.signals || []
      };
    } catch (error) {
      console.error('AI intent parsing failed:', error);
      throw error;
    }
  }
}

export const aiIntentService = new AIIntentService();
