import { mastra } from './mastra';

async function combinedWorkflowExample() {
  try {
    console.log('🚀 Starting Combined Lead Finder & Enricher Workflow...');
    
    // Example search query
    const searchQuery = 'restaurants in New York';
    const maxLeads = 3; // Limit to 3 leads for demonstration
    
    console.log(`🔍 Searching for: "${searchQuery}"`);
    console.log(`📊 Maximum leads to enrich: ${maxLeads}`);
    
    // Execute the combined workflow
    const result = await mastra.executeWorkflow('combined-lead-workflow', {
      query: searchQuery,
      maxLeads: maxLeads,
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('📈 COMBINED LEAD GENERATION RESULTS');
    console.log('='.repeat(60));
    
    console.log(`\n🔍 Search Query: ${result.searchQuery}`);
    console.log(`📊 Total Leads Found: ${result.totalLeadsFound}`);
    console.log(`✅ Leads Enriched: ${result.leadsEnriched}`);
    
    console.log('\n📊 SUMMARY STATISTICS:');
    console.log(`📧 Total Emails Found: ${result.summary.totalEmailsFound}`);
    console.log(`📞 Total Phone Numbers Found: ${result.summary.totalPhoneNumbersFound}`);
    console.log(`🔗 Total Social Links Found: ${result.summary.totalSocialLinksFound}`);
    console.log(`⭐ Average Contact Quality: ${result.summary.averageContactQuality}`);
    
    console.log('\n💡 TOP RECOMMENDATIONS:');
    result.summary.topRecommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 DETAILED LEAD RESULTS');
    console.log('='.repeat(60));
    
    result.enrichedLeads.forEach((lead, index) => {
      console.log(`\n${index + 1}. ${lead.originalData.name}`);
      console.log(`   📍 Address: ${lead.originalData.address || 'Not available'}`);
      console.log(`   🌐 Website: ${lead.originalData.website || 'Not available'}`);
      console.log(`   ⭐ Rating: ${lead.originalData.rating || 'Not available'}`);
      
      if (lead.enrichmentSuccess && lead.enrichedData) {
        console.log(`   ✅ Enrichment: SUCCESS`);
        console.log(`   📧 Emails: ${lead.enrichedData.emails.length}`);
        console.log(`   📞 Phone Numbers: ${lead.enrichedData.phoneNumbers.length}`);
        console.log(`   🔗 Social Links: ${lead.enrichedData.socialLinks.length}`);
        
        if (lead.enrichedData.emails.length > 0) {
          console.log(`   📧 Email Addresses:`);
          lead.enrichedData.emails.forEach((email, i) => {
            console.log(`      ${i + 1}. ${email}`);
          });
        }
        
        if (lead.enrichedData.phoneNumbers.length > 0) {
          console.log(`   📞 Phone Numbers:`);
          lead.enrichedData.phoneNumbers.forEach((phone, i) => {
            console.log(`      ${i + 1}. ${phone}`);
          });
        }
        
        if (lead.enrichedData.analysis.contactQuality) {
          console.log(`   🎯 Contact Quality: ${lead.enrichedData.analysis.contactQuality}`);
        }
        
        if (lead.enrichedData.analysis.recommendations.length > 0) {
          console.log(`   💡 Recommendations:`);
          lead.enrichedData.analysis.recommendations.forEach((rec, i) => {
            console.log(`      ${i + 1}. ${rec}`);
          });
        }
      } else {
        console.log(`   ❌ Enrichment: FAILED`);
        console.log(`   🚫 Error: ${lead.enrichmentError || 'Unknown error'}`);
      }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 COMBINED WORKFLOW COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error during combined workflow:', error);
  }
}

// Run the example
combinedWorkflowExample(); 