import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";

console.log("🚀 Deploy Discord → Telegram");

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!DISCORD_TOKEN || !DISCORD_CHANNEL_ID || !TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error("❌ Variabili ambiente mancanti");
  process.exit(1);
}

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

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;
    if (message.channel.id !== DISCORD_CHANNEL_ID) return;

    const username = message.author.username;
    let replyText = "";

    // 🔁 SE È UNA RISPOSTA
    if (message.reference?.messageId) {
      const replied = await message.channel.messages.fetch(message.reference.messageId);
      replyText = `↪️ In risposta a:\n${replied.author.username}: ${replied.content}\n\n`;
    }

    const finalText = `${replyText}👤 *${username}*\n${message.content || ""}`;

    // ALLEGATI
    if (message.attachments.size > 0) {
      for (const a of message.attachments.values()) {
        const method = a.contentType?.startsWith("image/")
          ? "sendPhoto"
          : "sendDocument";

        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/${method}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            [method === "sendPhoto" ? "photo" : "document"]: a.url,
            caption: finalText,
            parse_mode: "Markdown"
          })
        });
      }
      return;
    }

    // SOLO TESTO
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: finalText,
        parse_mode: "Markdown"
      })
    });

  } catch (err) {
    console.error("Errore Discord → Telegram:", err);
  }
});

client.login(DISCORD_TOKEN);
