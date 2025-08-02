import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const websiteUrlSchema = z.object({
  url: z.string().describe('The website URL to enrich with contact information'),
});

const enrichedLeadSchema = z.object({
  website: z.string(),
  title: z.string(),
  emails: z.array(z.string()),
  phoneNumbers: z.array(z.string()),
  socialLinks: z.array(z.string()),
  contactInfo: z.object({
    address: z.string().optional(),
    hours: z.string().optional(),
    description: z.string().optional(),
  }),
  analysis: z.object({
    contactQuality: z.string(),
    businessType: z.string().optional(),
    potentialValue: z.string().optional(),
    recommendations: z.array(z.string()),
  }),
});

const enrichLeadStep = createStep({
  id: 'enrich-lead',
  description: 'Enriches lead information by scraping the website and extracting contact details',
  inputSchema: websiteUrlSchema,
  outputSchema: enrichedLeadSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const agent = mastra?.getAgent('leadEnricherAgent');
    if (!agent) {
      throw new Error('Lead enricher agent not found');
    }

    const prompt = `Please enrich the lead information for this website: "${inputData.url}"
    
    Please:
    1. Scrape the website to extract all available contact information from the main page
    2. If no emails are found, the tool will automatically search for and scrape contact pages
    3. Identify and validate email addresses and phone numbers from both main page and contact pages
    4. Extract business details like address, hours, and description
    5. Find social media links and other contact methods
    6. Analyze the quality and potential value of the contact information
    7. Report on the contact page discovery process and its effectiveness
    8. Provide recommendations for follow-up actions
    
    IMPORTANT: Return your response as ONLY valid JSON in this exact format:
    {
      "title": "Business Title",
      "emails": ["email1@example.com", "email2@example.com"],
      "phoneNumbers": ["+1234567890", "+0987654321"],
      "socialLinks": ["https://facebook.com/business", "https://twitter.com/business"],
      "contactInfo": {
        "address": "Full address if found",
        "hours": "Business hours if found",
        "description": "Business description if found"
      },
      "analysis": {
        "contactQuality": "High|Medium|Low",
        "businessType": "Type of business",
        "potentialValue": "Assessment of lead value",
        "recommendations": ["recommendation1", "recommendation2"]
      }
    }
    
    Do not include any explanatory text, markdown, or headers. Return ONLY the JSON object.`;

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
      let parsedData = null;
      try {
        parsedData = JSON.parse(resultText);
      } catch (directParseError) {
        // If direct parsing fails, try to extract JSON from text
        console.log('Direct JSON parsing failed, attempting to extract JSON...');
        
        // Remove markdown headers and formatting
        let cleanText = resultText.replace(/^#+\s*.*$/gm, ''); // Remove markdown headers
        cleanText = cleanText.replace(/```json\s*/g, ''); // Remove code block markers
        cleanText = cleanText.replace(/```\s*/g, ''); // Remove code block markers
        cleanText = cleanText.replace(/^\s*[\r\n]/gm, ''); // Remove empty lines
        cleanText = cleanText.trim();
        
        // Try to find JSON object in the cleaned text
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          // Try to extract data using regex patterns
          console.log('No JSON found, attempting to extract data from text...');
          
          const emailMatches = resultText.match(/[\w\.-]+@[\w\.-]+\.\w+/g) || [];
          const phoneMatches = resultText.match(/[\+]?[1-9]?[\d\s\-\(\)]{10,}/g) || [];
          const urlMatches = resultText.match(/(https?:\/\/[^\s]+)/g) || [];
          
          parsedData = {
            title: 'Website Analysis',
            emails: emailMatches,
            phoneNumbers: phoneMatches,
            socialLinks: urlMatches.filter(url => 
              url.includes('facebook.com') || url.includes('twitter.com') || 
              url.includes('linkedin.com') || url.includes('instagram.com')
            ),
            contactInfo: {},
            analysis: {
              contactQuality: emailMatches.length > 0 ? 'Medium' : 'Low',
              businessType: 'Unknown',
              potentialValue: 'Unknown',
              recommendations: ['Manual review of extracted data recommended'],
            },
          };
        }
      }
      
      if (parsedData && typeof parsedData === 'object') {
        return {
          website: inputData.url,
          title: parsedData.title || 'Unknown',
          emails: Array.isArray(parsedData.emails) ? parsedData.emails : [],
          phoneNumbers: Array.isArray(parsedData.phoneNumbers) ? parsedData.phoneNumbers : [],
          socialLinks: Array.isArray(parsedData.socialLinks) ? parsedData.socialLinks : [],
          contactInfo: parsedData.contactInfo || {},
          analysis: parsedData.analysis || {
            contactQuality: 'Unknown',
            businessType: 'Unknown',
            potentialValue: 'Unknown',
            recommendations: [],
          },
        };
      }
    } catch (error) {
      console.log('Failed to parse enrichment response:', error);
    }

    // If all parsing attempts fail, create a basic result
    const fallbackResult = {
      website: inputData.url,
      title: 'Website Analysis Completed',
      emails: [],
      phoneNumbers: [],
      socialLinks: [],
      contactInfo: {},
      analysis: {
        contactQuality: 'Analysis completed',
        businessType: 'Unknown',
        potentialValue: 'Unknown',
        recommendations: ['Review the agent response for detailed information'],
      },
    };

    return fallbackResult;
  },
});

export const leadEnricherWorkflow = createWorkflow({
  id: 'lead-enricher-workflow',
  inputSchema: websiteUrlSchema,
  outputSchema: enrichedLeadSchema,
})
  .then(enrichLeadStep);

leadEnricherWorkflow.commit(); 