
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { leadFinderWorkflow } from './workflows/lead-finder-workflow';
import { leadEnricherWorkflow } from './workflows/lead-enricher-workflow';
import { combinedLeadWorkflow } from './workflows/combined-lead-workflow';
import { emailWriterWorkflow } from './workflows/email-writer-workflow';
import { leadFinderAgent } from './agents/lead-finder-agent';
import { leadEnricherAgent } from './agents/lead-enricher-agent';
import { emailWriterAgent } from './agents/email-writer-agent';

export const mastra = new Mastra({
  workflows: { leadFinderWorkflow, leadEnricherWorkflow, combinedLeadWorkflow, emailWriterWorkflow },
  agents: { leadFinderAgent, leadEnricherAgent, emailWriterAgent },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
