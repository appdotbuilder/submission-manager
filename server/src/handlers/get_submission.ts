
import { db } from '../db';
import { submissionsTable } from '../db/schema';
import { type GetSubmissionInput, type Submission } from '../schema';
import { eq } from 'drizzle-orm';

export const getSubmission = async (input: GetSubmissionInput): Promise<Submission> => {
  try {
    const result = await db.select()
      .from(submissionsTable)
      .where(eq(submissionsTable.id, input.id))
      .execute();

    if (result.length === 0) {
      throw new Error(`Submission with ID ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Get submission failed:', error);
    throw error;
  }
};
