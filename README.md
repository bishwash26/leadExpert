# LeadCraft - Lead Generation and Enrichment System

A comprehensive lead generation and enrichment system built with Mastra.ai that can find leads and extract contact information from websites.

## Features

### Lead Finder Agent
- Searches for businesses and services using Google Places API
- Extracts contact information, ratings, and business details
- Provides comprehensive search results with actionable insights

### Lead Enricher Agent
- **Intelligent Website Scraping**: Automatically scrapes websites and intelligently navigates to contact pages when needed
- **Contact Page Discovery**: Automatically finds and scrapes contact pages when no emails are found on the main page
- **Email Extraction**: Finds and validates email addresses from website content
- **Phone Number Detection**: Identifies phone numbers in various formats (US and international)
- **Social Media Links**: Discovers social media profiles and contact links
- **Business Information**: Extracts addresses, business hours, and descriptions
- **Quality Analysis**: Analyzes the quality and potential value of contact information

### Email Writer Agent
- **Review Analysis**: Analyzes bad reviews to identify specific business problems
- **Problem Mapping**: Maps product features to solutions for identified issues
- **Customized Email Generation**: Creates personalized outreach emails for each business
- **Professional Formatting**: Generates well-structured, business-appropriate emails
- **Solution-Focused Content**: Emphasizes how product features solve specific problems
- **Call-to-Action Generation**: Creates compelling CTAs tailored to each business

## Components

### Agents
- `leadFinderAgent`: Searches for leads using Google Places API
- `leadEnricherAgent`: Enriches leads by scraping websites and extracting contact details
- `emailWriterAgent`: Analyzes reviews and generates customized outreach emails

### Workflows
- `leadFinderWorkflow`: Orchestrates the lead finding process
- `leadEnricherWorkflow`: Manages the lead enrichment process
- `emailWriterWorkflow`: Generates customized emails based on business reviews and product features
- `combinedLeadWorkflow`: Complete pipeline that finds leads, enriches them, and generates emails automatically

### Tools
- `googleSearchTool`: Searches for business information using Google Places API
- `webScraperTool`: Scrapes websites to extract contact information
- `emailWriterTool`: Analyzes reviews and generates customized business emails

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Required for Google Places API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## Usage

### Lead Enrichment Example

```typescript
import { mastra } from './src/mastra';

// Enrich a lead by scraping their website
const result = await mastra.executeWorkflow('lead-enricher-workflow', {
  url: 'https://example-business.com'
});

console.log('Emails found:', result.emails);
console.log('Phone numbers:', result.phoneNumbers);
console.log('Social links:', result.socialLinks);
```

### Combined Lead Generation, Enrichment & Email Creation Example

```typescript
import { mastra } from './src/mastra';

// Find leads, enrich them, and generate customized emails automatically
const result = await mastra.executeWorkflow('combined-lead-workflow', {
  query: 'restaurants in New York',
  maxLeads: 5,
  generateEmails: true, // Enable email generation
  productDescription: 'Restaurant management software that improves customer experience',
  productFeatures: ['Order tracking', 'Staff training', 'Customer feedback system'],
  targetAudience: 'restaurant owners',
  senderName: 'John Smith',
  senderCompany: 'RestaurantPro'
});

console.log('Total emails found:', result.summary.totalEmailsFound);
console.log('Total phone numbers:', result.summary.totalPhoneNumbersFound);
console.log('Enriched leads:', result.enrichedLeads);

// Access generated emails
result.enrichedLeads.forEach(lead => {
  if (lead.emailGenerated && lead.emailData) {
    console.log(`Email for ${lead.originalData.name}:`);
    console.log(`Subject: ${lead.emailData.emailSubject}`);
    console.log(`Body: ${lead.emailData.emailBody}`);
  }
});
```

### Email Generation Only Example

```typescript
import { mastra } from './src/mastra';

// Generate a customized email for a specific business
const emailResult = await mastra.executeWorkflow('email-writer-workflow', {
  businessName: 'Mario\'s Pizza',
  businessType: 'restaurant',
  badReviews: ['Slow service', 'Cold food', 'Rude staff'],
  productDescription: 'Restaurant management software',
  productFeatures: ['Real-time order tracking', 'Staff training modules'],
  targetAudience: 'restaurant owners',
  senderName: 'Sarah Johnson',
  senderCompany: 'RestaurantPro'
});

console.log('Generated email:', emailResult.emailBody);
```

### Individual Workflow Examples

```typescript
// Lead Finding Only
const leads = await mastra.executeWorkflow('lead-finder-workflow', {
  query: 'restaurants in New York'
});

// Lead Enrichment Only
const enriched = await mastra.executeWorkflow('lead-enricher-workflow', {
  url: 'https://example-business.com'
});
```

## Running Examples

### Combined Workflow Example
```bash
npx tsx src/example-combined-workflow.ts
```

### Email Generation Example
```bash
npx tsx src/example-email-generation.ts
```

### Lead Enricher Example
```bash
npx tsx src/example-lead-enricher.ts
```

## API Reference

### Combined Lead Workflow

**Input Schema:**
```typescript
{
  query: string, // The search query to find leads
  maxLeads?: number // Optional: maximum number of leads to enrich (default: 5)
}
```

**Output Schema:**
```typescript
{
  searchQuery: string,
  totalLeadsFound: number,
  leadsEnriched: number,
  enrichedLeads: Array<{
    originalData: {
      name: string,
      rating?: number,
      address?: string,
      phone?: string,
      website?: string,
      place_id: string
    },
    enrichedData?: {
      website: string,
      title: string,
      emails: string[],
      phoneNumbers: string[],
      socialLinks: string[],
      contactInfo: {
        address?: string,
        hours?: string,
        description?: string
      },
      analysis: {
        contactQuality: string,
        businessType?: string,
        potentialValue?: string,
        recommendations: string[]
      }
    },
    enrichmentSuccess: boolean,
    enrichmentError?: string
  }>,
  summary: {
    totalEmailsFound: number,
    totalPhoneNumbersFound: number,
    totalSocialLinksFound: number,
    averageContactQuality: string,
    topRecommendations: string[]
  }
}
```

### Lead Enricher Workflow

**Input Schema:**
```typescript
{
  url: string // The website URL to enrich
}
```

**Output Schema:**
```typescript
{
  website: string,
  title: string,
  emails: string[],
  phoneNumbers: string[],
  socialLinks: string[],
  contactInfo: {
    address?: string,
    hours?: string,
    description?: string
  },
  analysis: {
    contactQuality: string,
    businessType?: string,
    potentialValue?: string,
    recommendations: string[]
  }
}
```

### Lead Finder Workflow

**Input Schema:**
```typescript
{
  query: string // The search query to find information about
}
```

**Output Schema:**
```typescript
Array<{
  rating?: number,
  address?: string,
  phone?: string,
  website?: string,
  reviews?: any[],
  name: string,
  place_id: string
}>
```

## Features

### Web Scraping Capabilities
- **Intelligent Navigation**: Automatically discovers and scrapes contact pages when needed
- **Contact Page Detection**: Searches for contact page links and common contact URLs
- **Email Detection**: Uses regex patterns to find email addresses
- **Phone Number Recognition**: Supports multiple formats (US and international)
- **Social Media Discovery**: Finds links to major social platforms
- **Content Extraction**: Extracts business descriptions and contact details
- **Quality Filtering**: Filters out common false positives
- **Multi-Page Scraping**: Combines results from main page and contact pages

### Contact Information Extraction
- Email addresses with validation
- Phone numbers in various formats
- Social media links
- Business addresses
- Operating hours
- Company descriptions

### Analysis and Insights
- Contact quality assessment
- Business type identification
- Potential value estimation
- Actionable recommendations

## Configuration

The system uses LibSQL for storage and includes memory capabilities for conversation history. The database file is stored at `../mastra.db` by default.

## Error Handling

The system includes comprehensive error handling for:
- Network failures during web scraping
- Invalid URLs
- Missing or malformed data
- API rate limiting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License 