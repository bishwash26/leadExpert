import { mastra } from './src/mastra/index.js';

async function testCombinedWorkflow() {
  try {
    console.log('🧪 Testing Fixed Combined Lead Workflow...');
    
    // Test with a simple query
    const testQuery = 'coffee shops in San Francisco';
    const maxLeads = 2; // Limit for testing
    
    console.log(`📡 Testing: ${testQuery}`);
    console.log(`📊 Max leads to enrich: ${maxLeads}`);
    
    const result = await mastra.executeWorkflow('combined-lead-workflow', {
      query: testQuery,
      maxLeads: maxLeads,
    });
    
    console.log('\n✅ Combined Workflow Results:');
    console.log(`🔍 Search Query: ${result.searchQuery}`);
    console.log(`📊 Total Leads Found: ${result.totalLeadsFound}`);
    console.log(`✅ Leads Enriched: ${result.leadsEnriched}`);
    
    console.log('\n📊 Summary:');
    console.log(`📧 Total Emails: ${result.summary.totalEmailsFound}`);
    console.log(`📞 Total Phone Numbers: ${result.summary.totalPhoneNumbersFound}`);
    console.log(`🔗 Total Social Links: ${result.summary.totalSocialLinksFound}`);
    console.log(`⭐ Average Contact Quality: ${result.summary.averageContactQuality}`);
    
    if (result.summary.topRecommendations.length > 0) {
      console.log('\n💡 Top Recommendations:');
      result.summary.topRecommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
    }
    
    console.log('\n📋 Enriched Leads:');
    result.enrichedLeads.forEach((lead, index) => {
      console.log(`\n${index + 1}. ${lead.originalData.name}`);
      console.log(`   📍 Address: ${lead.originalData.address || 'N/A'}`);
      console.log(`   🌐 Website: ${lead.originalData.website || 'N/A'}`);
      console.log(`   ⭐ Rating: ${lead.originalData.rating || 'N/A'}`);
      console.log(`   ✅ Enrichment: ${lead.enrichmentSuccess ? 'SUCCESS' : 'FAILED'}`);
      
      if (lead.enrichmentSuccess && lead.enrichedData) {
        console.log(`   📧 Emails: ${lead.enrichedData.emails.length}`);
        console.log(`   📞 Phones: ${lead.enrichedData.phoneNumbers.length}`);
        console.log(`   🔗 Social: ${lead.enrichedData.socialLinks.length}`);
        
        if (lead.enrichedData.emails.length > 0) {
          console.log(`   📧 Email List: ${lead.enrichedData.emails.join(', ')}`);
        }
      } else {
        console.log(`   ❌ Error: ${lead.enrichmentError}`);
      }
    });
    
    console.log('\n🎉 Fixed combined workflow test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.stack);
  }
}

testCombinedWorkflow();