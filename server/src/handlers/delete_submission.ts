
import { db } from '../db';
import { submissionsTable } from '../db/schema';
import { type DeleteSubmissionInput } from '../schema';
import { eq } from 'drizzle-orm';

export async function deleteSubmission(input: DeleteSubmissionInput): Promise<void> {
  try {
    // Delete the submission by ID
    const result = await db.delete(submissionsTable)
      .where(eq(submissionsTable.id, input.id))
      .returning()
      .execute();

    // Check if any row was deleted
    if (result.length === 0) {
      throw new Error(`Submission with ID ${input.id} not found`);
    }
  } catch (error) {
    console.error('Submission deletion failed:', error);
    throw error;
  }
}
