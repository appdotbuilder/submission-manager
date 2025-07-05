
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { submissionsTable } from '../db/schema';
import { type UpdateSubmissionInput } from '../schema';
import { updateSubmission } from '../handlers/update_submission';
import { eq } from 'drizzle-orm';

describe('updateSubmission', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update only the title field', async () => {
    // Create test submission
    const createResult = await db.insert(submissionsTable)
      .values({
        title: 'Original Title',
        description: 'Original Description'
      })
      .returning()
      .execute();

    const originalSubmission = createResult[0];

    // Update only the title
    const updateInput: UpdateSubmissionInput = {
      id: originalSubmission.id,
      title: 'Updated Title'
    };

    const result = await updateSubmission(updateInput);

    // Verify updated fields
    expect(result.id).toEqual(originalSubmission.id);
    expect(result.title).toEqual('Updated Title');
    expect(result.description).toEqual('Original Description'); // Should remain unchanged
    expect(result.created_at).toEqual(originalSubmission.created_at);
    expect(result.updated_at).not.toEqual(originalSubmission.updated_at);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update only the description field', async () => {
    // Create test submission
    const createResult = await db.insert(submissionsTable)
      .values({
        title: 'Original Title',
        description: 'Original Description'
      })
      .returning()
      .execute();

    const originalSubmission = createResult[0];

    // Update only the description
    const updateInput: UpdateSubmissionInput = {
      id: originalSubmission.id,
      description: 'Updated Description'
    };

    const result = await updateSubmission(updateInput);

    // Verify updated fields
    expect(result.id).toEqual(originalSubmission.id);
    expect(result.title).toEqual('Original Title'); // Should remain unchanged
    expect(result.description).toEqual('Updated Description');
    expect(result.created_at).toEqual(originalSubmission.created_at);
    expect(result.updated_at).not.toEqual(originalSubmission.updated_at);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update both title and description', async () => {
    // Create test submission
    const createResult = await db.insert(submissionsTable)
      .values({
        title: 'Original Title',
        description: 'Original Description'
      })
      .returning()
      .execute();

    const originalSubmission = createResult[0];

    // Update both fields
    const updateInput: UpdateSubmissionInput = {
      id: originalSubmission.id,
      title: 'Updated Title',
      description: 'Updated Description'
    };

    const result = await updateSubmission(updateInput);

    // Verify updated fields
    expect(result.id).toEqual(originalSubmission.id);
    expect(result.title).toEqual('Updated Title');
    expect(result.description).toEqual('Updated Description');
    expect(result.created_at).toEqual(originalSubmission.created_at);
    expect(result.updated_at).not.toEqual(originalSubmission.updated_at);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save changes to database', async () => {
    // Create test submission
    const createResult = await db.insert(submissionsTable)
      .values({
        title: 'Original Title',
        description: 'Original Description'
      })
      .returning()
      .execute();

    const originalSubmission = createResult[0];

    // Update submission
    const updateInput: UpdateSubmissionInput = {
      id: originalSubmission.id,
      title: 'Updated Title',
      description: 'Updated Description'
    };

    await updateSubmission(updateInput);

    // Verify changes are persisted in database
    const submissions = await db.select()
      .from(submissionsTable)
      .where(eq(submissionsTable.id, originalSubmission.id))
      .execute();

    expect(submissions).toHaveLength(1);
    expect(submissions[0].title).toEqual('Updated Title');
    expect(submissions[0].description).toEqual('Updated Description');
    expect(submissions[0].updated_at).not.toEqual(originalSubmission.updated_at);
  });

  it('should throw error when submission not found', async () => {
    const updateInput: UpdateSubmissionInput = {
      id: 999, // Non-existent ID
      title: 'Updated Title'
    };

    expect(updateSubmission(updateInput)).rejects.toThrow(/submission with id 999 not found/i);
  });

  it('should update updated_at timestamp even with no field changes', async () => {
    // Create test submission
    const createResult = await db.insert(submissionsTable)
      .values({
        title: 'Original Title',
        description: 'Original Description'
      })
      .returning()
      .execute();

    const originalSubmission = createResult[0];

    // Update with no actual field changes (empty update)
    const updateInput: UpdateSubmissionInput = {
      id: originalSubmission.id
    };

    const result = await updateSubmission(updateInput);

    // Verify updated_at is still updated
    expect(result.updated_at).not.toEqual(originalSubmission.updated_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.title).toEqual('Original Title');
    expect(result.description).toEqual('Original Description');
  });
});
