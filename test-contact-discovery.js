import { mastra } from './src/mastra/index.js';

async function testContactPageDiscovery() {
  try {
    console.log('🧪 Testing Contact Page Discovery...');
    
    // Test with a website that likely has contact info on a separate page
    const testUrls = [
      'https://www.microsoft.com',
      'https://www.apple.com',
      'https://www.google.com'
    ];
    
    for (const testUrl of testUrls) {
      console.log(`\n📡 Testing: ${testUrl}`);
      console.log('='.repeat(50));
      
      const result = await mastra.executeWorkflow('lead-enricher-workflow', {
        url: testUrl,
      });
      
      console.log(`✅ Results for ${result.website}:`);
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
      
      // Wait a bit between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n🎉 Contact page discovery test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testContactPageDiscovery(); 