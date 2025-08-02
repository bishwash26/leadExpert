import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface ScrapedData {
  title: string;
  content: string;
  emails: string[];
  phoneNumbers: string[];
  socialLinks: string[];
  contactInfo: {
    address?: string;
    hours?: string;
    description?: string;
  };
}

export const webScraperTool = createTool({
  id: 'web-scraper',
  description: 'Scrape websites to extract contact information, emails, phone numbers, and other relevant business details',
  inputSchema: z.object({
    url: z.string().describe('The website URL to scrape'),
  }),
  outputSchema: z.object({
    title: z.string(),
    content: z.string(),
    emails: z.array(z.string()),
    phoneNumbers: z.array(z.string()),
    socialLinks: z.array(z.string()),
    contactInfo: z.object({
      address: z.string().optional(),
      hours: z.string().optional(),
      description: z.string().optional(),
    }),
  }),
  execute: async ({ context }) => {
    return await scrapeWebsite(context.url);
  },
});

const scrapeWebsite = async (url: string): Promise<ScrapedData> => {
  // Try multiple strategies to bypass 403 errors
  const strategies: Array<{name: string, headers: Record<string, string>}> = [
    // Strategy 1: Standard browser headers
    {
      name: 'Standard Browser',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
      }
    },
    // Strategy 2: Mobile browser
    {
      name: 'Mobile Browser',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
      }
    },
    // Strategy 3: Search engine bot
    {
      name: 'Search Bot',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': '*/*',
      }
    },
    // Strategy 4: Basic request
    {
      name: 'Basic Request',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    },
    // Strategy 5: Firefox browser
    {
      name: 'Firefox Browser',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
      }
    },
    // Strategy 6: Edge browser
    {
      name: 'Edge Browser',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Sec-CH-UA': '"Not_A Brand";v="8", "Chromium";v="120", "Microsoft Edge";v="120"',
        'Sec-CH-UA-Mobile': '?0',
        'Sec-CH-UA-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      }
    }
  ];

  let html = '';
  let lastError = null;

  for (const strategy of strategies) {
    try {
      console.log(`Trying ${strategy.name} strategy for ${url}`);
      
      // Add random delay to avoid rate limiting
      if (strategies.indexOf(strategy) > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      }

      const response = await fetch(url, {
        headers: strategy.headers,
        redirect: 'follow',
        signal: AbortSignal.timeout(15000), // 15 second timeout
      });

      if (response.ok) {
        html = await response.text();
        console.log(`✅ Successfully fetched ${url} using ${strategy.name} strategy`);
        break;
      } else {
        console.log(`❌ ${strategy.name} strategy failed: ${response.status} ${response.statusText}`);
        lastError = new Error(`${strategy.name}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${strategy.name} strategy error:`, error instanceof Error ? error.message : error);
      lastError = error;
      continue;
    }
  }

  // If all direct strategies fail, try using a proxy service as last resort
  if (!html) {
    console.log('All direct strategies failed, trying proxy service...');
    try {
      // Try using a public CORS proxy as last resort
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const proxyResponse = await fetch(proxyUrl, {
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(20000),
      });

      if (proxyResponse.ok) {
        const proxyData = await proxyResponse.json();
        if (proxyData && proxyData.contents) {
          html = proxyData.contents;
          console.log(`✅ Successfully fetched ${url} using proxy service`);
        }
      }
    } catch (proxyError) {
      console.log('❌ Proxy service also failed:', proxyError instanceof Error ? proxyError.message : proxyError);
    }
  }

  if (!html) {
    throw new Error(`Failed to fetch website after trying all strategies including proxy. Last error: ${lastError instanceof Error ? lastError.message : 'Unknown error'}`);
  }

  try {    
    // Extract basic information
    const title = extractTitle(html);
    const content = extractContent(html);
    
    // Extract contact information from main page
    let emails = extractEmails(html);
    let phoneNumbers = extractPhoneNumbers(html);
    let socialLinks = extractSocialLinks(html);
    let contactInfo = extractContactInfo(html);

    // If no emails found, try to find and scrape contact page
    if (emails.length === 0) {
      console.log('No emails found on main page, searching for contact page...');
      
      const contactPageUrl = findContactPageUrl(url, html);
      if (contactPageUrl) {
        console.log(`Found contact page: ${contactPageUrl}`);
        
        try {
          // Use the same bypass strategies for contact page
          let contactHtml = '';
          let contactFetchSuccess = false;

          for (const strategy of strategies) {
            try {
              console.log(`Trying ${strategy.name} strategy for contact page: ${contactPageUrl}`);
              
              const contactResponse = await fetch(contactPageUrl, {
                headers: strategy.headers,
                redirect: 'follow',
                signal: AbortSignal.timeout(10000), // 10 second timeout for contact pages
              });

              if (contactResponse.ok) {
                contactHtml = await contactResponse.text();
                console.log(`✅ Successfully fetched contact page using ${strategy.name} strategy`);
                contactFetchSuccess = true;
                break;
              }
            } catch (error) {
              console.log(`❌ Contact page ${strategy.name} strategy failed:`, error instanceof Error ? error.message : error);
              continue;
            }
          }

          if (contactFetchSuccess) {
            // Extract contact information from contact page
            const contactEmails = extractEmails(contactHtml);
            const contactPhones = extractPhoneNumbers(contactHtml);
            const contactSocialLinks = extractSocialLinks(contactHtml);
            const contactPageInfo = extractContactInfo(contactHtml);
            
            // Merge results, prioritizing contact page data
            emails = [...new Set([...emails, ...contactEmails])];
            phoneNumbers = [...new Set([...phoneNumbers, ...contactPhones])];
            socialLinks = [...new Set([...socialLinks, ...contactSocialLinks])];
            
            // Merge contact info, contact page takes precedence
            contactInfo = {
              ...contactInfo,
              ...contactPageInfo,
            };
            
            console.log(`Found ${contactEmails.length} emails on contact page`);
          }
        } catch (contactError) {
          console.log('Failed to scrape contact page:', contactError);
        }
      } else {
        console.log('No contact page found');
      }
    }

    return {
      title,
      content,
      emails,
      phoneNumbers,
      socialLinks,
      contactInfo,
    };
  } catch (error) {
    console.error('Error scraping website:', error);
    throw new Error(`Failed to scrape website: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const extractTitle = (html: string): string => {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : 'No title found';
};

const extractContent = (html: string): string => {
  // Remove script and style tags
  let content = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Remove HTML tags
  content = content.replace(/<[^>]*>/g, ' ');
  
  // Clean up whitespace
  content = content.replace(/\s+/g, ' ').trim();
  
  return content.substring(0, 2000); // Limit content length
};

const extractEmails = (html: string): string[] => {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = html.match(emailRegex) || [];
  
  // Remove duplicates and filter out common false positives
  const uniqueEmails = [...new Set(emails)].filter(email => {
    // Filter out common false positives
    const falsePositives = ['example.com', 'test.com', 'domain.com', 'email.com'];
    return !falsePositives.some(fp => email.toLowerCase().includes(fp));
  });
  
  return uniqueEmails;
};

const extractPhoneNumbers = (html: string): string[] => {
  // Multiple phone number patterns
  const patterns = [
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // US format: 123-456-7890
    /\b\(\d{3}\)\s?\d{3}[-.\s]?\d{4}\b/g, // US format: (123) 456-7890
    /\b\+1\s?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // US format: +1 123-456-7890
    /\b\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,4}\b/g, // International format
  ];
  
  const phoneNumbers: string[] = [];
  
  patterns.forEach(pattern => {
    const matches = html.match(pattern) || [];
    phoneNumbers.push(...matches);
  });
  
  // Remove duplicates and clean up
  return [...new Set(phoneNumbers)].map(phone => phone.trim());
};

const extractSocialLinks = (html: string): string[] => {
  const socialPlatforms = [
    'facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com',
    'youtube.com', 'tiktok.com', 'snapchat.com', 'pinterest.com'
  ];
  
  const socialLinks: string[] = [];
  
  socialPlatforms.forEach(platform => {
    const regex = new RegExp(`https?://[^\\s"']*${platform.replace('.', '\\.')}[^\\s"']*`, 'gi');
    const matches = html.match(regex) || [];
    socialLinks.push(...matches);
  });
  
  return [...new Set(socialLinks)];
};

const findContactPageUrl = (baseUrl: string, html: string): string | null => {
  // Common contact page patterns
  const contactPatterns = [
    /href=["']([^"']*contact[^"']*)["']/gi,
    /href=["']([^"']*about[^"']*)["']/gi,
    /href=["']([^"']*reach[^"']*)["']/gi,
    /href=["']([^"']*get-in-touch[^"']*)["']/gi,
    /href=["']([^"']*connect[^"']*)["']/gi,
    /href=["']([^"']*support[^"']*)["']/gi,
  ];

  for (const pattern of contactPatterns) {
    const matches = html.match(pattern);
    if (matches) {
      for (const match of matches) {
        const url = match.replace(/href=["']/, '').replace(/["']$/, '');
        if (url && !url.startsWith('javascript:') && !url.startsWith('#')) {
          // Convert relative URL to absolute URL
          if (url.startsWith('/')) {
            const baseUrlObj = new URL(baseUrl);
            return `${baseUrlObj.protocol}//${baseUrlObj.host}${url}`;
          } else if (url.startsWith('http')) {
            return url;
          } else {
            const baseUrlObj = new URL(baseUrl);
            return `${baseUrlObj.protocol}//${baseUrlObj.host}/${url}`;
          }
        }
      }
    }
  }

  // Also check for common contact page URLs
  const commonContactUrls = [
    '/contact',
    '/contact-us',
    '/about',
    '/about-us',
    '/reach-us',
    '/get-in-touch',
    '/connect',
    '/support',
  ];

  const baseUrlObj = new URL(baseUrl);
  for (const contactPath of commonContactUrls) {
    try {
      const contactUrl = `${baseUrlObj.protocol}//${baseUrlObj.host}${contactPath}`;
      return contactUrl;
    } catch (error) {
      // Skip invalid URLs
      continue;
    }
  }

  return null;
};

const extractContactInfo = (html: string) => {
  const contactInfo: {
    address?: string;
    hours?: string;
    description?: string;
  } = {};
  
  // Try to extract address information
  const addressPatterns = [
    /(?:address|location)[^>]*>([^<]+)/gi,
    /(?:street|avenue|road|drive)[^>]*>([^<]+)/gi,
  ];
  
  for (const pattern of addressPatterns) {
    const match = html.match(pattern);
    if (match) {
      contactInfo.address = match[1].trim();
      break;
    }
  }
  
  // Try to extract business hours
  const hoursPattern = /(?:hours|open|closed)[^>]*>([^<]+)/gi;
  const hoursMatch = html.match(hoursPattern);
  if (hoursMatch) {
    contactInfo.hours = hoursMatch[1].trim();
  }
  
  // Try to extract description
  const descPattern = /(?:description|about)[^>]*>([^<]+)/gi;
  const descMatch = html.match(descPattern);
  if (descMatch) {
    contactInfo.description = descMatch[1].trim();
  }
  
  return contactInfo;
}; 