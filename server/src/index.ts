import { app } from './app.js';
import { initDatabase } from './config/database.js';
import { ENV } from './config/env.js';

async function startServer() {
  await initDatabase();
  app.listen(ENV.PORT, () => {
    console.log(`🚀 [Server] Serveur Backend TypeScript Modulaire DigiCouture VIP démarré sur http://localhost:${ENV.PORT}`);
  });
}

startServer();
