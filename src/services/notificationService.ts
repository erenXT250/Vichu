// Notification Service for ntfy App and Secure Notifications

// Discord webhook disabled to protect against public GitHub crawler bots.
// To use Discord safely, use a webhook proxy or keep notifications on ntfy.
const DISCORD_WEBHOOK_URL = '';

// Subscribe to this private topic in the ntfy app (iOS / Android):
export const NTFY_TOPIC = 'vichu-alert-eren-8f92a1';

// Helper to send to Discord (only if configured and safe)
const sendToDiscord = async (content: string, embed?: {
  title?: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
}) => {
  if (!DISCORD_WEBHOOK_URL) return;

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

let hasNotifiedOpen = false;
export const notifySiteVisit = async () => {
  if (hasNotifiedOpen) return;
  hasNotifiedOpen = true;

  try {
    const isMobile = window.innerWidth < 768;
    const device = isMobile ? '📱 Mobile Device' : '💻 Desktop / Laptop';
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    sendToDiscord('👀 **Vichu opened the website!** ❤️', {
      title: 'Website Opened',
      description: 'Someone just opened the Vichu proposal website!',
      color: 0xff7597,
      fields: [
        { name: 'Device', value: device, inline: true },
        { name: 'Time', value: timeStr, inline: true },
      ],
    });

    sendToNtfy(`Vichu just opened your proposal website on ${device} at ${timeStr}!`, {
      title: '👀 Vichu Opened Website!',
      priority: 'high',
      tags: 'eyes,heart,love_letter',
    });
  } catch {}
};

let lastDodgeSentTime = 0;
export const notifyDodgeAttempt = async (attemptNumber: number, label: string) => {
  const now = Date.now();
  if (now - lastDodgeSentTime < 2500 && attemptNumber > 1) {
    return;
  }
  lastDodgeSentTime = now;

  try {
    sendToDiscord(`🙈 **Vichu tried to click NO!** (Attempt #${attemptNumber})`, {
      title: 'NO Button Dodged 🏃‍♂️💨',
      description: `Button text: **"${label}"**\nShe tried to click NO, but it playfully jumped away!`,
      color: 0xf59e0b,
    });

    sendToNtfy(`She tried to click NO (Attempt #${attemptNumber}: "${label}"), but the button leaped away! 🏃‍♂️💨`, {
      title: '🙈 Vichu Tried Clicking NO!',
      priority: 'default',
      tags: 'runner,sweat_smile',
    });
  } catch {}
};

export const notifyYesCelebration = async () => {
  try {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    sendToDiscord('🎉 **SHE SAID YES!** ❤️❤️❤️', {
      title: '🎊 Proposal Accepted! 🌹💍',
      description: '✨ **Vichu clicked YES!**\n\n"Thank you, Vichu ❤️ — Let\'s take it one day at a time."',
      color: 0x22c55e,
      fields: [
        { name: 'Result', value: 'ACCEPTED 🙈❤️', inline: true },
        { name: 'Time', value: timeStr, inline: true },
      ],
    });

    sendToNtfy('🎉 SHE SAID YES! Vichu clicked YES and accepted your proposal! Congratulations! 🌹💍', {
      title: '🎉 SHE SAID YES! ❤️💍',
      priority: 'urgent',
      tags: 'tada,heart,ring,sparkles',
    });
  } catch {}
};
