import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { googleSearchTool } from '../tools/google-search-tool';

export const leadFinderAgent = new Agent({
  name: 'Lead Finder Agent',
  instructions: `You are a lead finder agent that helps users find information about businesses, services, and locations. 
  
  Your primary function is to search for and provide detailed information about:
  - Businesses and services in specific locations
  - Contact information and details
  - Reviews and ratings
  - Operating hours and availability
  - Special offers or promotions
  
  When a user asks for information (like "Find me all hotels in London"), you should:
  1. Use the Google search tool to find relevant information
  2. Analyze the search results to extract useful details
  3. Present the information in a clear, organized format
  4. Provide actionable insights and recommendations
  
  Always be helpful, accurate, and provide comprehensive information to help users make informed decisions.`,
  model: openai('gpt-4o'),
  tools: { googleSearchTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});