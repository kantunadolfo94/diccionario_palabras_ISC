// Genera el hash scrypt para un password (mismo formato que src/lib/auth.ts)
// Uso: node scripts/hash-password.mjs "mi-contraseña"
import { scryptSync, randomBytes } from 'node:crypto';

const password = process.argv[2] ?? 'admin123';
const salt = randomBytes(16).toString('hex');
const hash = scryptSync(password, salt, 64).toString('hex');
console.log(`${salt}:${hash}`);