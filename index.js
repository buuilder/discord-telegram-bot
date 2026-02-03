import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";

// Variabili ambiente impostate su Railway
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

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
  // Ignora messaggi dei bot
  if (message.author.bot) return;

  // Ignora messaggi da altri canali
  if (message.channel.id !== DISCORD_CHANNEL_ID) return;

  // Ignora messaggi vuoti
  if (!message.content) return;

  // Costruisci il testo da inviare su Telegram
  const text = `👤 *${message.author.username}*\n\n${message.content}`;

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: "Markdown" // permette il grassetto
      })
    });
  } catch (error) {
    console.error("Errore invio Telegram:", error);
  }
});

client.login(DISCORD_TOKEN);
