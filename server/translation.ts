import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TranslationResult {
  title: string;
  content: string;
  excerpt?: string;
}

export async function translateBlogPost(
  title: string,
  content: string,
  excerpt?: string
): Promise<TranslationResult> {
  try {
    // Prepare the content for translation
    const textToTranslate = {
      title,
      content: stripHtmlTags(content), // Remove HTML for cleaner translation
      excerpt: excerpt || ''
    };

    const prompt = `You are a professional translator specializing in legal immigration content. Translate the following blog post from English to Spanish. Maintain the professional tone and legal accuracy. Return the translation in JSON format with the same structure.

English content:
${JSON.stringify(textToTranslate, null, 2)}

Please translate to Spanish while:
1. Maintaining professional legal terminology
2. Preserving the meaning and context
3. Using appropriate Spanish immigration law terms
4. Keeping the tone formal and informative

Return only the JSON with translated content:`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator specializing in legal immigration content. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent translations
      max_tokens: 4000
    });

    const translatedContent = response.choices[0]?.message?.content;
    
    if (!translatedContent) {
      throw new Error('No translation received from OpenAI');
    }

    // Parse the JSON response
    const parsed = JSON.parse(translatedContent);
    
    // Restore HTML structure to content if original had HTML
    if (content.includes('<') && content.includes('>')) {
      parsed.content = restoreHtmlStructure(content, parsed.content);
    }

    return {
      title: parsed.title,
      content: parsed.content,
      excerpt: parsed.excerpt
    };

  } catch (error) {
    console.error('Translation error:', error);
    throw new Error(`Translation failed: ${error.message}`);
  }
}

// Helper function to strip HTML tags for translation
function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[^;]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper function to restore basic HTML structure after translation
function restoreHtmlStructure(originalHtml: string, translatedText: string): string {
  // Simple approach: if original had paragraphs, wrap translated text in paragraphs
  if (originalHtml.includes('<p>')) {
    // Split translated text into paragraphs and wrap each in <p> tags
    const paragraphs = translatedText.split('\n\n').filter(p => p.trim());
    return paragraphs.map(p => `<p>${p.trim()}</p>`).join('\n');
  }
  
  // If original had line breaks, preserve them
  if (originalHtml.includes('<br>')) {
    return translatedText.replace(/\n/g, '<br>');
  }
  
  // Default: return as paragraph
  return `<p>${translatedText}</p>`;
}

// Cache for translations to avoid repeated API calls
const translationCache = new Map<string, TranslationResult>();

export async function translateBlogPostCached(
  title: string,
  content: string,
  excerpt?: string
): Promise<TranslationResult> {
  const cacheKey = `${title}-${content.substring(0, 100)}-${excerpt || ''}`;
  
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  const translation = await translateBlogPost(title, content, excerpt);
  translationCache.set(cacheKey, translation);
  
  return translation;
}