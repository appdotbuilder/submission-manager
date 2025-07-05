
import { db } from '../db';
import { submissionsTable } from '../db/schema';
import { type CreateSubmissionInput, type Submission } from '../schema';

export const createSubmission = async (input: CreateSubmissionInput): Promise<Submission> => {
  try {
    // Insert submission record
    const result = await db.insert(submissionsTable)
      .values({
        title: input.title,
        description: input.description
      })
      .returning()
      .execute();

    // Return the created submission
    return result[0];
  } catch (error) {
    console.error('Submission creation failed:', error);
    throw error;
  }
};
