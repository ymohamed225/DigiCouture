import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import express from 'express';

const app = express();
app.use(express.json());

// Initialisation du client WhatsApp Web via Microsoft Edge ou Chrome
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', (qr) => {
  console.log('\n======================================================');
  console.log('📱 SCANNEZ CE QR CODE AVEC VOTRE WHATSAPP SUR MOBILE :');
  console.log('======================================================\n');
  qrcode.generate(qr, { small: true });
});

let isReady = false;

client.on('ready', () => {
  isReady = true;
  console.log('\n✅ [PASSERELLE WHATSAPP DIGICOUTURE] Connectée et prête !');
});

client.on('auth_failure', (msg) => {
  console.error('❌ Échec d\'authentification WhatsApp:', msg);
});

// Page d'accueil visuelle de statut de la passerelle
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Passerelle WhatsApp DigiCouture</title>
        <meta charset="utf-8">
        <style>
          body { font-family: system-ui, sans-serif; background: #0F172A; color: #FFFFFF; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #1E293B; border: 2px solid #D4AF37; padding: 2.5rem; border-radius: 20px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); max-width: 450px; }
          h1 { color: #D4AF37; margin-bottom: 0.5rem; font-size: 1.6rem; }
          p { color: #94A3B8; font-size: 0.95rem; }
          .status { display: inline-block; padding: 0.6rem 1.4rem; border-radius: 99px; background: ${isReady ? '#10B981' : '#F59E0B'}; color: #FFF; font-weight: bold; margin-top: 1.25rem; font-size: 0.9rem; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>👑 Passerelle WhatsApp DigiCouture</h1>
          <p>Serveur API d'arrière-plan actif sur le port 8080</p>
          <div class="status">${isReady ? '✅ Connectée et Prête' : '⏳ Initialisation en cours...'}</div>
        </div>
      </body>
    </html>
  `);
});

// Endpoint d'envoi compatible Open-WA / DigiCouture (http://localhost:8080/sendText)
app.post('/sendText', async (req, res) => {
  try {
    const { to, content, message } = req.body;
    const rawTo = (to || '').replace('@c.us', '').replace(/[^0-9]/g, '');
    const text = content || message;

    if (!rawTo || !text) {
      return res.status(400).json({ error: 'Numéro destinataire ou message manquant' });
    }

    const cleanPhone = rawTo.startsWith('225') ? rawTo : `225${rawTo}`;
    const chatId = `${cleanPhone}@c.us`;

    await client.sendMessage(chatId, text);
    
    console.log(`✅ [WhatsApp Envoyé] Réf: +${cleanPhone} | Message: "${text.slice(0, 45)}..."`);
    return res.json({ success: true, status: 'SENT' });
  } catch (err) {
    console.error('❌ Erreur d\'envoi WhatsApp:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

client.initialize();

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`\n🚀 Passerelle WhatsApp DigiCouture démarrée sur http://localhost:${PORT}`);
  console.log('Connexion à WhatsApp Web en cours...\n');
});
