
import { z } from 'zod';

// Submission schema
export const submissionSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Submission = z.infer<typeof submissionSchema>;

// Input schema for creating submissions
export const createSubmissionInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required')
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionInputSchema>;

// Input schema for updating submissions
export const updateSubmissionInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional()
});

export type UpdateSubmissionInput = z.infer<typeof updateSubmissionInputSchema>;

// Input schema for deleting submissions
export const deleteSubmissionInputSchema = z.object({
  id: z.number()
});

export type DeleteSubmissionInput = z.infer<typeof deleteSubmissionInputSchema>;

// Input schema for getting a single submission
export const getSubmissionInputSchema = z.object({
  id: z.number()
});

export type GetSubmissionInput = z.infer<typeof getSubmissionInputSchema>;
