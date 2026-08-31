import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: Number(process.env.PORT || 5000),
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'digicouture_db',
  CINETPAY_API_KEY: process.env.CINETPAY_API_KEY || 'YOUR_CINETPAY_API_KEY',
  CINETPAY_SITE_ID: process.env.CINETPAY_SITE_ID || 'YOUR_CINETPAY_SITE_ID',
  CINETPAY_SECRET_KEY: process.env.CINETPAY_SECRET_KEY || 'YOUR_CINETPAY_SECRET_KEY',
  APP_URL: process.env.APP_URL || 'http://localhost:5000'
};
