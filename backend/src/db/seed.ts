import { query } from './index';

const contentEntries = [
  ['Champions Under Lights', 'Football', '19:30', 'Tonight · Stadium A'],
  ['City Rivals Preview', 'Football', '21:00', 'Tonight · Studio 2'],
  ['Weekend Football Briefing', 'Football', 'Sat 10:00', 'Upcoming · Arena North'],
  ['The Midfield Report', 'Football', 'Sat 14:00', 'Upcoming · Studio 1'],
  ['Women\'s Football Focus', 'Football', 'Sun 16:00', 'Upcoming · Stadium B'],
  ['Basketball: Full Court Pulse', 'Basketball', '20:00', 'Tonight · Court 4'],
  ['Rising Hoops: Weekly Roundup', 'Basketball', 'Sat 12:30', 'Upcoming · Court 2'],
  ['Tennis: Baseline Stories', 'Tennis', '18:00', 'Tonight · Court 1'],
  ['Grand Slam Roadmap', 'Tennis', 'Sun 11:00', 'Upcoming · Court 3'],
  ['Live Court Watch', 'Live', 'Now', 'Live · Multi-court']
];

const categories = ['Football', 'Basketball', 'Tennis', 'Live'];
const accents = ['#64e6b1', '#7dd3fc', '#c4b5fd', '#fbbf7d'];

export async function seedDatabase(): Promise<void> {
  console.log('Seeding database...');

  // Clear existing data
  await query('DELETE FROM recommendations');
  await query('DELETE FROM session_events');
  await query('DELETE FROM sessions');
  await query('DELETE FROM content');
  await query('DELETE FROM users');

  // Insert demo user
  await query(
    'INSERT INTO users (id, display_name) VALUES ($1, $2)',
    ['demo-user', 'Demo User']
  );

  // Insert content
  for (let i = 0; i < 36; i++) {
    const entry = contentEntries[i % contentEntries.length];
    const category = entry[1];
    const accent = accents[i % accents.length];
    const id = `event_${String(i + 1).padStart(3, '0')}`;
    const title = i < 10 ? entry[0] : `${entry[0]} · Session ${i + 1}`;
    const startTime = entry[2];
    const venue = entry[3].split(' · ')[1];
    const tags = [category.toLowerCase(), entry[3].toLowerCase().split(' · ')[0]];
    const status = startTime === 'Now' ? 'Live' : 'Upcoming';
    const popularity = 72 - (i % 7) * 5;
    const description = `A concise, informative ${category.toLowerCase()} session with the context you need to decide what is useful for you.`;

    await query(
      `INSERT INTO content (id, title, category, start_time, tags, popularity, status, venue, description, accent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [id, title, category, startTime, JSON.stringify(tags), popularity, status, venue, description, accent]
    );
  }

  console.log('Database seeded successfully');
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
