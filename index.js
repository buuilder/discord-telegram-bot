import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";

// ===== VARIABILI AMBIENTE =====
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!DISCORD_TOKEN || !DISCORD_CHANNEL_ID || !TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error("❌ Variabili ambiente mancanti");
  process.exit(1);
}

// ===== DISCORD CLIENT =====
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
    // ignora bot
    if (message.author.bot) return;

    // solo un canale
    if (message.channel.id !== DISCORD_CHANNEL_ID) return;

    const username = message.author.username;

    // 📎 SE CI SONO ALLEGATI (foto o file)
    if (message.attachments.size > 0) {
      const attachments = Array.from(message.attachments.values());

      for (let i = 0; i < attachments.length; i++) {
        const a = attachments[i];
        const caption = i === 0
          ? `👤 *${username}*\n${message.content || ""}`
          : undefined;

        // 📸 IMMAGINI
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
        } 
        // 📎 FILE (PDF, ZIP, DOC, VIDEO, AUDIO…)
        else {
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
      return; // evita doppio invio del testo
    }

    // 📝 SOLO TESTO
    if (message.content) {
      const text = `👤 *${username}*\n${message.content}`;

      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
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
