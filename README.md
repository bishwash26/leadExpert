# Lead Expert - Lead Finder Agent

This project contains a lead finder agent built with Mastra that helps you find information about businesses, services, and locations using Google search capabilities.

## Features

The Lead Finder Agent can help you with:

- **Business Discovery**: Find businesses and services in specific locations
- **Contact Information**: Get phone numbers, addresses, and contact details
- **Reviews & Ratings**: Access customer reviews and ratings
- **Operating Hours**: Find business hours and availability
- **Special Offers**: Discover promotions and deals

## Example Queries

You can ask the agent questions like:

- "Find me all Cafes in gurugram"
- "What are the best restaurants in Mumbai?"
- "Show me hotels near Delhi airport"
- "Find coffee shops with good WiFi in Bangalore"
- "What are the top-rated spas in Pune?"

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up your environment variables (optional):
```bash
# For real Google search integration
GOOGLE_SEARCH_API_KEY=your_api_key
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your_search_engine_id
```

3. Run the development server:
```bash
npm run dev
```

## Usage

### Using the Agent Directly

You can interact with the lead finder agent directly:

```typescript
import { leadFinderAgent } from './src/mastra/agents/lead-finder-agent';

const response = await leadFinderAgent.stream([
  {
    role: 'user',
    content: 'Find me all Cafes in gurugram'
  }
]);

for await (const chunk of response.textStream) {
  console.log(chunk);
}
```

### Using the Workflow

You can also use the lead finder workflow for structured responses:

```typescript
import { leadFinderWorkflow } from './src/mastra/workflows/lead-finder-workflow';

const result = await leadFinderWorkflow.execute({
  query: 'Find me all Cafes in gurugram'
});

console.log(result);
```

## Google Search Integration

The current implementation includes a mock Google search tool. To enable real Google search:

1. Set up Google Custom Search API:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Custom Search API
   - Create API credentials
   - Set up a Custom Search Engine at [programmablesearchengine.google.com](https://programmablesearchengine.google.com/)

2. Update the `google-search-tool.ts` file with your API credentials and replace the mock implementation with real API calls.

## Project Structure

```
leadExpert/
├── src/mastra/
│   ├── agents/
│   │   ├── lead-finder-agent.ts    # Main lead finder agent
│   │   └── weather-agent.ts        # Weather agent (example)
│   ├── tools/
│   │   ├── google-search-tool.ts   # Google search tool
│   │   └── weather-tool.ts         # Weather tool (example)
│   ├── workflows/
│   │   ├── lead-finder-workflow.ts # Lead finder workflow
│   │   └── weather-workflow.ts     # Weather workflow (example)
│   └── index.ts                    # Main Mastra configuration
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build the project
- `npm run start` - Start production server

## Notes

- The current Google search tool uses mock data for demonstration
- To get real search results, you'll need to implement Google Custom Search API
- The agent includes memory capabilities to remember previous conversations
- All responses are formatted for easy reading and action-taking 