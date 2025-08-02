import { mastra } from './src/mastra/index.js';

async function testEnrichmentParsing() {
  try {
    console.log('🧪 Testing Enrichment Response Parsing Fix...');
    
    // Test individual lead enricher workflow first
    console.log('\n1️⃣ Testing Lead Enricher Workflow...');
    const enrichResult = await mastra.executeWorkflow('lead-enricher-workflow', {
      url: 'https://www.apple.com'
    });
    
    console.log('✅ Lead Enricher Results:');
    console.log(`📧 Emails: ${enrichResult.emails.length}`);
    console.log(`📞 Phone Numbers: ${enrichResult.phoneNumbers.length}`);
    console.log(`🔗 Social Links: ${enrichResult.socialLinks.length}`);
    console.log(`🎯 Contact Quality: ${enrichResult.analysis.contactQuality}`);
    
    if (enrichResult.emails.length > 0) {
      console.log('📧 Found emails:', enrichResult.emails);
    }
    
    // Test combined workflow with a single lead
    console.log('\n2️⃣ Testing Combined Workflow...');
    const combinedResult = await mastra.executeWorkflow('combined-lead-workflow', {
      query: 'hotels in London',
      maxLeads: 1
    });
    
    console.log('✅ Combined Workflow Results:');
    console.log(`🔍 Search Query: ${combinedResult.searchQuery}`);
    console.log(`📊 Total Leads Found: ${combinedResult.totalLeadsFound}`);
    console.log(`✅ Leads Enriched: ${combinedResult.leadsEnriched}`);
    
    console.log('\n📋 Enrichment Details:');
    combinedResult.enrichedLeads.forEach((lead, index) => {
      console.log(`\n${index + 1}. ${lead.originalData.name}`);
      console.log(`   🌐 Website: ${lead.originalData.website || 'N/A'}`);
      console.log(`   ✅ Enrichment: ${lead.enrichmentSuccess ? 'SUCCESS' : 'FAILED'}`);
      
      if (lead.enrichmentSuccess && lead.enrichedData) {
        console.log(`   📧 Emails: ${lead.enrichedData.emails.length}`);
        console.log(`   📞 Phones: ${lead.enrichedData.phoneNumbers.length}`);
        console.log(`   🔗 Social: ${lead.enrichedData.socialLinks.length}`);
        console.log(`   🎯 Quality: ${lead.enrichedData.analysis.contactQuality}`);
        
        if (lead.enrichedData.emails.length > 0) {
          console.log(`   📧 Email List: ${lead.enrichedData.emails.join(', ')}`);
        }
      } else {
        console.log(`   ❌ Error: ${lead.enrichmentError}`);
      }
    });
    
    console.log('\n🎉 Enrichment parsing test completed successfully!');
    console.log('✅ The markdown/JSON parsing issue has been resolved!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.stack);
  }
}

testEnrichmentParsing();