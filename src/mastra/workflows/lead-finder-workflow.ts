import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const searchQuerySchema = z.object({
  query: z.string().describe('The search query to find information about'),
});

const searchResultSchema = z.array(
    z.object({
        rating: z.number().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        website: z.string().optional(),
        reviews: z.array(z.any()).optional(),
        name: z.string(),
        place_id: z.string(),
      })
  );

const searchStep = createStep({
  id: 'search-information',
  description: 'Searches for information using the lead finder agent',
  inputSchema: searchQuerySchema,
  outputSchema: searchResultSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const agent = mastra?.getAgent('leadFinderAgent');
    if (!agent) {
      throw new Error('Lead finder agent not found');
    }

    const prompt = `Please search for information about: "${inputData.query}"
    
    Please provide:
    1. A comprehensive search using the Google search tool
    2. Analysis of the results
    3. Organized information in a clear format
    4. Any relevant details like contact information, ratings, or special offers
    
    Format your response to be helpful and actionable for the user.`;

    const response = await agent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let resultText = '';
    for await (const chunk of response.textStream) {
      resultText += chunk;
    }

    console.log("The agent response is", resultText);
    
    // Parse the resultText to extract structured data
    // The agent should return JSON-like data that matches searchResultSchema
    try {
        // Try to parse as JSON first
        const parsedData = JSON.parse(resultText);
        if (Array.isArray(parsedData)) {
          return parsedData;
        }
      } catch (error) {
        // If not JSON, try to extract structured data from text
        console.log('Response is not JSON, attempting to parse text response');
      }
  
      // If the response is not structured JSON, create a basic result
      // This is a fallback - ideally the agent should return structured data
      const fallbackResult = [{
        name: 'Search completed',
        place_id: 'fallback_id',
        rating: undefined,
        address: undefined,
        phone: undefined,
        website: undefined,
        reviews: undefined,
      }];
  
      return fallbackResult;
  },
});

export const leadFinderWorkflow = createWorkflow({
  id: 'lead-finder-workflow',
  inputSchema: searchQuerySchema,
  outputSchema: searchResultSchema,
})
  .then(searchStep);

leadFinderWorkflow.commit(); 