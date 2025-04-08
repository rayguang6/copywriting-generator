import { BusinessProfile, CopywritingFramework } from './types';

interface GenerateParams {
  prompt: string;
  framework?: CopywritingFramework;
  businessProfile?: BusinessProfile | null;
}

/**
 * Generate copywriting based on the provided prompt, framework, and business profile
 */
export async function generateCopy({ prompt, framework, businessProfile }: GenerateParams): Promise<string> {
  // In a production environment, this would call an API endpoint to generate the text
  // For now, we'll simulate the API call with a delay and return mock data
  
  console.log('Generating copy with:', { prompt, framework, businessProfile });
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Prepare the business context if a profile is provided
  let businessContext = '';
  if (businessProfile) {
    businessContext = `
Business Name: ${businessProfile.name}
${businessProfile.industry ? `Industry: ${businessProfile.industry}` : ''}
${businessProfile.target_audience ? `Target Audience: ${businessProfile.target_audience}` : ''}
${businessProfile.unique_value_proposition ? `Unique Value Proposition: ${businessProfile.unique_value_proposition}` : ''}
${businessProfile.pain_points ? `Pain Points: ${businessProfile.pain_points}` : ''}
${businessProfile.brand_voice ? `Brand Voice: ${businessProfile.brand_voice}` : ''}
    `.trim();
  }
  
  // Generate framework-specific mock response
  if (framework) {
    switch (framework) {
      case CopywritingFramework.AIDA:
        return generateAIDAResponse(prompt, businessContext);
      case CopywritingFramework.PAS:
        return generatePASResponse(prompt, businessContext);
      case CopywritingFramework.BAB:
        return generateBABResponse(prompt, businessContext);
      default:
        return generateGenericResponse(prompt, framework, businessContext);
    }
  }
  
  // Generic response for no framework
  return generateGenericResponse(prompt, null, businessContext);
}

// Helper function to generate AIDA framework response
function generateAIDAResponse(prompt: string, businessContext: string): string {
  return `# AIDA Copywriting Framework

## Attention
Imagine waking up every morning feeling energized and ready to tackle the day. No more groggy starts or mid-afternoon crashes. That's the promise of our revolutionary approach to health and wellness.

## Interest
Our scientifically-backed method combines ancient wisdom with modern nutritional science to create a personalized plan that works with your unique body chemistry. Unlike one-size-fits-all solutions, we analyze your specific needs and lifestyle factors.

## Desire
Picture yourself with sustained energy throughout the day, improved mental clarity, and the physical vitality to enjoy the activities you love. Our clients report an average 73% increase in energy levels within just 14 days of following our program.

## Action
Start your transformation today by booking a free consultation on our website. The first 50 people to sign up this week will receive a complimentary wellness assessment valued at $199. Don't wait to feel better - your future self will thank you.

---
Prompt: "${prompt}"
${businessContext ? `\nBusiness Context:\n${businessContext}` : ''}`;
}

// Helper function to generate PAS framework response
function generatePASResponse(prompt: string, businessContext: string): string {
  return `# Problem-Agitate-Solution Framework

## Problem
Are you tired of complex software that requires a PhD just to create a simple invoice? Small business owners waste an average of 5 hours per week fighting with complicated accounting systems.

## Agitate
This wasted time isn't just frustrating—it's costing you real money. That's 20 hours a month or 240 hours a year that could be spent growing your business or enjoying time with family. Not to mention the constant worry about whether you've set things up correctly for tax season.

## Solution
Introducing SimpleBooks: accounting software specifically designed for non-accountants. Our intuitive interface requires zero financial background, automatically categorizes expenses, and generates tax-ready reports with one click. 

Our customers save an average of 4 hours per week on financial tasks. At your hourly rate, that could mean thousands of dollars back in your pocket each year.

Sign up for a 30-day free trial today—no credit card required. Join the 10,000+ small business owners who've simplified their financial lives with SimpleBooks.

---
Prompt: "${prompt}"
${businessContext ? `\nBusiness Context:\n${businessContext}` : ''}`;
}

// Helper function to generate BAB framework response
function generateBABResponse(prompt: string, businessContext: string): string {
  return `# Before-After-Bridge Framework

## Before
Remember when planning a trip meant hours of research, dozens of browser tabs, and the constant worry that you might be missing out on the best experiences or overpaying for accommodations?

## After
Imagine planning your perfect vacation in under 30 minutes, with personalized recommendations from locals, guaranteed best prices, and a curated itinerary that matches your unique travel style—all while saving an average of 23% compared to booking through traditional channels.

## Bridge
TravelGenius makes this possible through our AI-powered platform that analyzes thousands of data points to create your ideal trip. Our network of local experts in 120+ countries verifies each recommendation, ensuring authentic experiences you won't find in typical tourist guides.

Simply tell us your preferences, budget, and travel dates, and within minutes you'll have a complete itinerary that you can book with a single click. Plus, our 24/7 concierge service means you always have support before and during your journey.

Ready to revolutionize how you travel? Try TravelGenius free for your next adventure.

---
Prompt: "${prompt}"
${businessContext ? `\nBusiness Context:\n${businessContext}` : ''}`;
}

// Helper function to generate generic response
function generateGenericResponse(prompt: string, framework: CopywritingFramework | null, businessContext: string): string {
  return `# Copywriting Response${framework ? ` using ${framework}` : ''}

Based on your request, here's a draft of marketing copy that you can use:

The future of digital experience is here, and it's more intuitive than you ever imagined. Introducing our breakthrough platform that seamlessly connects your workflow, automates repetitive tasks, and delivers insights that transform how you make decisions.

What makes us different? While others offer complicated tools that require weeks of training, our solution works the way you do—adapting to your needs rather than forcing you to adapt to it. The result is 40% less onboarding time and a 67% increase in team adoption rates.

Our clients report saving an average of 12 hours per week per employee. For a team of 20, that's nearly 12,000 hours per year—time that can be reinvested in innovation and growth.

Ready to see what your business can accomplish when technology finally works for you, not against you? Schedule a personalized demo today and discover why industry leaders are calling this "the most significant productivity advancement in a decade."

---
Prompt: "${prompt}"
${businessContext ? `\nBusiness Context:\n${businessContext}` : ''}`;
} 