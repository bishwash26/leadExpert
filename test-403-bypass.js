import { mastra } from './src/mastra/index.js';

async function test403Bypass() {
  try {
    console.log('🧪 Testing 403 Bypass Functionality...');
    
    // Test websites that are known to sometimes block scrapers
    const testUrls = [
      'https://www.cloudflare.com', // Known for bot protection
      'https://www.amazon.com',     // Often blocks scrapers
      'https://www.microsoft.com',  // Corporate site with protections
      'https://httpbin.org/status/403', // Simulates 403 error
    ];
    
    for (const testUrl of testUrls) {
      console.log(`\n📡 Testing: ${testUrl}`);
      console.log('='.repeat(50));
      
      try {
        const result = await mastra.executeWorkflow('lead-enricher-workflow', {
          url: testUrl,
        });
        
        console.log(`✅ Successfully scraped ${testUrl}`);
        console.log(`📧 Emails found: ${result.emails.length}`);
        console.log(`📞 Phone numbers found: ${result.phoneNumbers.length}`);
        console.log(`🔗 Social links found: ${result.socialLinks.length}`);
        console.log(`🎯 Contact quality: ${result.analysis.contactQuality}`);
        
        if (result.emails.length > 0) {
          console.log('📧 Email addresses:');
          result.emails.forEach((email, i) => {
            console.log(`  ${i + 1}. ${email}`);
          });
        }
        
        if (result.phoneNumbers.length > 0) {
          console.log('📞 Phone numbers:');
          result.phoneNumbers.forEach((phone, i) => {
            console.log(`  ${i + 1}. ${phone}`);
          });
        }
        
      } catch (error) {
        console.log(`❌ Failed to scrape ${testUrl}:`);
        console.log(`   Error: ${error.message}`);
        
        // Check if it's still a 403 error
        if (error.message.includes('403')) {
          console.log('   🚫 Still getting 403 - this site has strong protection');
        } else {
          console.log('   ℹ️  Different error - bypass may have worked but other issue occurred');
        }
      }
      
      // Add delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n🎉 403 Bypass test completed!');
    console.log('\n📊 Summary:');
    console.log('✅ Multiple user agents and browser headers implemented');
    console.log('✅ Mobile browser simulation added');
    console.log('✅ Search engine bot headers included');
    console.log('✅ Random delays to avoid rate limiting');
    console.log('✅ Proxy fallback service as last resort');
    console.log('✅ Comprehensive error handling and retries');
    
  } catch (error) {
    console.error('❌ Test script failed:', error);
  }
}

test403Bypass();