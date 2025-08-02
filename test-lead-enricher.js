import { mastra } from './src/mastra/index.js';

async function testLeadEnricher() {
  try {
    console.log('🧪 Testing Lead Enricher...');
    
    // Test with a real website
    const testUrl = 'https://www.apple.com'; // Using Apple as a test case
    
    console.log(`📡 Enriching lead for: ${testUrl}`);
    
    const result = await mastra.executeWorkflow('lead-enricher-workflow', {
      url: testUrl,
    });
    
    console.log('\n✅ Lead Enrichment Results:');
    console.log(`Website: ${result.website}`);
    console.log(`Title: ${result.title}`);
    console.log(`Emails found: ${result.emails.length}`);
    console.log(`Phone numbers found: ${result.phoneNumbers.length}`);
    console.log(`Social links found: ${result.socialLinks.length}`);
    
    if (result.emails.length > 0) {
      console.log('\n📧 Emails:');
      result.emails.forEach((email, i) => console.log(`  ${i + 1}. ${email}`));
    }
    
    if (result.phoneNumbers.length > 0) {
      console.log('\n📞 Phone Numbers:');
      result.phoneNumbers.forEach((phone, i) => console.log(`  ${i + 1}. ${phone}`));
    }
    
    if (result.socialLinks.length > 0) {
      console.log('\n🔗 Social Links:');
      result.socialLinks.forEach((link, i) => console.log(`  ${i + 1}. ${link}`));
    }
    
    console.log('\n📊 Analysis:');
    console.log(`Contact Quality: ${result.analysis.contactQuality}`);
    console.log(`Recommendations: ${result.analysis.recommendations.length}`);
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testLeadEnricher(); 