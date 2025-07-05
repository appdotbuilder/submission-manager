
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { submissionsTable } from '../db/schema';
import { type DeleteSubmissionInput } from '../schema';
import { deleteSubmission } from '../handlers/delete_submission';
import { eq } from 'drizzle-orm';

describe('deleteSubmission', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a submission successfully', async () => {
    // Create a test submission first
    const createResult = await db.insert(submissionsTable)
      .values({
        title: 'Test Submission',
        description: 'A submission for testing deletion'
      })
      .returning()
      .execute();

    const createdSubmission = createResult[0];

    // Delete the submission
    const deleteInput: DeleteSubmissionInput = {
      id: createdSubmission.id
    };

    await deleteSubmission(deleteInput);

    // Verify the submission is deleted
    const remainingSubmissions = await db.select()
      .from(submissionsTable)
      .where(eq(submissionsTable.id, createdSubmission.id))
      .execute();

    expect(remainingSubmissions).toHaveLength(0);
  });

  it('should throw error when submission not found', async () => {
    const deleteInput: DeleteSubmissionInput = {
      id: 999 // Non-existent ID
    };

    await expect(deleteSubmission(deleteInput)).rejects.toThrow(/not found/i);
  });

  it('should not affect other submissions', async () => {
    // Create multiple test submissions
    const createResult = await db.insert(submissionsTable)
      .values([
        {
          title: 'Submission 1',
          description: 'First submission'
        },
        {
          title: 'Submission 2',
          description: 'Second submission'
        }
      ])
      .returning()
      .execute();

    const [submission1, submission2] = createResult;

    // Delete only the first submission
    const deleteInput: DeleteSubmissionInput = {
      id: submission1.id
    };

    await deleteSubmission(deleteInput);

    // Verify first submission is deleted
    const deletedSubmissions = await db.select()
      .from(submissionsTable)
      .where(eq(submissionsTable.id, submission1.id))
      .execute();

    expect(deletedSubmissions).toHaveLength(0);

    // Verify second submission still exists
    const remainingSubmissions = await db.select()
      .from(submissionsTable)
      .where(eq(submissionsTable.id, submission2.id))
      .execute();

    expect(remainingSubmissions).toHaveLength(1);
    expect(remainingSubmissions[0].title).toEqual('Submission 2');
  });
});
