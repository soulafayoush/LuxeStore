import { NextRequest, NextResponse } from 'next/server';

// POST /api/search/ai-advice
// Generates personalized AI product recommendations based on user context
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, results, viewedProducts, currentCategory } = body;

    if (!query || !results || !Array.isArray(results)) {
      return NextResponse.json(
        { error: 'Query and results are required' },
        { status: 400 }
      );
    }

    // Build context for AI
    const contextParts: string[] = [];

    if (viewedProducts && viewedProducts.length > 0) {
      const names = viewedProducts
        .map((p: { name: string }) => p.name)
        .join(', ');
      contextParts.push(`The user has recently viewed: ${names}.`);
    }

    if (currentCategory) {
      contextParts.push(`The user is browsing the "${currentCategory}" category.`);
    }

    const resultList = results
      .slice(0, 5)
      .map((p: { name: string; id: string; price: number }) => `${p.name} (${p.price} SAR, id: ${p.id})`)
      .join(', ');
    contextParts.push(
      `The user searched for: "${query}". Found products: ${resultList}.`
    );

    // Try AI-powered advice generation
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default;
      const zai = await ZAI.create();

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a personal shopping advisor for a premium e-commerce store.
Based on the user's browsing history and current search, provide a short, personalized recommendation (2-3 sentences).
Be warm, helpful, and specific. Reference specific product names from the search results.
Format your response as JSON:
{
  "message": "Your personalized advice text",
  "reason": "Why you recommend these items",
  "suggestedProductIds": ["id1", "id2"]
}
Return ONLY valid JSON, no markdown.`,
          },
          { role: 'user', content: contextParts.join('\n') },
        ],
      });

      const content = completion.choices[0]?.message?.content;
      if (content) {
        const jsonStr = content
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        const advice = JSON.parse(jsonStr);

        const suggestedProducts = results.filter((p: { id: string }) =>
          advice.suggestedProductIds?.includes(p.id)
        );

        return NextResponse.json({
          success: true,
          advice: {
            message: advice.message,
            reason: advice.reason,
            products:
              suggestedProducts.length > 0
                ? suggestedProducts
                : results.slice(0, 2),
          },
        });
      }
    } catch (aiError) {
      console.warn('AI advice generation failed, using fallback:', aiError);
    }

    // Fallback advice
    return NextResponse.json({
      success: true,
      advice: {
        message: `Based on your search for "${query}", I found ${results.length} great options for you!`,
        reason: 'These products match your preferences closely.',
        products: results.slice(0, 2),
      },
    });
  } catch (error) {
    console.error('AI advice error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI advice' },
      { status: 500 }
    );
  }
}
