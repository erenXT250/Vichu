// Notification Service for Discord Webhook & ntfy App

const DISCORD_WEBHOOK_URL =
  'https://discord.com/api/webhooks/1569952423848706098/UmITVG9pzpgngdf2J0-A9_y5rvSySe2Z_3iqZoPcnFDVj6pTYkGFxWhvCfW1Kol9R8Gi';

// You can subscribe to this topic in the ntfy app on iOS or Android:
export const NTFY_TOPIC = 'vichu-proposal-eren';

// Helper to send to Discord using FormData (avoids CORS preflight issues in browsers)
const sendToDiscord = async (content: string, embed?: {
  title?: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
}) => {
  try {
    const form = new FormData();
    const payload: { content: string; embeds?: any[] } = { content };
    if (embed) {
      payload.embeds = [
        {
          ...embed,
          timestamp: new Date().toISOString(),
          footer: { text: 'Vichu ❤️ Proposal Alert' },
        },
      ];
    }
    form.append('payload_json', JSON.stringify(payload));

    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      body: form,
    });
  } catch (err) {
    // Non-blocking error handling
    console.warn('Discord notification error:', err);
  }
};

// Helper to send push notification to ntfy app
const sendToNtfy = async (message: string, options: {
  title: string;
  priority?: 'min' | 'low' | 'default' | 'high' | 'urgent';
  tags?: string;
}) => {
  try {
    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      body: message,
      headers: {
        Title: options.title,
        Priority: options.priority || 'default',
        Tags: options.tags || 'heart',
      },
    });
  } catch (err) {
    console.warn('ntfy notification error:', err);
  }
};

// 1. When the website is opened
let hasNotifiedOpen = false;
export const notifySiteVisit = async () => {
  if (hasNotifiedOpen) return;
  hasNotifiedOpen = true;

  try {
    const isMobile = window.innerWidth < 768;
    const device = isMobile ? '📱 Mobile Device' : '💻 Desktop / Laptop';
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Discord alert
    sendToDiscord('👀 **Vichu opened the website!** ❤️', {
      title: 'Website Opened',
      description: 'Someone just opened the Vichu proposal website!',
      color: 0xff7597, // Pink
      fields: [
        { name: 'Device', value: device, inline: true },
        { name: 'Time', value: timeStr, inline: true },
      ],
    });

    // ntfy push notification
    sendToNtfy(`Vichu just opened your proposal website on ${device} at ${timeStr}!`, {
      title: '👀 Vichu Opened Website!',
      priority: 'high',
      tags: 'eyes,heart,love_letter',
    });
  } catch {}
};

// 2. When NO button is chased
let lastDodgeSentTime = 0;
export const notifyDodgeAttempt = async (attemptNumber: number, label: string) => {
  const now = Date.now();
  // Throttle to avoid spamming if user taps 5 times in 1 second
  if (now - lastDodgeSentTime < 2500 && attemptNumber > 1) {
    return;
  }
  lastDodgeSentTime = now;

  try {
    // Discord alert
    sendToDiscord(`🙈 **Vichu tried to click NO!** (Attempt #${attemptNumber})`, {
      title: 'NO Button Dodged 🏃‍♂️💨',
      description: `Button text: **"${label}"**\nShe tried to click NO, but it playfully jumped away!`,
      color: 0xf59e0b, // Amber
    });

    // ntfy push notification
    sendToNtfy(`She tried to click NO (Attempt #${attemptNumber}: "${label}"), but the button leaped away! 🏃‍♂️💨`, {
      title: '🙈 Vichu Tried Clicking NO!',
      priority: 'default',
      tags: 'runner,sweat_smile',
    });
  } catch {}
};

// 3. When YES is clicked!
export const notifyYesCelebration = async () => {
  try {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Discord alert
    sendToDiscord('🎉 **SHE SAID YES!** ❤️❤️❤️', {
      title: '🎊 Proposal Accepted! 🌹💍',
      description: '✨ **Vichu clicked YES!**\n\n"Thank you, Vichu ❤️ — Let\'s take it one day at a time."',
      color: 0x22c55e, // Bright Green celebration
      fields: [
        { name: 'Result', value: 'ACCEPTED 🙈❤️', inline: true },
        { name: 'Time', value: timeStr, inline: true },
      ],
    });

    // ntfy push notification (urgent alert)
    sendToNtfy('🎉 SHE SAID YES! Vichu clicked YES and accepted your proposal! Congratulations! 🌹💍', {
      title: '🎉 SHE SAID YES! ❤️💍',
      priority: 'urgent',
      tags: 'tada,heart,ring,sparkles',
    });
  } catch {}
};
