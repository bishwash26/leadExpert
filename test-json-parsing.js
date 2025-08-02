import { mastra } from './src/mastra/index.js';

async function testJSONParsing() {
  try {
    console.log('🧪 Testing Improved JSON Parsing...');
    
    // Test lead finder workflow first
    console.log('\n1️⃣ Testing Lead Finder Workflow...');
    const leadFinderResult = await mastra.executeWorkflow('lead-finder-workflow', {
      query: 'coffee shops in San Francisco'
    });
    
    console.log('✅ Lead Finder Results:');
    console.log(`📊 Found ${leadFinderResult.length} leads`);
    leadFinderResult.forEach((lead, index) => {
      console.log(`  ${index + 1}. ${lead.name} - ${lead.website || 'No website'}`);
    });
    
    // Test combined workflow
    console.log('\n2️⃣ Testing Combined Workflow...');
    const combinedResult = await mastra.executeWorkflow('combined-lead-workflow', {
      query: 'coffee shops in San Francisco',
      maxLeads: 2
    });
    
    console.log('✅ Combined Workflow Results:');
    console.log(`🔍 Search Query: ${combinedResult.searchQuery}`);
    console.log(`📊 Total Leads Found: ${combinedResult.totalLeadsFound}`);
    console.log(`✅ Leads Enriched: ${combinedResult.leadsEnriched}`);
    
    console.log('\n📋 Lead Details:');
    combinedResult.enrichedLeads.forEach((lead, index) => {
      console.log(`\n${index + 1}. ${lead.originalData.name}`);
      console.log(`   🌐 Website: ${lead.originalData.website || 'N/A'}`);
      console.log(`   ✅ Enrichment: ${lead.enrichmentSuccess ? 'SUCCESS' : 'FAILED'}`);
      if (lead.enrichmentError) {
        console.log(`   ❌ Error: ${lead.enrichmentError}`);
      }
    });
    
    console.log('\n🎉 JSON parsing test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.stack);
  }
}

testJSONParsing();