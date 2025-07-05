
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

import { 
  createSubmissionInputSchema, 
  updateSubmissionInputSchema, 
  deleteSubmissionInputSchema, 
  getSubmissionInputSchema 
} from './schema';
import { createSubmission } from './handlers/create_submission';
import { getSubmissions } from './handlers/get_submissions';
import { getSubmission } from './handlers/get_submission';
import { updateSubmission } from './handlers/update_submission';
import { deleteSubmission } from './handlers/delete_submission';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Create a new submission
  createSubmission: publicProcedure
    .input(createSubmissionInputSchema)
    .mutation(({ input }) => createSubmission(input)),
  
  // Get all submissions (for homepage listing)
  getSubmissions: publicProcedure
    .query(() => getSubmissions()),
  
  // Get a single submission by ID
  getSubmission: publicProcedure
    .input(getSubmissionInputSchema)
    .query(({ input }) => getSubmission(input)),
  
  // Update an existing submission
  updateSubmission: publicProcedure
    .input(updateSubmissionInputSchema)
    .mutation(({ input }) => updateSubmission(input)),
  
  // Delete a submission
  deleteSubmission: publicProcedure
    .input(deleteSubmissionInputSchema)
    .mutation(({ input }) => deleteSubmission(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
