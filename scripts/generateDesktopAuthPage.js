const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const TEMPLATE_PATH = path.join(__dirname, '..', 'public', 'desktop-auth.template.html');
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'desktop-auth.html');

const requiredKeys = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID',
];

const missingKeys = requiredKeys.filter((key) => !process.env[key]);
if (missingKeys.length) {
  throw new Error(
    `Missing required environment variables for desktop auth page: ${missingKeys.join(', ')}`
  );
}

const replacements = {
  '%REACT_APP_FIREBASE_API_KEY%': process.env.REACT_APP_FIREBASE_API_KEY,
  '%REACT_APP_FIREBASE_AUTH_DOMAIN%': process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  '%REACT_APP_FIREBASE_PROJECT_ID%': process.env.REACT_APP_FIREBASE_PROJECT_ID,
  '%REACT_APP_FIREBASE_STORAGE_BUCKET%': process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  '%REACT_APP_FIREBASE_MESSAGING_SENDER_ID%': process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  '%REACT_APP_FIREBASE_APP_ID%': process.env.REACT_APP_FIREBASE_APP_ID,
  '%REACT_APP_FIREBASE_MEASUREMENT_ID%': process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || '',
};

const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
const rendered = Object.entries(replacements).reduce(
  (content, [token, value]) => content.replace(new RegExp(token, 'g'), value),
  template,
);

fs.writeFileSync(OUTPUT_PATH, rendered);
console.log(`Desktop auth page generated at ${OUTPUT_PATH}`);
