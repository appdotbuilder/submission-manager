
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { submissionsTable } from '../db/schema';
import { getSubmissions } from '../handlers/get_submissions';

describe('getSubmissions', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no submissions exist', async () => {
    const result = await getSubmissions();
    
    expect(result).toEqual([]);
  });

  it('should return all submissions ordered by created_at descending', async () => {
    // Create test submissions with different timestamps
    const firstSubmission = await db.insert(submissionsTable)
      .values({
        title: 'First Submission',
        description: 'First submission description'
      })
      .returning()
      .execute();

    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const secondSubmission = await db.insert(submissionsTable)
      .values({
        title: 'Second Submission',
        description: 'Second submission description'
      })
      .returning()
      .execute();

    const result = await getSubmissions();

    expect(result).toHaveLength(2);
    
    // Should be ordered by created_at descending (newest first)
    expect(result[0].id).toEqual(secondSubmission[0].id);
    expect(result[0].title).toEqual('Second Submission');
    expect(result[0].description).toEqual('Second submission description');
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
    
    expect(result[1].id).toEqual(firstSubmission[0].id);
    expect(result[1].title).toEqual('First Submission');
    expect(result[1].description).toEqual('First submission description');
    expect(result[1].created_at).toBeInstanceOf(Date);
    expect(result[1].updated_at).toBeInstanceOf(Date);
    
    // Verify ordering - second submission should have later timestamp
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should include all required fields', async () => {
    await db.insert(submissionsTable)
      .values({
        title: 'Test Submission',
        description: 'Test description'
      })
      .execute();

    const result = await getSubmissions();

    expect(result).toHaveLength(1);
    
    const submission = result[0];
    expect(submission.id).toBeDefined();
    expect(typeof submission.id).toBe('number');
    expect(submission.title).toBe('Test Submission');
    expect(submission.description).toBe('Test description');
    expect(submission.created_at).toBeInstanceOf(Date);
    expect(submission.updated_at).toBeInstanceOf(Date);
  });
});
