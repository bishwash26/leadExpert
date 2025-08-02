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
    
    Please:
    1. Use the Google search tool to find relevant businesses
    2. Return the search results in valid JSON format as an array of objects
    3. Each object should have: name, place_id, rating, address, phone, website, reviews
    
    IMPORTANT: Your response must be ONLY valid JSON in this exact format:
    [
      {
        "name": "Business Name",
        "place_id": "place_id_here",
        "rating": 4.5,
        "address": "Full address",
        "phone": "+1234567890",
        "website": "https://website.com",
        "reviews": []
      }
    ]
    
    Do not include any explanatory text, only return the JSON array.`;

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
    try {
      // Try to parse the response as JSON first
      let jsonData = null;
      try {
        jsonData = JSON.parse(resultText);
      } catch (directParseError) {
        // If direct parsing fails, try to extract JSON from text
        const jsonMatch = resultText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          jsonData = JSON.parse(jsonMatch[0]);
        }
      }
      
      if (Array.isArray(jsonData)) {
        return jsonData;
      } else if (jsonData && typeof jsonData === 'object') {
        // If it's a single object, wrap it in an array
        return [jsonData];
      }
    } catch (error) {
      console.log('Response is not valid JSON, attempting fallback parsing...');
      
      // Try to extract lead information from text using regex patterns
      const businessMatches = resultText.match(/(?:name|business):\s*["']([^"']+)["']/gi);
      const websiteMatches = resultText.match(/(?:website|url):\s*["']([^"']+)["']/gi);
      
      if (businessMatches && businessMatches.length > 0) {
        console.log('Attempting to extract lead data from text...');
        return businessMatches.map((match, index) => {
          const name = match.replace(/(?:name|business):\s*["']/i, '').replace(/["']$/, '');
          const website = websiteMatches && websiteMatches[index] 
            ? websiteMatches[index].replace(/(?:website|url):\s*["']/i, '').replace(/["']$/, '')
            : undefined;
          
          return {
            name: name,
            place_id: `extracted_${index}`,
            rating: undefined,
            address: undefined,
            phone: undefined,
            website: website,
            reviews: undefined,
          };
        });
      }
    }

    // Fallback result
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