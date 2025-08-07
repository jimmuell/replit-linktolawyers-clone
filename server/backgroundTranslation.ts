import OpenAI from 'openai';
import { storage } from './storage';
import type { BlogPost } from '@shared/schema';

let isTranslationRunning = false;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Translate a blog post to Spanish using OpenAI
 */
async function translateToSpanish(englishTitle: string, englishContent: string, englishExcerpt?: string): Promise<{
  spanishTitle: string;
  spanishContent: string;
  spanishExcerpt?: string;
}> {
  try {
    // Debug: console.log('Starting translation for:', englishTitle);

    // Create a comprehensive prompt for legal content translation
    const prompt = `You are a professional legal translator specializing in immigration law. Translate the following blog post content from English to Spanish, maintaining professional legal terminology and ensuring accuracy for Spanish-speaking clients seeking immigration legal services.

Please provide natural, professional Spanish translations that sound native and are appropriate for a legal services website. Maintain the same formatting, tone, and structure.

Title: ${englishTitle}

Content: ${englishContent}

${englishExcerpt ? `Excerpt: ${englishExcerpt}` : ''}

Please respond with a JSON object in this exact format:
{
  "spanishTitle": "translated title here",
  "spanishContent": "translated content here"${englishExcerpt ? ',\n  "spanishExcerpt": "translated excerpt here"' : ''}
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional legal translator specializing in immigration law and legal services. Provide accurate, natural Spanish translations suitable for Spanish-speaking clients.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent translations
      max_tokens: 4000
    });

    const responseContent = response.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response content from OpenAI');
    }

    // Parse the JSON response
    let translation;
    try {
      translation = JSON.parse(responseContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw response:', responseContent);
      
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = responseContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        try {
          translation = JSON.parse(jsonMatch[1]);
        } catch (fallbackError) {
          throw new Error(`Failed to parse JSON from response: ${responseContent.substring(0, 200)}...`);
        }
      } else {
        throw new Error(`Invalid JSON response: ${responseContent.substring(0, 200)}...`);
      }
    }
    
    // Debug: console.log('Translation completed successfully for:', englishTitle);
    return translation;

  } catch (error) {
    console.error('Translation error:', error);
    throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Process a single blog post for translation
 */
async function translateBlogPost(post: BlogPost): Promise<void> {
  try {
    // Debug: console.log(`Translating blog post: ${post.title} (ID: ${post.id})`);

    // Mark as in progress
    await storage.updateBlogPostTranslation(post.id, {
      spanishTitle: '',
      spanishContent: '',
      spanishExcerpt: '',
      translationStatus: 'in_progress'
    });

    // Perform translation
    const translation = await translateToSpanish(
      post.title,
      post.content,
      post.excerpt || undefined
    );

    // Update with completed translation
    await storage.updateBlogPostTranslation(post.id, {
      spanishTitle: translation.spanishTitle,
      spanishContent: translation.spanishContent,
      spanishExcerpt: translation.spanishExcerpt || '',
      translationStatus: 'completed'
    });

    // Debug: console.log(`Successfully translated blog post: ${post.title}`);

  } catch (error) {
    console.error(`Failed to translate blog post ${post.id}:`, error);
    
    // Mark as failed
    await storage.updateBlogPostTranslation(post.id, {
      spanishTitle: '',
      spanishContent: '',
      spanishExcerpt: '',
      translationStatus: 'failed'
    });
  }
}

/**
 * Background service to process pending translations
 */
export async function processTranslationQueue(): Promise<void> {
  if (isTranslationRunning) {
    // Debug: console.log('Translation process already running, skipping...');
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    console.warn('OpenAI API key not configured, skipping translation processing');
    return;
  }

  try {
    isTranslationRunning = true;
    console.log('Starting translation queue processing...');

    // Get posts that need translation
    const postsNeedingTranslation = await storage.getBlogPostsNeedingTranslation();
    
    if (postsNeedingTranslation.length === 0) {
      console.log('No posts need translation');
      return;
    }

    console.log(`Found ${postsNeedingTranslation.length} posts needing translation`);

    // Process one post at a time to avoid rate limits
    for (const post of postsNeedingTranslation) {
      await translateBlogPost(post);
      
      // Add a small delay between requests to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('Translation queue processing completed');

  } catch (error) {
    console.error('Error processing translation queue:', error);
  } finally {
    isTranslationRunning = false;
  }
}

/**
 * Start the background translation service with periodic processing
 */
export function startBackgroundTranslationService(): void {
  console.log('Starting background translation service...');
  
  // Process immediately on startup
  processTranslationQueue().catch(console.error);
  
  // Set up periodic processing every 5 minutes
  setInterval(() => {
    processTranslationQueue().catch(console.error);
  }, 5 * 60 * 1000); // 5 minutes
}

/**
 * Manually trigger translation for a specific post
 */
export async function triggerPostTranslation(postId: number): Promise<void> {
  const post = await storage.getBlogPost(postId);
  if (!post) {
    throw new Error('Blog post not found');
  }

  if (!post.isPublished) {
    throw new Error('Cannot translate unpublished posts');
  }

  await translateBlogPost(post);
}