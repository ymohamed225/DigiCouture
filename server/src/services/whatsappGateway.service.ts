export interface SendWhatsappParams {
  recipient: string; // ex: "+2250701020304" ou "2250701020304"
  message: string;
  atelierId?: string;
}

export class WhatsappGatewayService {
  /**
   * Envoi automatique de message WhatsApp en direct via la passerelle API configurée
   */
  public static async sendMessage(params: SendWhatsappParams): Promise<{ sent: boolean; provider: string; error?: string }> {
    const cleanPhone = params.recipient.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('225') ? cleanPhone : `225${cleanPhone}`;

    const apiUrl = process.env.WHATSAPP_API_URL;
    const apiToken = process.env.WHATSAPP_API_TOKEN;
    const instanceId = process.env.WHATSAPP_INSTANCE_ID;
    const provider = (process.env.WHATSAPP_PROVIDER || 'ULTRAMSG').toUpperCase();

    if (!apiUrl && !apiToken && !instanceId) {
      console.log(`💬 [WhatsApp Gateway Simulé] Destination: +${formattedPhone} | Message: "${params.message.slice(0, 40)}..."`);
      return {
        sent: false,
        provider: 'FALLBACK_LOCAL',
        error: 'Passerelle API WhatsApp non configurée dans les variables d\'environnement (.env).'
      };
    }

    try {
      let response: Response;
      if (provider === 'ULTRAMSG') {
        const url = `${apiUrl || 'https://api.ultramsg.com'}/${instanceId}/messages/chat`;
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            token: apiToken || '',
            to: `+${formattedPhone}`,
            body: params.message
          })
        });
      } else if (provider === 'GREENAPI') {
        const url = `${apiUrl || 'https://api.green-api.com'}/waInstance${instanceId}/sendMessage/${apiToken}`;
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: `${formattedPhone}@c.us`,
            message: params.message
          })
        });
      } else if (provider === 'TWILIO') {
        const accountSid = instanceId || '';
        const authToken = apiToken || '';
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            From: process.env.WHATSAPP_SENDER || 'whatsapp:+14155238886',
            To: `whatsapp:+${formattedPhone}`,
            Body: params.message
          })
        });
      } else if (provider === 'OPENWA') {
        // Open-WA (@open-wa/wa-automate REST Server API)
        const targetUrl = apiUrl || 'http://localhost:8080/sendText';
        response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(apiToken ? { 'Authorization': `Bearer ${apiToken}` } : {})
          },
          body: JSON.stringify({
            to: `${formattedPhone}@c.us`,
            content: params.message,
            message: params.message
          })
        });
      } else {
        // Generic Webhook / REST Gateway API
        response = await fetch(apiUrl!, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(apiToken ? { 'Authorization': `Bearer ${apiToken}` } : {})
          },
          body: JSON.stringify({
            phone: formattedPhone,
            message: params.message,
            atelierId: params.atelierId
          })
        });
      }

      if (response.ok) {
        console.log(`✅ [WhatsApp Gateway] Message transmis avec succès à +${formattedPhone} via ${provider}`);
        return { sent: true, provider };
      } else {
        const errText = await response.text().catch(() => '');
        console.error(`❌ [WhatsApp Gateway] Erreur HTTP ${response.status} de la passerelle ${provider}:`, errText);
        return { sent: false, provider, error: `HTTP ${response.status}: ${errText}` };
      }
    } catch (err: any) {
      console.error(`❌ [WhatsApp Gateway] Échec de connexion réseau à la passerelle :`, err.message);
      return { sent: false, provider, error: err.message };
    }
  }
}
