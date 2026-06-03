const https = require('https');

/* ---- Generic Claude API call ---- */
const callClaude = (messages, systemPrompt = '', maxTokens = 800) => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'x-api-key':          process.env.ANTHROPIC_API_KEY,
        'anthropic-version':  '2023-06-01',
        'content-type':       'application/json',
        'content-length':     Buffer.byteLength(body),
      },
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Invalid JSON from Claude API')); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
};

/* ---- Safely parse JSON from Claude (strips code fences) ---- */
const parseJSON = (text) => {
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

/* ---- Check ANTHROPIC_API_KEY is set ---- */
const hasApiKey = () => !!process.env.ANTHROPIC_API_KEY;

/* ================================================================
   PRODUCT RECOMMENDATIONS
   ================================================================ */
exports.getProductRecommendations = async (userHistory = [], browsedProducts = [], currentProduct = null) => {
  /* Graceful fallback if no API key */
  if (!hasApiKey()) {
    return {
      recommendations: [
        { category: 'Cookware',          reason: 'Popular in our store',        searchTerm: 'cookware'         },
        { category: 'Kitchen Utensils',  reason: 'Essential for every kitchen', searchTerm: 'kitchen utensils' },
        { category: 'Bakeware',          reason: 'Great for home baking',       searchTerm: 'bakeware'         },
      ],
      personalMessage: 'Here are some of our most popular collections.',
    };
  }

  const system = `You are a helpful AI for "Fabulous & More", a premium Nigerian kitchen store.
Suggest product categories based on customer browsing. Respond ONLY with valid JSON — no extra text.`;

  const prompt = `Customer data:
- Recently viewed: ${browsedProducts?.slice(0, 8).join(', ') || 'None yet'}
- Past purchases: ${userHistory?.join(', ') || 'None'}
- Currently viewing: ${currentProduct || 'Homepage'}

Return ONLY this JSON (no markdown, no explanation):
{"recommendations":[{"category":"string","reason":"string","searchTerm":"string"},{"category":"string","reason":"string","searchTerm":"string"},{"category":"string","reason":"string","searchTerm":"string"}],"personalMessage":"string"}`;

  try {
    const response = await callClaude([{ role: 'user', content: prompt }], system, 400);

    if (!response.content?.[0]?.text) {
      throw new Error(response.error?.message || 'Empty response from Claude');
    }

    return parseJSON(response.content[0].text);
  } catch (err) {
    console.error('[AI] Recommendations error:', err.message);
    /* Return sensible defaults so the UI doesn't break */
    return {
      recommendations: [
        { category: 'Cookware',         reason: 'Loved by our customers',      searchTerm: 'cookware'         },
        { category: 'Kitchen Utensils', reason: 'Must-have kitchen tools',     searchTerm: 'kitchen utensils' },
        { category: 'Bakeware',         reason: 'For the home baker in you',   searchTerm: 'bakeware'         },
      ],
      personalMessage: 'Explore our most popular categories.',
    };
  }
};

/* ================================================================
   INVENTORY INSIGHTS
   ================================================================ */
exports.getInventoryInsights = async (lowStockProducts = [], salesData = []) => {
  if (!hasApiKey()) {
    return {
      urgentActions:       ['Check and reorder low stock items'],
      reorderSuggestions:  [],
      insight:             'Enable the Anthropic API key for AI-powered inventory insights.',
    };
  }

  const system = `You are an inventory AI for "Fabulous & More". Give concise actionable insights. Respond ONLY with JSON.`;

  const prompt = `Low stock items: ${JSON.stringify(lowStockProducts.slice(0, 10))}
Return ONLY: {"urgentActions":["string"],"reorderSuggestions":[{"product":"string","quantity":0,"reason":"string"}],"insight":"string"}`;

  try {
    const response = await callClaude([{ role: 'user', content: prompt }], system, 400);
    return parseJSON(response.content[0].text);
  } catch (err) {
    console.error('[AI] Inventory error:', err.message);
    return { urgentActions: [], reorderSuggestions: [], insight: 'AI insights temporarily unavailable.' };
  }
};

/* ================================================================
   CHAT ASSISTANT
   ================================================================ */
exports.chatAssistant = async (message, conversationHistory = []) => {
  if (!hasApiKey()) {
    return "Hi! I'm the Fabulous & More assistant. Our AI chat needs an ANTHROPIC_API_KEY to be configured — please contact us via WhatsApp at +234 800 000 0000 for instant help!";
  }

  const system = `You are a friendly customer service assistant for "Fabulous & More", a premium kitchen utensil and hardware store in Nigeria.
Help customers find products, answer questions about orders, delivery and returns.
Be concise (2-3 sentences max), warm, and helpful. Prices are in Nigerian Naira (₦).
If you don't know something specific, direct them to WhatsApp: +234 800 000 0000.`;

  /* Build message history — keep last 8 turns to avoid token limits */
  const history = conversationHistory.slice(-8).map(m => ({
    role:    m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content || m.text || '',
  }));

  const messages = [...history, { role: 'user', content: message }];

  try {
    const response = await callClaude(messages, system, 300);
    if (!response.content?.[0]?.text) throw new Error('Empty response');
    return response.content[0].text;
  } catch (err) {
    console.error('[AI] Chat error:', err.message);
    return "Sorry, I'm having a moment! Please WhatsApp us at +234 800 000 0000 for instant help.";
  }
};