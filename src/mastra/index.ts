
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { weatherWorkflow } from './workflows/weather-workflow';
import { leadFinderWorkflow } from './workflows/lead-finder-workflow';
import { weatherAgent } from './agents/weather-agent';
import { leadFinderAgent } from './agents/lead-finder-agent';

export const mastra = new Mastra({
  workflows: { weatherWorkflow, leadFinderWorkflow },
  agents: { weatherAgent, leadFinderAgent },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
