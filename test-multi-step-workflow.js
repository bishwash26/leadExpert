import { mastra } from './dist/src/mastra/index.js';

async function testMultiStepWorkflow() {
  try {
    console.log('🚀 Testing Multi-Step Combined Workflow...');
    
    const result = await mastra.executeWorkflow('combined-lead-workflow', {
      query: 'pizza restaurants in Brooklyn',
      maxLeads: 2,
      generateEmails: true,
      productDescription: 'AI-powered restaurant management system that improves customer experience and operational efficiency',
      productFeatures: [
        'Smart order management system',
        'Customer sentiment analysis from reviews',
        'Staff performance tracking and training',
        'Automated review response generation',
        'Real-time kitchen monitoring',
        'Predictive maintenance alerts'
      ],
      targetAudience: 'restaurant owners and managers',
      senderName: 'Alex Chen',
      senderCompany: 'SmartRestaurant AI'
    });
    
    console.log('✅ Multi-Step Workflow Results:');
    console.log(`🔍 Search Query: ${result.searchQuery}`);
    console.log(`📊 Total Leads Found: ${result.totalLeadsFound}`);
    console.log(`✅ Leads Enriched: ${result.leadsEnriched}`);
    
    console.log('\n📋 DETAILED RESULTS:');
    result.enrichedLeads.forEach((lead, index) => {
      console.log(`\n${index + 1}. ${lead.originalData.name}`);
      console.log(`   🌐 Website: ${lead.originalData.website || 'N/A'}`);
      console.log(`   ⭐ Rating: ${lead.originalData.rating || 'N/A'}`);
      console.log(`   ✅ Enrichment: ${lead.enrichmentSuccess ? 'SUCCESS' : 'FAILED'}`);
      
      if (lead.enrichmentSuccess && lead.enrichedData) {
        console.log(`   📧 Contact Emails: ${lead.enrichedData.emails.length}`);
        console.log(`   📞 Phone Numbers: ${lead.enrichedData.phoneNumbers.length}`);
        console.log(`   🔗 Social Links: ${lead.enrichedData.socialLinks.length}`);
        console.log(`   🏷️ Quality: ${lead.enrichedData.analysis.contactQuality}`);
      }
      
      // Email generation results
      console.log(`   📨 Email Generated: ${lead.emailGenerated ? 'YES' : 'NO'}`);
      if (lead.emailGenerated && lead.emailData) {
        console.log(`   📧 Email Subject: "${lead.emailData.emailSubject}"`);
        console.log(`   🔍 Problems Identified: ${lead.emailData.keyProblems.length}`);
        console.log(`   💡 Solutions Provided: ${lead.emailData.solutionPoints.length}`);
        
        if (lead.emailData.keyProblems.length > 0) {
          console.log(`   🚨 Key Problems: ${lead.emailData.keyProblems.join(', ')}`);
        }
        
        // Show a snippet of the email
        const emailSnippet = lead.emailData.emailBody.substring(0, 150) + '...';
        console.log(`   📝 Email Preview: ${emailSnippet}`);
      } else if (lead.emailError) {
        console.log(`   ❌ Email Error: ${lead.emailError}`);
      }
    });
    
    console.log('\n📊 SUMMARY STATISTICS:');
    console.log(`📧 Total Contact Emails Found: ${result.summary.totalEmailsFound}`);
    console.log(`📞 Total Phone Numbers Found: ${result.summary.totalPhoneNumbersFound}`);
    console.log(`🔗 Total Social Links Found: ${result.summary.totalSocialLinksFound}`);
    console.log(`⭐ Average Contact Quality: ${result.summary.averageContactQuality}`);
    
    const emailsGenerated = result.enrichedLeads.filter(lead => lead.emailGenerated).length;
    console.log(`📨 Emails Successfully Generated: ${emailsGenerated}/${result.leadsEnriched}`);
    
    if (result.summary.topRecommendations.length > 0) {
      console.log('\n💡 Top Recommendations:');
      result.summary.topRecommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
    }
    
    console.log('\n🎉 Multi-Step Workflow Test Completed Successfully!');
    console.log('\n📝 WORKFLOW STEPS EXECUTED:');
    console.log('✅ Step 1: Find Leads - Search for businesses using lead finder agent');
    console.log('✅ Step 2: Enrich Leads - Extract contact info from websites');
    console.log('✅ Step 3: Generate Emails - Create customized emails based on reviews');
    console.log('\n🔧 ARCHITECTURE BENEFITS:');
    console.log('✅ Modular workflow steps for better debugging');
    console.log('✅ Clear separation of concerns');
    console.log('✅ Independent error handling per step');
    console.log('✅ Data flow validation between steps');
    console.log('✅ Optional email generation step');
    
  } catch (error) {
    console.error('❌ Error during multi-step workflow test:', error);
    console.error('Error details:', error.stack);
  }
}

// Run the test
testMultiStepWorkflow();