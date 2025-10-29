/**
 * Assistant Routes (Chatbot-only)
 * Decoupled from OCR/Upload. Keeps simple in-memory sessions and uses LLM for responses.
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { chatComplete, getConfig: getLLMConfig } = require('../../services/llmClient');
const storePagesService = require('../../services/storePagesService');
const mailService = require('../../services/mailService');

// --- Simple in-memory chat sessions (ephemeral; swap to Redis/DB later) ---
const chatSessions = new Map(); // sessionId -> { history: [{role, content, ts}], createdAt }
function getOrCreateSession(sessionId) {
  let id = sessionId || crypto.randomUUID();
  if (!chatSessions.has(id)) {
    chatSessions.set(id, { history: [], createdAt: Date.now() });
  }
  return { id, session: chatSessions.get(id) };
}

// Lightweight local assistant for offline fallback (pattern-based)
function localAssistantReply(input, context = {}) {
  const msg = String(input || '').trim();
  const m = msg.toLowerCase();
  const isStorefront = context?.page === 'storefront';

  // Storefront-specific fallback (customer support)
  if (isStorefront) {
    if (/^\s*(hi|hello|hey)\b/i.test(msg)) {
      return "Hi! I'm here to help you with your questions about orders, shipping, returns, or anything else. How can I assist you today?";
    }
    if (/(shipping|delivery|ship)/i.test(m)) {
      return "We offer multiple shipping options through JNT Express and SPX. Metro Manila delivery takes 1-2 days, while provincial delivery takes 3-5 days. We also offer same-day delivery for Metro Manila orders placed before 2 PM.";
    }
    if (/(track|tracking)/i.test(m)) {
      return "You can track your order using the tracking number sent to your email. Visit our tracking page or contact our support team.";
    }
    if (/(return|refund)/i.test(m)) {
      return "We accept returns within 7 days of delivery. Items must be in original condition with tags attached. Please contact our support team to initiate a return.";
    }
    if (/(payment|pay|card|gcash|paypal)/i.test(m)) {
      return "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, GCash, PayMaya, and bank transfers. All payments are processed securely.";
    }
    if (/(bulk|discount)/i.test(m)) {
      return "Yes! We offer special pricing for bulk orders. Contact us directly for custom quotes on orders over 50 items.";
    }
    if (/(contact|support|email|phone)/i.test(m)) {
      return "You can reach us through our live chat widget, email at kitschstudioofficial@gmail.com, or WhatsApp. Our support team is available Monday to Friday, 9 AM to 6 PM.";
    }
    return "I'm here to help! For specific questions about your order, please contact our support team at kitschstudioofficial@gmail.com or use our live chat for immediate assistance.";
  }

  // Bookkeeper fallback (internal business processes)
  const suggest = '\n\nYou can try:\n• "Categorize recent transactions"\n• "Generate monthly report for August"\n• "Upload receipts"';

  // Prefer intent answers over greetings if the message contains more than a greeting
  const isGreeting = /\b(hi|hello|hey|yo|sup)\b/i.test(msg);
  const hasIntent = /(what\s+is|explain|how\s+does|categor|report|summary|monthly|statement|upload|receipt|invoice|excel|csv|file|cash\s*(vs|and)?\s*accrual|accrual\s*(vs|and)?\s*cash|ebitda|cogs|cost of goods|gross\s*(margin|profit)|net\s*(profit|income)|accounts\s*(receivable|payable)|a\s*r\b|a\s*p\b|depreciation|amortization)/i.test(m);
  if (isGreeting && !hasIntent) {
    return "Hi! I'm your AI Bookkeeper. I can categorize transactions, extract data from receipts, and generate quick reports." + suggest;
  }
  if (/(what\s+is|explain|how\s+does).*(ai|bookkeep)/i.test(msg) || /ai\s*bookkeep/i.test(m)) {
    if (/bookkeep/i.test(m)) {
      return "AI bookkeeping uses automation to extract data from receipts/invoices, auto‑categorize transactions, and build summaries so you spend less time on manual entry. Upload files in 'Upload Process' and I'll handle extraction; then ask me to categorize or report.";
    }
    return "AI helps read receipts, categorize transactions, and generate summaries. Ask me to categorize or generate a monthly report.";
  }
  if (/^\s*what\s+is\s+.+/i.test(msg)) {
    return "I can help with general questions too. For the best answers, enable the LLM fallback (set LLM_API_KEY in backend/.env).";
  }
  if (/categor/i.test(m)) {
    return "To categorize, upload receipts or a CSV/XLSX in Upload Process. Then ask 'categorize recent transactions'.";
  }
  if (/(report|summary|monthly|statement)/i.test(m)) {
    return "I can generate a monthly summary once your data is in. After uploading, ask 'generate monthly report for <month>'.";
  }
  if (/(upload|receipt|invoice|excel|csv|file)/i.test(m)) {
    return "Use the Upload Process to send receipts (PDF/images) or Excel/CSV files. I'll extract totals, dates, and line items automatically.";
  }
  if (/(cash\s*(vs|and)?\s*accrual|accrual\s*(vs|and)?\s*cash)/i.test(m)) {
    return "Cash vs Accrual — Cash: record when money moves. Accrual: record when earned/incurred. Accrual gives more accurate period reporting.";
  }
  if (/ebitda/i.test(m)) {
    return "EBITDA = Net Income + Interest + Taxes + Depreciation + Amortization — a proxy for operating performance.";
  }
  if (/(cogs|cost of goods)/i.test(m)) {
    return "COGS are direct costs to produce/sell goods: beginning inventory + purchases − ending inventory.";
  }
  if (/(gross\s*(margin|profit)|net\s*(profit|income))/i.test(m)) {
    return "Gross profit = Revenue − COGS; Gross margin = Gross ÷ Revenue; Net profit = Revenue − (COGS + Opex + Interest + Taxes).";
  }
  if (/(accounts\s*receivable|a\s*r\b)/i.test(m)) {
    return "Accounts Receivable (AR): invoices you've issued but not yet collected.";
  }
  if (/(accounts\s*payable|a\s*p\b)/i.test(m)) {
    return "Accounts Payable (AP): bills you owe suppliers that you haven't paid yet.";
  }
  if (/(depreciation|amortization)/i.test(m)) {
    return "Depreciation (tangible) / amortization (intangible) spread asset cost over useful life — non‑cash expense per period.";
  }
  if (/^\s*(explain|tell\s+me\s+about)\b/i.test(msg)) {
    return "I can explain bookkeeping concepts like cash vs accrual, EBITDA, COGS, margins, AR/AP, and financial statements.";
  }
  return (process.env.ASSISTANT_FALLBACK_MESSAGE || "Assistant is warming up. Please try again in a moment.") + suggest;
}

/**
 * GET /api/assistant/health
 */
router.get('/health', (req, res) => {
  const llmCfg = getLLMConfig();
  const configured = Boolean(llmCfg.apiKey);
  res.json({ success: true, data: { configured, source: 'llm' } });
});

/**
 * GET /api/assistant/faqs/:subdomain
 * Get FAQs for a store by subdomain (public endpoint for storefront)
 */
router.get('/faqs/:subdomain', async (req, res) => {
  try {
    const { subdomain } = req.params;
    
    if (!subdomain) {
      return res.status(400).json({ success: false, message: 'Subdomain is required' });
    }

    // Get user ID from subdomain
    const { supabase } = require('../../services/supabaseClient');
    
    // Get user by subdomain from shop_info table
    const { data: shopInfo, error: shopError } = await supabase
      .from('shop_info')
      .select('user_id')
      .eq('shop_name', subdomain)
      .single();

    if (shopError || !shopInfo) {
      console.error('Error fetching shop info:', shopError);
      // Return empty FAQs array if shop not found
      return res.json({ success: true, data: [] });
    }

    // Get FAQ chatbot items for this user
    const items = await storePagesService.getFAQChatbotItems(shopInfo.user_id);
    
    // Filter to only active FAQs
    const activeFAQs = items.filter(item => item.is_active).map(item => ({
      id: item.id,
      question: item.question,
      answer: item.answer
    }));

    res.json({ success: true, data: activeFAQs });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.json({ success: true, data: [] });
  }
});

/**
 * POST /api/assistant/message
 */
router.post('/message', express.json(), async (req, res) => {
  try {
    const { message, sessionId, context } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'message is required' });
    }

    const { id, session } = getOrCreateSession(sessionId);
    session.history.push({ role: 'user', content: message, ts: Date.now() });
    session.history = session.history.slice(-20);

    const payload = {
      type: 'ai_assistant_message',
      sessionId: id,
      message,
      history: session.history,
      context: { ...context, app: 'STUDIO360', page: context?.page || 'ai-bookkeeper' },
    };

    // Use LLM (Groq) as primary response method
    const llmCfg = getLLMConfig();
    
    if (llmCfg.apiKey) {
      try {
        // Determine system message based on context
        const storeName = context?.storeName || 'the store';
        const isStorefront = context?.page === 'storefront';
        
        let system = '';
        if (isStorefront) {
          // Storefront customer support context
          system = `You are a friendly customer support assistant for ${storeName}. Answer questions about products, orders, shipping, returns, and general inquiries. Be helpful, professional, and concise. If the seller is offline, you are handling the customer inquiry automatically via AI.`;
        } else {
          // Bookkeeper context
          system = 'You are the STUDIO360 AI assistant. Be concise, accurate, and helpful. If the user asks about bookkeeping features, briefly guide them to upload receipts, categorize transactions, or generate reports.';
        }
        
        const llmReply = await chatComplete({
          system,
          messages: [
            ...session.history.slice(0, -1).map(h => ({ role: h.role, content: String(h.content || '') })),
            { role: 'user', content: String(message) },
          ],
          temperature: 0.3,
          maxTokens: isStorefront ? 400 : 500,
        });
        session.history.push({ role: 'assistant', content: llmReply, ts: Date.now() });
        
        // ALWAYS save storefront messages to mail for seller to see
        if (isStorefront) {
          try {
            console.log('[Chatbot] Saving storefront message to mail for store:', storeName);
            const { supabase } = require('../../services/supabaseClient');
            
            // Get user ID from shop_name/storeName
            const { data: shopInfo, error: shopError } = await supabase
              .from('shop_info')
              .select('user_id')
              .eq('shop_name', storeName)
              .single();
            
            console.log('[Chatbot] Shop lookup result:', { shopInfo, shopError });
            
            if (shopInfo?.user_id) {
              // Get customer info from context
              const customerEmail = context?.userInfo?.email || context?.email || 'no-email@customer.tmp';
              const customerName = context?.userInfo?.firstName && context?.userInfo?.lastName
                ? `${context.userInfo.firstName} ${context.userInfo.lastName}`
                : context?.name || 'Customer';
              
              console.log('[Chatbot] Processing mail for customer:', { 
                userId: shopInfo.user_id, 
                customerName, 
                customerEmail 
              });
              
              // Check if there's an existing conversation from this customer today
              const existingMail = await mailService.findExistingMailToday(shopInfo.user_id, customerEmail);
              
              if (existingMail) {
                console.log('[Chatbot] Found existing conversation, appending:', existingMail.id);
                // Append to existing conversation
                await mailService.appendToConversation(existingMail.id, message, llmReply, customerName);
              } else {
                console.log('[Chatbot] Creating new mail entry');
                // Create new mail entry for the seller to see in their inbox
                const mailResult = await mailService.createMail(shopInfo.user_id, {
                  from_name: customerName,
                  from_email: customerEmail,
                  to_email: `kitschstudioofficial@gmail.com`,
                  subject: customerEmail === 'no-email@customer.tmp' 
                    ? `New Chat Message from ${storeName}` 
                    : `Chat from ${customerName}`,
                  message: message,
                  type: 'received',
                  source: 'chatbot',
                  status: 'pending',
                  labels: ['inbox'],
                  priority: customerEmail === 'no-email@customer.tmp' ? 'high' : 'normal',
                  metadata: {
                    chatbotSession: id,
                    storeName: storeName,
                    aiReply: llmReply,
                    hasEmail: customerEmail !== 'no-email@customer.tmp',
                    timestamp: new Date().toISOString(),
                    conversation: [{
                      timestamp: new Date().toISOString(),
                      customerMessage: message,
                      aiReply: llmReply,
                      customerName: customerName
                    }]
                  }
                });
                
                console.log('[Chatbot] Mail creation result:', mailResult);
              }
            } else {
              console.warn('[Chatbot] Shop not found for store:', storeName);
            }
          } catch (mailError) {
            console.error('[Chatbot] Error saving chat message to mail:', mailError);
            // Don't fail the request if mail save fails
          }
        }
        
        return res.json({ success: true, data: { sessionId: id, reply: llmReply, source: 'groq' } });
      } catch (e) {
        console.warn('LLM (Groq) error:', e.message || e);
        // fall through to local assistant
      }
    }

    // Fallback to local assistant if LLM is not available or fails
    const hint = localAssistantReply(message, payload.context);
    session.history.push({ role: 'assistant', content: hint, ts: Date.now() });
    return res.json({ success: true, data: { sessionId: id, reply: hint, source: 'fallback' } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;


