import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";

// ===== RIGA INNOCUA (per trigger deploy) =====
console.log("🚀 Deploy Discord → Telegram");

// ===== VARIABILI =====
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!DISCORD_TOKEN || !DISCORD_CHANNEL_ID || !TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error("❌ Variabili ambiente mancanti");
  process.exit(1);
}

// ===== DISCORD =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`🤖 Discord connesso come ${client.user.tag}`);
});

// ===== DISCORD → TELEGRAM =====
client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;
    if (message.channel.id !== DISCORD_CHANNEL_ID) return;

    const username = message.author.username;

    // 📎 ALLEGATI
    if (message.attachments.size > 0) {
      const attachments = Array.from(message.attachments.values());

      for (let i = 0; i < attachments.length; i++) {
        const a = attachments[i];
        const caption = i === 0
          ? `👤 *${username}*\n${message.content || ""}`
          : undefined;

        if (a.contentType?.startsWith("image/")) {
          await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              photo: a.url,
              caption,
              parse_mode: "Markdown"
            })
          });
        } else {
          await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              document: a.url,
              caption,
              parse_mode: "Markdown"
            })
          });
        }
      }
      return;
    }

    // 📝 SOLO TESTO
    if (message.content) {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: `👤 *${username}*\n${message.content}`,
          parse_mode: "Markdown"
        })
      });
    }

  } catch (err) {
    console.error("❌ Errore Discord → Telegram:", err);
  }
});

// ===== LOGIN =====
client.login(DISCORD_TOKEN);
