import { Xendit } from 'xendit-node';

// Inisialisasi Xendit dengan API key sandbox
const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY || '',
  xenditURL: 'https://api.xendit.co', // URL default untuk sandbox dan production
});

// Export modul yang akan digunakan
export const Invoice = xenditClient.Invoice;

// Fungsi helper untuk menentukan apakah kita menggunakan mode sandbox
export const isSandboxMode = () => {
  return process.env.XENDIT_SECRET_KEY?.startsWith('xnd_development_');
};

export default xenditClient; 