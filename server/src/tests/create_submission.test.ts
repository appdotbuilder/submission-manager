
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { submissionsTable } from '../db/schema';
import { type CreateSubmissionInput } from '../schema';
import { createSubmission } from '../handlers/create_submission';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateSubmissionInput = {
  title: 'Test Submission',
  description: 'A submission for testing'
};

describe('createSubmission', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a submission', async () => {
    const result = await createSubmission(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Submission');
    expect(result.description).toEqual(testInput.description);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save submission to database', async () => {
    const result = await createSubmission(testInput);

    // Query using proper drizzle syntax
    const submissions = await db.select()
      .from(submissionsTable)
      .where(eq(submissionsTable.id, result.id))
      .execute();

    expect(submissions).toHaveLength(1);
    expect(submissions[0].title).toEqual('Test Submission');
    expect(submissions[0].description).toEqual(testInput.description);
    expect(submissions[0].created_at).toBeInstanceOf(Date);
    expect(submissions[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create multiple submissions independently', async () => {
    const secondInput: CreateSubmissionInput = {
      title: 'Another Test Submission',
      description: 'Another submission for testing'
    };

    const result1 = await createSubmission(testInput);
    const result2 = await createSubmission(secondInput);

    // Verify both submissions exist in database
    const submissions = await db.select()
      .from(submissionsTable)
      .execute();

    expect(submissions).toHaveLength(2);
    expect(result1.id).not.toEqual(result2.id);
    expect(submissions.some(s => s.title === 'Test Submission')).toBe(true);
    expect(submissions.some(s => s.title === 'Another Test Submission')).toBe(true);
  });
});
