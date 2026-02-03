import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";

// VARIABILI AMBIENTE (Railway)
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Controllo base (evita crash)
if (!DISCORD_TOKEN || !DISCORD_CHANNEL_ID || !TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error("❌ Variabili ambiente mancanti");
  process.exit(1);
}

// Client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`🤖 Connesso come ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  try {
    // ignora bot
    if (message.author.bot) return;

    // solo un canale
    if (message.channel.id !== DISCORD_CHANNEL_ID) return;

    const username = message.author.username;

    // 📸 SE CI SONO ALLEGATI (IMMAGINI)
    if (message.attachments.size > 0) {
      for (const attachment of message.attachments.values()) {
        // manda solo immagini
        if (!attachment.contentType?.startsWith("image/")) continue;

        const caption = `👤 *${username}*\n${message.content || ""}`;

        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            photo: attachment.url,
            caption,
            parse_mode: "Markdown"
          })
        });
      }
      return;
    }

    // 📝 SOLO TESTO
    if (!message.content) return;

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

  } catch (err) {
    console.error("❌ Errore Discord → Telegram:", err);
  }
});

client.login(DISCORD_TOKEN);
