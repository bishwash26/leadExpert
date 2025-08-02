import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const emailInputSchema = z.object({
  businessName: z.string().describe('Name of the business to write email to'),
  businessType: z.string().describe('Type of business (e.g., restaurant, hotel, etc.)'),
  badReviews: z.array(z.string()).describe('Array of bad reviews to analyze'),
  productDescription: z.string().describe('Description of your product/service'),
  productFeatures: z.array(z.string()).describe('Key features of your product'),
  targetAudience: z.string().describe('Target audience for your product'),
  senderName: z.string().describe('Name of the person/company sending the email'),
  senderCompany: z.string().describe('Company name of the sender'),
});

const emailOutputSchema = z.object({
  businessName: z.string(),
  emailSubject: z.string(),
  emailBody: z.string(),
  keyProblems: z.array(z.string()),
  solutionPoints: z.array(z.string()),
  callToAction: z.string(),
});

const writeEmailStep = createStep({
  id: 'write-email',
  description: 'Write a customized email based on business reviews and product features',
  inputSchema: emailInputSchema,
  outputSchema: emailOutputSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const agent = mastra?.getAgent('emailWriterAgent');
    if (!agent) {
      throw new Error('Email writer agent not found');
    }

    const prompt = `Please write a customized email for the business "${inputData.businessName}".

Business Details:
- Name: ${inputData.businessName}
- Type: ${inputData.businessType}
- Bad Reviews: ${inputData.badReviews.join(' | ')}

Your Product/Service:
- Description: ${inputData.productDescription}
- Key Features: ${inputData.productFeatures.join(', ')}
- Target Audience: ${inputData.targetAudience}

Sender Information:
- Name: ${inputData.senderName}
- Company: ${inputData.senderCompany}

Please use the email writer tool to analyze the bad reviews, identify key problems, and create a customized email that:
1. Shows understanding of their specific challenges
2. Explains how your product features solve their problems
3. Uses a professional but empathetic tone
4. Includes a compelling call to action

Return the result as valid JSON in this exact format:
{
  "businessName": "Business Name",
  "emailSubject": "Email subject line",
  "emailBody": "Full email content",
  "keyProblems": ["problem1", "problem2"],
  "solutionPoints": ["solution1", "solution2"],
  "callToAction": "Call to action text"
}

Do not include any explanatory text, only return the JSON object.`;

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

    console.log("Email writer response:", resultText);
    
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
        }
      }
      
      if (parsedData && typeof parsedData === 'object') {
        return {
          businessName: parsedData.businessName || inputData.businessName,
          emailSubject: parsedData.emailSubject || 'Partnership Opportunity',
          emailBody: parsedData.emailBody || 'Email content could not be generated',
          keyProblems: Array.isArray(parsedData.keyProblems) ? parsedData.keyProblems : [],
          solutionPoints: Array.isArray(parsedData.solutionPoints) ? parsedData.solutionPoints : [],
          callToAction: parsedData.callToAction || 'Contact us for more information',
        };
      }
    } catch (error) {
      console.log('Failed to parse email response:', error);
    }

    // If all parsing attempts fail, create a fallback result
    const fallbackResult = {
      businessName: inputData.businessName,
      emailSubject: `Partnership Opportunity for ${inputData.businessName}`,
      emailBody: `Dear ${inputData.businessName} Team,\n\nI hope this email finds you well. We noticed some challenges in your customer reviews and believe our ${inputData.productDescription} could help address these issues.\n\nWe'd love to schedule a brief call to discuss how we can help improve your customer experience.\n\nBest regards,\n${inputData.senderName}\n${inputData.senderCompany}`,
      keyProblems: ['Customer experience challenges'],
      solutionPoints: [`Our ${inputData.productDescription} can help improve customer satisfaction`],
      callToAction: 'Schedule a consultation to learn more',
    };

    return fallbackResult;
  },
});

export const emailWriterWorkflow = createWorkflow({
  id: 'email-writer-workflow',
  inputSchema: emailInputSchema,
  outputSchema: emailOutputSchema,
})
  .then(writeEmailStep);

emailWriterWorkflow.commit();