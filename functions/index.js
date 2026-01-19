/**
 * Firebase Cloud Function to send new lead notifications to a Telegram group.
 * Uses secure environment variables set via the Firebase CLI (functions.config()).
 * * Bot Token: 8504567982:AAH-zlTGKNJyuRzYD3ksoNsHVUXxnyKjYhk
 * Chat ID:   -5004485288 (Pro Chelsea Group)
 */

const functions = require('firebase-functions');
const axios = require('axios');

// Get secure environment variables (These were set by your CLI commands)
const BOT_TOKEN = functions.config().telegram.token;
const CHAT_ID = functions.config().telegram.chat_id;


// 1. Listen for new documents created in the leads collection in Firestore
exports.notifyNewLeadTelegram = functions.firestore
    // This path watches for any new lead saved by your RepairPage.tsx
    .document('artifacts/{appId}/users/{userId}/leads/{leadId}')
    .onCreate(async (snap, context) => {
        
        const leadData = snap.data();

        // 2. Format the message content using Markdown for clarity
        const message = `🚨 *NEW REPAIR LEAD* 🚨\n\n` +
            `*Device:* ${leadData.model} (${leadData.device})\n` +
            `*Issue:* ${leadData.issue}\n` +
            `*Price:* $${leadData.quotePrice || 'N/A'}\n\n` +
            `*Store:* ${leadData.store}\n` +
            `*Contact Details:*\n` +
            `${leadData.email ? `📧 Email: ${leadData.email}\n` : ''}` +
            `${leadData.phone ? `📞 Phone: ${leadData.phone}\n` : ''}` +
            `\n---\n*Status:* ${leadData.status}`; 

        // 3. Send the message to Telegram
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

        try {
            await axios.post(telegramUrl, {
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown' 
            });
            console.log('Lead successfully sent to Telegram.');
        } catch (error) {
            console.error('Failed to send Telegram message. Check bot permissions in the group.', error.response ? error.response.data : error.message);
        }

        return null;
    });