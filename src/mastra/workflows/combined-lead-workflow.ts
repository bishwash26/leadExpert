import { openai } from '@ai-sdk/openai';
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
const model = openai('gpt-4o-mini');

const generateEmail = async (lead: any, productInfo: any) => {
  try {
    // Extract bad reviews for analysis
    const badReviews = lead.originalData.reviews 
      ? lead.originalData.reviews
          .filter((review: any) => review.rating && review.rating < 3)
          .map((review: any) => review.text || review.comment || 'Poor experience')
          .slice(0, 3)
      : [];

    // Create a comprehensive prompt for email generation
    const emailPrompt = `Generate a professional marketing email for this restaurant business.

Business Details:
- Name: ${lead.originalData.name}
- Website: ${lead.originalData.website || 'N/A'}
- Location: ${lead.originalData.address || 'Not specified'}
- Rating: ${lead.originalData.rating || 'Not available'}
- Contact Info Available: ${lead.enrichmentSuccess ? 'Yes' : 'No'}

${badReviews.length > 0 ? 
  `Customer Feedback Issues:\n${badReviews.map((review, i) => `${i + 1}. ${review}`).join('\n')}` :
  'No specific customer feedback available. Focus on general restaurant challenges.'
}

Product Offering:
- Description: ${productInfo.productDescription || 'Our restaurant management solution'}
- Key Features: ${(productInfo.productFeatures || ['Customer experience improvement', 'Business process optimization']).join(', ')}
- Target Audience: ${productInfo.targetAudience || 'restaurant owners'}

Sender Info:
- Name: ${productInfo.senderName || 'Sales Team'}
- Company: ${productInfo.senderCompany || 'Your Company'}

Requirements:
1. Write a compelling but professional marketing email
2. Address specific issues from reviews if available
3. Explain how your product features solve their problems
4. Make it personalized to their business
5. Include a clear call-to-action
6. Keep it under 200 words
7. Sound helpful, not pushy

Return ONLY valid JSON in this format:
{
  "emailSubject": "Compelling subject line",
  "emailBody": "Professional email content with proper formatting",
  "keyProblems": ["problem1", "problem2"],
  "solutionPoints": ["how feature1 helps", "how feature2 helps"],
  "callToAction": "Clear call to action"
}`;

    const response = await model.doGenerate({
      inputFormat: 'prompt',
      prompt: [{
        role: 'user',
        content: [{
          type: 'text',
          text: emailPrompt,
        }],
      }],
      maxTokens: 1000,
      temperature: 0.7,
      mode: {
        type: 'regular',
        tools: [],
      },
    });

    // Parse the response
    let emailData = null;
    try {
      emailData = JSON.parse(response?.text || '');
    } catch (parseError) {
      // Try to extract JSON from text
      console.error('Error parsing email data:', parseError);
      return '';
    }

    if (emailData && typeof emailData === 'object') {
      return {
        emailSubject: emailData.emailSubject || `Partnership Opportunity for ${lead.originalData.name}`,
        emailBody: emailData.emailBody || 'Email content could not be generated',
        keyProblems: Array.isArray(emailData.keyProblems) ? emailData.keyProblems : [],
        solutionPoints: Array.isArray(emailData.solutionPoints) ? emailData.solutionPoints : [],
        callToAction: emailData.callToAction || 'Contact us for more information',
      };
    } else {
      // Fallback email if parsing fails
      return {
        emailSubject: `Help ${lead.originalData.name} Improve Customer Experience`,
        emailBody: `Dear ${lead.originalData.name} Team,

I hope this message finds you well. My name is ${productInfo.senderName || 'Sales Team'} from ${productInfo.senderCompany || 'Your Company'}.

I've been researching successful restaurants in your area and came across ${lead.originalData.name}. As someone who works with ${productInfo.targetAudience || 'restaurant owners'} regularly, I understand the challenges of running a restaurant in today's competitive market.

We specialize in helping restaurants like yours with:
${(productInfo.productFeatures || ['Customer experience improvement', 'Business process optimization']).map(feature => `• ${feature}`).join('\n')}

Our ${productInfo.productDescription || 'restaurant management solution'} has helped numerous restaurants improve their operations and customer satisfaction.

I'd love to share some insights about how we've helped similar businesses in your area. Would you be interested in a brief 15-minute conversation to explore how we might be able to support ${lead.originalData.name}'s continued success?

Best regards,
${productInfo.senderName || 'Sales Team'}
${productInfo.senderCompany || 'Your Company'}`,
        keyProblems: ['General business challenges', 'Competitive market pressures'],
        solutionPoints: productInfo.productFeatures || ['Customer experience improvement', 'Business process optimization'],
        callToAction: 'Schedule a brief 15-minute conversation to explore partnership opportunities',
      };
    }
  } catch (error) {
    console.error(`Error generating email for ${lead.originalData.name}:`, error);
    // Return fallback email
    return {
      emailSubject: `Partnership Opportunity for ${lead.originalData.name}`,
      emailBody: `Dear ${lead.originalData.name} Team,

I hope this message finds you well. I'm reaching out from ${productInfo.senderCompany || 'Your Company'} to discuss how we can help ${lead.originalData.name} improve its business operations.

We specialize in ${productInfo.productDescription || 'restaurant management solutions'} and would love to share how we've helped similar businesses in your area.

Best regards,
${productInfo.senderName || 'Sales Team'}`,
      keyProblems: ['Business improvement opportunities'],
      solutionPoints: productInfo.productFeatures || ['Business optimization'],
      callToAction: 'Contact us to learn more',
    };
  }
};

const searchQuerySchema = z.object({
  query: z.string().describe('The search query to find leads (e.g., "restaurants in New York")'),
  maxLeads: z.number().optional().describe('Maximum number of leads to enrich (default: 5)'),
  // Email generation parameters
  generateEmails: z.boolean().optional().describe('Whether to generate customized emails (default: false)'),
  productDescription: z.string().optional().describe('Description of your product/service for email generation'),
  productFeatures: z.array(z.string()).optional().describe('Key features of your product for email generation'),
  targetAudience: z.string().optional().describe('Target audience for your product for email generation'),
  senderName: z.string().optional().describe('Name of the person sending emails'),
  senderCompany: z.string().optional().describe('Company name of the sender'),
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

const emailDataSchema = z.object({
  emailSubject: z.string(),
  emailBody: z.string(),
  keyProblems: z.array(z.string()),
  solutionPoints: z.array(z.string()),
  callToAction: z.string(),
});

const leadWithEmailSchema = z.object({
  originalData: z.object({
    name: z.string(),
    rating: z.number().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    website: z.string().optional(),
    place_id: z.string(),
    reviews: z.array(z.any()).optional(),
  }),
  enrichedData: enrichedLeadSchema.optional(),
  enrichmentSuccess: z.boolean(),
  enrichmentError: z.string().optional(),
  emailData: emailDataSchema.optional(),
  emailGenerated: z.boolean().optional(),
  emailError: z.string().optional(),
});

const combinedResultSchema = z.object({
  searchQuery: z.string(),
  totalLeadsFound: z.number(),
  leadsEnriched: z.number(),
  enrichedLeads: z.array(leadWithEmailSchema),
  summary: z.object({
    totalEmailsFound: z.number(),
    totalPhoneNumbersFound: z.number(),
    totalSocialLinksFound: z.number(),
    averageContactQuality: z.string(),
    topRecommendations: z.array(z.string()),
  }),
});

// Step 1: Find leads
const findLeadsStep = createStep({
  id: 'find-leads',
  description: 'Finds leads using the lead finder agent',
  inputSchema: searchQuerySchema,
  outputSchema: z.object({
    searchQuery: z.string(),
    leads: searchResultSchema,
    totalLeadsFound: z.number(),
    originalInput: searchQuerySchema,
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const leadFinderAgent = mastra?.getAgent('leadFinderAgent');
    if (!leadFinderAgent) {
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

    const response = await leadFinderAgent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let resultText = '';
    for await (const chunk of response.textStream) {
      resultText += chunk;
    }

    console.log("Lead finder response:", resultText);
    
    // Parse the resultText to extract leads
    let leads: any[] = [];
    try {
      // Try to parse the response as JSON first
      leads = JSON.parse(resultText);
    } catch (directParseError) {
      console.log('Direct JSON parsing failed, attempting to extract JSON...');
      
      // Remove markdown formatting and try to extract JSON
      let cleanText = resultText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      // Try to find JSON array in the cleaned text
      const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          leads = JSON.parse(jsonMatch[0]);
        } catch (extractParseError) {
          console.log('JSON extraction failed, using regex fallback...');
          
          // Fallback: extract business names and try to construct basic objects
          const businessMatches = resultText.match(/"name":\s*"([^"]+)"/g);
          const websiteMatches = resultText.match(/"website":\s*"([^"]+)"/g);
          
          if (businessMatches) {
            leads = businessMatches.map((match, index) => {
              const name = match.match(/"name":\s*"([^"]+)"/)?.[1] || 'Unknown Business';
              const website = websiteMatches?.[index]?.match(/"website":\s*"([^"]+)"/)?.[1];
              
              return {
                name,
                place_id: `placeholder_${index}`,
                rating: undefined,
                address: undefined,
                phone: undefined,
                website,
                reviews: undefined,
              };
            });
          }
        }
      }
    }

    if (!Array.isArray(leads) || leads.length === 0) {
      leads = [{
        name: 'No leads found',
        place_id: 'none',
        rating: undefined,
        address: undefined,
        phone: undefined,
        website: undefined,
        reviews: undefined,
      }];
    }

    return {
      searchQuery: inputData.query,
      leads,
      totalLeadsFound: leads.length,
      originalInput: inputData,
    };
  },
});

// Step 2: Enrich leads
const enrichLeadsStep = createStep({
  id: 'enrich-leads',
  description: 'Enriches leads with contact information by scraping their websites',
  inputSchema: z.object({
    searchQuery: z.string(),
    leads: searchResultSchema,
    totalLeadsFound: z.number(),
    originalInput: searchQuerySchema,
  }),
  outputSchema: z.object({
    searchQuery: z.string(),
    totalLeadsFound: z.number(),
    leadsEnriched: z.number(),
    enrichedLeads: z.array(z.object({
      originalData: z.object({
        name: z.string(),
        rating: z.number().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        website: z.string().optional(),
        place_id: z.string(),
        reviews: z.array(z.any()).optional(),
      }),
      enrichedData: enrichedLeadSchema.optional(),
      enrichmentSuccess: z.boolean(),
      enrichmentError: z.string().optional(),
    })),
    originalInput: searchQuerySchema,
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const leadEnricherAgent = mastra?.getAgent('leadEnricherAgent');
    if (!leadEnricherAgent) {
      throw new Error('Lead enricher agent not found');
    }

    const maxLeads = inputData.originalInput.maxLeads || 5;
    const leadsToEnrich = inputData.leads.slice(0, maxLeads);
    const enrichedLeads: any[] = [];

    console.log(`Starting enrichment for ${leadsToEnrich.length} leads...`);

    for (const lead of leadsToEnrich) {
      console.log(`Enriching lead: ${lead.name}`);
      
      try {
        if (!lead.website) {
          console.log(`No website found for ${lead.name}, skipping...`);
          enrichedLeads.push({
            originalData: lead,
            enrichedData: undefined,
            enrichmentSuccess: false,
            enrichmentError: 'No website available',
          });
          continue;
        }

        const enrichPrompt = `Please enrich the lead information for this business: "${lead.name}"
        Website: ${lead.website}
        
        Please use the web scraper tool to extract contact information from this website.
        
        IMPORTANT: Return your response as ONLY valid JSON in this exact format:
        {
          "website": "${lead.website}",
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

        const enrichResponse = await leadEnricherAgent.stream([
          {
            role: 'user',
            content: enrichPrompt,
          },
        ]);

        let enrichResultText = '';
        for await (const chunk of enrichResponse.textStream) {
          enrichResultText += chunk;
        }

        console.log(`Enrichment response for ${lead.name}:`, enrichResultText);

        // Parse the enrichment result
        try {
          let enrichedData = null;
          try {
            enrichedData = JSON.parse(enrichResultText);
          } catch (directParseError) {
            // Try to extract JSON from text
            let cleanText = enrichResultText.replace(/^#+\s*.*$/gm, ''); // Remove markdown headers
            cleanText = cleanText.replace(/```json\s*/g, ''); // Remove code block markers
            cleanText = cleanText.replace(/```\s*/g, ''); // Remove code block markers
            cleanText = cleanText.replace(/^\s*[\r\n]/gm, ''); // Remove empty lines
            cleanText = cleanText.trim();
            
            const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              enrichedData = JSON.parse(jsonMatch[0]);
            }
          }

          if (enrichedData && typeof enrichedData === 'object') {
            enrichedLeads.push({
              originalData: lead,
              enrichedData: {
                website: enrichedData.website || lead.website,
                title: enrichedData.title || lead.name,
                emails: Array.isArray(enrichedData.emails) ? enrichedData.emails : [],
                phoneNumbers: Array.isArray(enrichedData.phoneNumbers) ? enrichedData.phoneNumbers : [],
                socialLinks: Array.isArray(enrichedData.socialLinks) ? enrichedData.socialLinks : [],
                contactInfo: {
                  address: enrichedData.contactInfo?.address || '',
                  hours: enrichedData.contactInfo?.hours || '',
                  description: enrichedData.contactInfo?.description || '',
                },
                analysis: {
                  contactQuality: enrichedData.analysis?.contactQuality || 'Unknown',
                  businessType: enrichedData.analysis?.businessType || '',
                  potentialValue: enrichedData.analysis?.potentialValue || '',
                  recommendations: Array.isArray(enrichedData.analysis?.recommendations) ? enrichedData.analysis.recommendations : [],
                },
              },
              enrichmentSuccess: true,
              enrichmentError: undefined,
            });
            
            console.log(`✅ Successfully enriched ${lead.name} with ${enrichedData.emails?.length || 0} emails, ${enrichedData.phoneNumbers?.length || 0} phones`);
          } else {
            throw new Error('Invalid response format after parsing attempts');
          }
        } catch (error) {
          console.log(`Failed to parse enrichment data for ${lead.name}:`, error);
          enrichedLeads.push({
            originalData: lead,
            enrichedData: undefined,
            enrichmentSuccess: false,
            enrichmentError: `Failed to parse enrichment data: ${error instanceof Error ? error.message : 'Unknown error'}`,
          });
        }

        // Add a small delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error enriching lead ${lead.name}:`, error);
        enrichedLeads.push({
          originalData: lead,
          enrichedData: undefined,
          enrichmentSuccess: false,
          enrichmentError: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      searchQuery: inputData.searchQuery,
      totalLeadsFound: inputData.totalLeadsFound,
      leadsEnriched: enrichedLeads.filter(lead => lead.enrichmentSuccess).length,
      enrichedLeads,
      originalInput: inputData.originalInput,
    };
  },
});

// Step 3: Generate emails 
const generateEmailsStep = createStep({
  id: 'generate-emails',
  description: 'Generates customized emails for enriched leads based on reviews and product features',
  inputSchema: z.object({
    searchQuery: z.string(),
    totalLeadsFound: z.number(),
    leadsEnriched: z.number(),
    enrichedLeads: z.array(z.object({
      originalData: z.object({
        name: z.string(),
        rating: z.number().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        website: z.string().optional(),
        place_id: z.string(),
        reviews: z.array(z.any()).optional(),
      }),
      enrichedData: enrichedLeadSchema.optional(),
      enrichmentSuccess: z.boolean(),
      enrichmentError: z.string().optional(),
    })),
    originalInput: searchQuerySchema,
  }),
  outputSchema: combinedResultSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const leadsWithEmails: any[] = [];

    console.log(`�� DEBUG: Total leads to process = ${inputData.enrichedLeads.length}`);
    console.log(`📧 Generating emails for ${inputData.enrichedLeads.length} leads...`);

      for (const lead of inputData.enrichedLeads) {
        console.log(`\n🔍 DEBUG: Processing lead "${lead.originalData.name}"`);
        
        let emailData = undefined;
        let emailGenerated = false;
        let emailError = undefined;

        try {
          console.log(`Generating email for ${lead.originalData.name}...`);
          
          // Generate email using our custom function
          emailData = await generateEmail(lead, inputData.originalInput);
          emailGenerated = true;
          console.log(`✅ Successfully generated email for ${lead.originalData.name}`);
          
        } catch (emailGenerationError) {
          console.log(`Failed to generate email for ${lead.originalData.name}:`, emailGenerationError);
          emailError = emailGenerationError instanceof Error ? emailGenerationError.message : 'Unknown email generation error';
        }

        leadsWithEmails.push({
          ...lead,
          emailData,
          emailGenerated,
          emailError,
        });

        // Add a small delay between email generation requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }

    // Calculate summary statistics
    const successfulEnrichments = leadsWithEmails.filter(lead => lead.enrichmentSuccess);
    const allEmails = successfulEnrichments.flatMap(lead => lead.enrichedData?.emails || []);
    const allPhones = successfulEnrichments.flatMap(lead => lead.enrichedData?.phoneNumbers || []);
    const allSocialLinks = successfulEnrichments.flatMap(lead => lead.enrichedData?.socialLinks || []);
    
    // Calculate average contact quality
    const qualityScores = successfulEnrichments
      .map(lead => lead.enrichedData?.analysis?.contactQuality)
      .filter(quality => quality);
    
    const averageQuality = qualityScores.length > 0 
      ? qualityScores.reduce((acc, quality) => {
          if (quality === 'High') return acc + 3;
          if (quality === 'Medium') return acc + 2;
          if (quality === 'Low') return acc + 1;
          return acc;
        }, 0) / qualityScores.length 
      : 0;
    
    const averageContactQuality = averageQuality >= 2.5 ? 'High' : averageQuality >= 1.5 ? 'Medium' : 'Low';
    
    // Get top recommendations
    const allRecommendations = successfulEnrichments
      .flatMap(lead => lead.enrichedData?.analysis?.recommendations || []);
    const uniqueRecommendations = [...new Set(allRecommendations)];
    const topRecommendations = uniqueRecommendations.slice(0, 5);

    return {
      searchQuery: inputData.searchQuery,
      totalLeadsFound: inputData.totalLeadsFound,
      leadsEnriched: inputData.leadsEnriched,
      enrichedLeads: leadsWithEmails,
      summary: {
        totalEmailsFound: allEmails.length,
        totalPhoneNumbersFound: allPhones.length,
        totalSocialLinksFound: allSocialLinks.length,
        averageContactQuality,
        topRecommendations,
      },
    };
  },
});

export const combinedLeadWorkflow = createWorkflow({
  id: 'combined-lead-workflow',
  inputSchema: searchQuerySchema,
  outputSchema: combinedResultSchema,
})
  .then(findLeadsStep)
  .then(enrichLeadsStep)
  .then(generateEmailsStep);

combinedLeadWorkflow.commit();