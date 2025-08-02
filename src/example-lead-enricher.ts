import { mastra } from './mastra';

async function enrichLeadExample() {
  try {
    console.log('Starting lead enrichment example...');
    
    // Example website URL to enrich
    const websiteUrl = 'https://example.com'; // Replace with actual website URL
    
    console.log(`Enriching lead for website: ${websiteUrl}`);
    
    // Execute the lead enricher workflow
    const result = await mastra.executeWorkflow('lead-enricher-workflow', {
      url: websiteUrl,
    });
    
    console.log('\n=== Lead Enrichment Results ===');
    console.log(`Website: ${result.website}`);
    console.log(`Title: ${result.title}`);
    
    console.log('\n=== Contact Information ===');
    console.log('Emails found:');
    result.emails.forEach((email, index) => {
      console.log(`  ${index + 1}. ${email}`);
    });
    
    console.log('\nPhone numbers found:');
    result.phoneNumbers.forEach((phone, index) => {
      console.log(`  ${index + 1}. ${phone}`);
    });
    
    console.log('\nSocial media links:');
    result.socialLinks.forEach((link, index) => {
      console.log(`  ${index + 1}. ${link}`);
    });
    
    console.log('\n=== Additional Information ===');
    if (result.contactInfo.address) {
      console.log(`Address: ${result.contactInfo.address}`);
    }
    if (result.contactInfo.hours) {
      console.log(`Hours: ${result.contactInfo.hours}`);
    }
    if (result.contactInfo.description) {
      console.log(`Description: ${result.contactInfo.description}`);
    }
    
    console.log('\n=== Analysis ===');
    console.log(`Contact Quality: ${result.analysis.contactQuality}`);
    if (result.analysis.businessType) {
      console.log(`Business Type: ${result.analysis.businessType}`);
    }
    if (result.analysis.potentialValue) {
      console.log(`Potential Value: ${result.analysis.potentialValue}`);
    }
    
    console.log('\nRecommendations:');
    result.analysis.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
    
  } catch (error) {
    console.error('Error during lead enrichment:', error);
  }
}

// Run the example
enrichLeadExample(); 