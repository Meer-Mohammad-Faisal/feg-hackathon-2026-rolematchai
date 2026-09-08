import { createClient, RedisClientType } from 'redis';

let client: RedisClientType | null = null;

export function getRedisClient(): RedisClientType {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Redis reconnection failed after 10 retries');
            return new Error('Redis reconnection failed');
          }
          const delay = Math.min(retries * 100, 3000);
          return delay;
        }
      }
    });

    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    client.connect().catch((err) => {
      console.error('Failed to connect to Redis:', err);
    });
  }
  return client;
}

export async function setSessionContext(sessionId: string, data: any): Promise<void> {
  try {
    const redis = getRedisClient();
    await redis.setEx(`session:${sessionId}`, 3600, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to set session context in Redis:', err);
  }
}

export async function getSessionContext(sessionId: string): Promise<any | null> {
  try {
    const redis = getRedisClient();
    const data = await redis.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Failed to get session context from Redis:', err);
    return null;
  }
}

export async function setRecommendations(sessionId: string, recommendations: any[]): Promise<void> {
  try {
    const redis = getRedisClient();
    await redis.setEx(`recommendations:${sessionId}`, 1800, JSON.stringify(recommendations));
  } catch (err) {
    console.error('Failed to set recommendations in Redis:', err);
  }
}

export async function getRecommendations(sessionId: string): Promise<any[] | null> {
  try {
    const redis = getRedisClient();
    const data = await redis.get(`recommendations:${sessionId}`);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Failed to get recommendations from Redis:', err);
    return null;
  }
}

export async function setPopularContent(content: any[]): Promise<void> {
  try {
    const redis = getRedisClient();
    await redis.setEx('content:popular', 300, JSON.stringify(content));
  } catch (err) {
    console.error('Failed to set popular content in Redis:', err);
  }
}

export async function getPopularContent(): Promise<any[] | null> {
  try {
    const redis = getRedisClient();
    const data = await redis.get('content:popular');
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Failed to get popular content from Redis:', err);
    return null;
  }
}

export async function closeRedisClient(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
  }
}
