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

client.on('ready', () => {
  console.log('\n✅ [PASSERELLE WHATSAPP DIGICOUTURE] Connectée et prête !');
});

client.on('auth_failure', (msg) => {
  console.error('❌ Échec d\'authentification WhatsApp:', msg);
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
