import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

const {
  DISCORD_TOKEN,
  GUILD_ID, // jeśli nie używasz – można usunąć
  CHANNEL_ID,
  MAKE_RETURN_WEBHOOK
} = process.env;

// Endpoint do otrzymywania promptu z Make i wysyłania do MidJourney
app.post('/generate', async (req, res) => {
  const prompt = req.body.prompt;

  try {
    await axios.post(
      `https://discord.com/api/v9/channels/${CHANNEL_ID}/messages`,
      {
        content: `/imagine prompt: ${prompt}`
      },
      {
        headers: {
          Authorization: `Bot ${DISCORD_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Prompt wysłany:', prompt);
    res.status(200).send('Prompt wysłany!');
  } catch (error) {
    console.error('❌ Błąd przy wysyłaniu promptu:', error?.response?.data || error.message);
    res.status(500).send('Błąd przy wysyłaniu promptu');
  }
});

// Endpoint do odbierania wygenerowanego obrazu (np. z webhooka Discorda – tylko jeśli go masz)
app.post('/receive-image', async (req, res) => {
  const msg = req.body;

  if (msg.author?.username !== 'MidJourney Bot') return res.sendStatus(200);

  const image = msg.attachments?.[0]?.url;
  const prompt = msg.content;

  if (image) {
    try {
      await axios.post(MAKE_RETURN_WEBHOOK, {
        prompt,
        image_url: image
      });
      console.log('📤 Obraz przesłany do Make:', image);
    } catch (err) {
      console.error('❌ Błąd przy wysyłaniu do Make:', err.message);
    }
  }

  res.sendStatus(200);
});

// Start serwera
app.listen(process.env.PORT || 3000, () => {
  console.log('🚀 Serwer działa na porcie 3000');
});