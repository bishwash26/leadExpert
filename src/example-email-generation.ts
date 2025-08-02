import { mastra } from './mastra';

async function emailGenerationExample() {
  try {
    console.log('🚀 Starting Email Generation Example...');
    
    // Test email generation workflow standalone
    console.log('\n1️⃣ Testing Email Writer Workflow...');
    
    const emailResult = await mastra.executeWorkflow('email-writer-workflow', {
      businessName: 'Mario\'s Pizza Palace',
      businessType: 'restaurant',
      badReviews: [
        'Food took 45 minutes to arrive and was cold when it got here',
        'The waiter was rude and unprofessional, completely ignored our table',
        'They got my order wrong twice and refused to fix it',
        'Place was dirty, tables weren\'t cleaned, disgusting experience',
        'Overpriced for what you get, not worth the money at all'
      ],
      productDescription: 'Restaurant Management Software that helps improve operations, customer service, and review management',
      productFeatures: [
        'Real-time order tracking system',
        'Staff training and performance monitoring',
        'Automated customer feedback collection',
        'Kitchen efficiency optimization',
        'Customer communication tools',
        'Review response automation'
      ],
      targetAudience: 'restaurant owners and managers',
      senderName: 'Sarah Johnson',
      senderCompany: 'RestaurantPro Solutions'
    });
    
    console.log('✅ Email Generated Successfully!');
    console.log('\n📧 EMAIL DETAILS:');
    console.log(`Subject: ${emailResult.emailSubject}`);
    console.log('\n📝 Email Body:');
    console.log(emailResult.emailBody);
    console.log('\n🔍 Key Problems Identified:');
    emailResult.keyProblems.forEach((problem, index) => {
      console.log(`  ${index + 1}. ${problem}`);
    });
    console.log('\n💡 Solution Points:');
    emailResult.solutionPoints.forEach((solution, index) => {
      console.log(`  ${index + 1}. ${solution}`);
    });
    console.log(`\n📞 Call to Action: ${emailResult.callToAction}`);
    
    // Test combined workflow with email generation
    console.log('\n\n2️⃣ Testing Combined Workflow with Email Generation...');
    
    const combinedResult = await mastra.executeWorkflow('combined-lead-workflow', {
      query: 'restaurants in New York',
      maxLeads: 2,
      generateEmails: true,
      productDescription: 'AI-powered restaurant management system that improves customer experience and operational efficiency',
      productFeatures: [
        'Smart order management',
        'Customer sentiment analysis',
        'Staff performance tracking',
        'Automated review responses',
        'Real-time kitchen monitoring',
        'Predictive maintenance alerts'
      ],
      targetAudience: 'restaurant owners and managers',
      senderName: 'Alex Chen',
      senderCompany: 'SmartRestaurant AI'
    });
    
    console.log('✅ Combined Workflow Results:');
    console.log(`🔍 Search Query: ${combinedResult.searchQuery}`);
    console.log(`📊 Total Leads Found: ${combinedResult.totalLeadsFound}`);
    console.log(`✅ Leads Enriched: ${combinedResult.leadsEnriched}`);
    
    console.log('\n📋 LEAD-BY-LEAD RESULTS:');
    combinedResult.enrichedLeads.forEach((lead, index) => {
      console.log(`\n${index + 1}. ${lead.originalData.name}`);
      console.log(`   🌐 Website: ${lead.originalData.website || 'N/A'}`);
      console.log(`   ⭐ Rating: ${lead.originalData.rating || 'N/A'}`);
      console.log(`   ✅ Enrichment: ${lead.enrichmentSuccess ? 'SUCCESS' : 'FAILED'}`);
      
      if (lead.enrichmentSuccess && lead.enrichedData) {
        console.log(`   📧 Contact Emails: ${lead.enrichedData.emails.length}`);
        console.log(`   📞 Phone Numbers: ${lead.enrichedData.phoneNumbers.length}`);
        console.log(`   🔗 Social Links: ${lead.enrichedData.socialLinks.length}`);
      }
      
      // Email generation results
      console.log(`   📨 Email Generated: ${lead.emailGenerated ? 'YES' : 'NO'}`);
      if (lead.emailGenerated && lead.emailData) {
        console.log(`   📧 Email Subject: ${lead.emailData.emailSubject}`);
        console.log(`   🔍 Problems Identified: ${lead.emailData.keyProblems.length}`);
        console.log(`   💡 Solutions Provided: ${lead.emailData.solutionPoints.length}`);
        
        // Show a snippet of the email
        const emailSnippet = lead.emailData.emailBody.substring(0, 200) + '...';
        console.log(`   📝 Email Preview: ${emailSnippet}`);
      } else if (lead.emailError) {
        console.log(`   ❌ Email Error: ${lead.emailError}`);
      }
    });
    
    console.log('\n📊 SUMMARY STATISTICS:');
    console.log(`📧 Total Contact Emails Found: ${combinedResult.summary.totalEmailsFound}`);
    console.log(`📞 Total Phone Numbers Found: ${combinedResult.summary.totalPhoneNumbersFound}`);
    console.log(`🔗 Total Social Links Found: ${combinedResult.summary.totalSocialLinksFound}`);
    console.log(`⭐ Average Contact Quality: ${combinedResult.summary.averageContactQuality}`);
    
    const emailsGenerated = combinedResult.enrichedLeads.filter(lead => lead.emailGenerated).length;
    console.log(`📨 Emails Successfully Generated: ${emailsGenerated}/${combinedResult.leadsEnriched}`);
    
    if (combinedResult.summary.topRecommendations.length > 0) {
      console.log('\n💡 Top Recommendations:');
      combinedResult.summary.topRecommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
    }
    
    console.log('\n🎉 Email Generation Example Completed Successfully!');
    console.log('\n📝 WHAT THIS DEMONSTRATES:');
    console.log('✅ Automatic lead finding using search queries');
    console.log('✅ Contact information extraction from websites');
    console.log('✅ Review analysis to identify business problems');
    console.log('✅ Customized email generation based on specific issues');
    console.log('✅ Product feature mapping to problem solutions');
    console.log('✅ Professional email formatting with clear CTAs');
    console.log('✅ Complete lead-to-email pipeline automation');
    
  } catch (error) {
    console.error('❌ Error during email generation example:', error);
    console.error('Error details:', error instanceof Error ? error.stack : error);
  }
}

// Run the example
emailGenerationExample();