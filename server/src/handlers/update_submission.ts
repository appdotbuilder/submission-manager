
import { db } from '../db';
import { submissionsTable } from '../db/schema';
import { type UpdateSubmissionInput, type Submission } from '../schema';
import { eq, sql } from 'drizzle-orm';

export async function updateSubmission(input: UpdateSubmissionInput): Promise<Submission> {
  try {
    // Build the update object with only provided fields
    const updateData: any = {};
    
    if (input.title !== undefined) {
      updateData.title = input.title;
    }
    
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    
    // Always update the updated_at timestamp
    updateData.updated_at = sql`now()`;
    
    // Update the submission and return the result
    const result = await db.update(submissionsTable)
      .set(updateData)
      .where(eq(submissionsTable.id, input.id))
      .returning()
      .execute();
    
    // Check if submission was found and updated
    if (result.length === 0) {
      throw new Error(`Submission with id ${input.id} not found`);
    }
    
    return result[0];
  } catch (error) {
    console.error('Submission update failed:', error);
    throw error;
  }
}
