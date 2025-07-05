
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { submissionsTable } from '../db/schema';
import { type GetSubmissionInput } from '../schema';
import { getSubmission } from '../handlers/get_submission';

describe('getSubmission', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should get a submission by ID', async () => {
    // Create test submission
    const testSubmission = await db.insert(submissionsTable)
      .values({
        title: 'Test Submission',
        description: 'A test submission description'
      })
      .returning()
      .execute();

    const submissionId = testSubmission[0].id;

    const input: GetSubmissionInput = {
      id: submissionId
    };

    const result = await getSubmission(input);

    expect(result.id).toEqual(submissionId);
    expect(result.title).toEqual('Test Submission');
    expect(result.description).toEqual('A test submission description');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when submission not found', async () => {
    const input: GetSubmissionInput = {
      id: 999 // Non-existent ID
    };

    await expect(getSubmission(input)).rejects.toThrow(/not found/i);
  });

  it('should return submission with correct timestamp types', async () => {
    // Create test submission
    const testSubmission = await db.insert(submissionsTable)
      .values({
        title: 'Timestamp Test',
        description: 'Testing timestamp handling'
      })
      .returning()
      .execute();

    const input: GetSubmissionInput = {
      id: testSubmission[0].id
    };

    const result = await getSubmission(input);

    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at.getTime()).toBeGreaterThan(0);
    expect(result.updated_at.getTime()).toBeGreaterThan(0);
  });
});
