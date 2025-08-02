import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface SearchResult {
  name: string;
  place_id: string;
}

interface PlaceDetails {
  rating?: number;
  address?: string;
  phone?: string;
  website?: string;
  reviews?: any[];
  name: string;
  place_id: string;
}

export const googleSearchTool = createTool({
  id: 'google-search',
  description: 'Search for information on the web using Google Search',
  inputSchema: z.object({
    query: z.string().describe('Search query to find information'),
  }),
  outputSchema: z.array(
    z.object({
        rating: z.number().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        website: z.string().optional(),
        reviews: z.array(z.any()).optional(),
        name: z.string(),
        place_id: z.string(),
      })
  ),
  execute: async ({ context }) => {
    return await performGoogleSearch(context.query);
  },
});

const performGoogleSearch = async (query: string) => {
  const results: SearchResult[] = [];
  const apiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    data.results.filter((result: any) => result.place_id !== undefined && result.business_status === "OPERATIONAL").forEach((result: any) => {
        results.push({
            name: result.name,
            place_id: result.place_id,
        })
    });
  } catch (error) {
    console.error('Error fetching Google search results:', error);
    throw new Error('Failed to fetch Google search results');
  }


  console.log("The search results are", results);
  const placeDetailsPromises = results.map(async (result: SearchResult) => {
    const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${result.place_id}&`+
    `fields=place_id,name,formatted_address,international_phone_number,website,rating,reviews&`+
    `key=${process.env.GOOGLE_MAPS_API_KEY}`;
    try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data;
    } catch (error) {
        console.error('Error fetching Google search results:', error);
        throw new Error('Failed to fetch Google search results');
    }
  });
  const placeDetailsResults = await Promise.all(placeDetailsPromises);
  const placeDetails: PlaceDetails[] = [];
  
  placeDetailsResults.forEach((result: any) => {
    const placeDetail = result.result;
    placeDetails.push({
      place_id: placeDetail.place_id,
      name: placeDetail.name,
      rating: placeDetail.rating,
      address: placeDetail.formatted_address,
      phone: placeDetail.formatted_phone_number,
      website: placeDetail.website,
      reviews: placeDetail.reviews
    });
  });

  return placeDetails;
};