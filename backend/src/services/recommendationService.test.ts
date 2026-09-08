import { describe, it, expect } from 'vitest';
import { recommend } from './recommendationService';
import type { Content, Intent, SessionEvent } from '../types';

describe('Recommendation Service', () => {
  const mockContent: Content[] = [
    {
      id: '1',
      title: 'Football Tonight',
      category: 'Football',
      startTime: 'Tonight',
      tags: [],
      popularity: 90,
      status: 'Upcoming',
      venue: 'Stadium A',
      description: 'Football match tonight',
      accent: '#64e6b1'
    },
    {
      id: '2',
      title: 'Basketball Game',
      category: 'Basketball',
      startTime: 'Tomorrow',
      tags: [],
      popularity: 80,
      status: 'Upcoming',
      venue: 'Arena B',
      description: 'Basketball game tomorrow',
      accent: '#64e6b1'
    },
    {
      id: '3',
      title: 'Tennis Match',
      category: 'Tennis',
      startTime: 'Tonight',
      tags: [],
      popularity: 70,
      status: 'Upcoming',
      venue: 'Court C',
      description: 'Tennis match tonight',
      accent: '#64e6b1'
    }
  ];

  const mockIntent: Intent = {
    intent: 'FOOTBALL_DISCOVERY',
    confidence: 0.9,
    signals: ['football_search', 'multiple_football_views']
  };

  const mockEvents: SessionEvent[] = [
    {
      id: 'e1',
      sessionId: 's1',
      eventType: 'SEARCH',
      metadata: { query: 'football' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'e2',
      sessionId: 's1',
      eventType: 'CONTENT_VIEWED',
      contentId: '1',
      metadata: { category: 'Football' },
      createdAt: new Date().toISOString()
    }
  ];

  it('should recommend content based on intent', () => {
    const recommendations = recommend(mockContent, mockIntent, mockEvents);
    
    expect(recommendations).toBeInstanceOf(Array);
    expect(recommendations.length).toBeGreaterThan(0);
    
    // Football content should be ranked higher
    const footballRec = recommendations.find(r => r.content.category === 'Football');
    expect(footballRec).toBeDefined();
  });

  it('should exclude already viewed content', () => {
    const recommendations = recommend(mockContent, mockIntent, mockEvents);
    
    const viewedContent = recommendations.find(r => r.content.id === '1');
    expect(viewedContent).toBeUndefined();
  });

  it('should include reasons for recommendations', () => {
    const recommendations = recommend(mockContent, mockIntent, mockEvents);
    
    recommendations.forEach(rec => {
      expect(rec.reasons).toBeInstanceOf(Array);
      expect(rec.reasons.length).toBeGreaterThan(0);
    });
  });

  it('should score recommendations between 0 and 1', () => {
    const recommendations = recommend(mockContent, mockIntent, mockEvents);
    
    recommendations.forEach(rec => {
      expect(rec.score).toBeGreaterThanOrEqual(0);
      expect(rec.score).toBeLessThanOrEqual(1);
    });
  });

  it('should handle empty content array', () => {
    const recommendations = recommend([], mockIntent, mockEvents);
    
    expect(recommendations).toEqual([]);
  });

  it('should handle general discovery intent', () => {
    const generalIntent: Intent = {
      intent: 'GENERAL_DISCOVERY',
      confidence: 0.5,
      signals: []
    };
    
    const recommendations = recommend(mockContent, generalIntent, []);
    
    expect(recommendations).toBeInstanceOf(Array);
    expect(recommendations.length).toBeGreaterThan(0);
  });

  it('should handle empty events array', () => {
    const recommendations = recommend(mockContent, mockIntent, []);
    
    expect(recommendations).toBeInstanceOf(Array);
    expect(recommendations.length).toBeGreaterThan(0);
  });
});
