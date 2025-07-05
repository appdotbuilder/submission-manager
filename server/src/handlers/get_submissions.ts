
import { db } from '../db';
import { submissionsTable } from '../db/schema';
import { type Submission } from '../schema';
import { desc } from 'drizzle-orm';

export async function getSubmissions(): Promise<Submission[]> {
  try {
    const results = await db.select()
      .from(submissionsTable)
      .orderBy(desc(submissionsTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch submissions:', error);
    throw error;
  }
}
