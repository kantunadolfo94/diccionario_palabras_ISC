// ============================================================
// Setup de Turso: crea el schema y siembra datos de ejemplo.
// Uso: node scripts/turso-setup.mjs [--seed-only]
// Lee TURSO_DATABASE_URL y TURSO_AUTH_TOKEN desde .env.local
//   (o variables de entorno si ya existen).
// ============================================================
import { createClient } from '@libsql/client';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Cargar .env.local (sin pisar variables ya configuradas)
const envPath = join(root, '.env.local');
if (readFileExists(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
    if (m && process.env[m[1]] === undefined) {
      let value = m[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[m[1]] = value;
    }
  }
}

function readFileExists(p) {
  try {
    readFileSync(p, 'utf8');
    return true;
  } catch {
    return false;
  }
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('✗ Faltan TURSO_DATABASE_URL / TURSO_AUTH_TOKEN (revisa .env.local).');
  process.exit(1);
}

const seedOnly = process.argv.includes('--seed-only');
const client = createClient({ url, authToken });

async function run() {
  if (!seedOnly) {
    console.log('▶ Aplicando schema...');
    const schema = readFileSync(join(root, 'turso', 'schema.sql'), 'utf8');
    await client.executeMultiple(schema);
    console.log('  ✓ schema ok');
  }

  console.log('▶ Aplicando seed...');
  const seed = readFileSync(join(root, 'turso', 'seed.sql'), 'utf8');
  await client.executeMultiple(seed);
  console.log('  ✓ seed ok');

  const result = await client.execute(
    `SELECT
       (SELECT COUNT(*) FROM users) AS users,
       (SELECT COUNT(*) FROM categories) AS categories,
       (SELECT COUNT(*) FROM terms) AS terms,
       (SELECT COUNT(*) FROM related_terms) AS related,
       (SELECT COUNT(*) FROM daily_words) AS daily,
       (SELECT COUNT(*) FROM activity_logs) AS logs`
  );
  const r = result.rows[0] ?? {};
  console.log('Resumen:', JSON.stringify(r));
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('✗ Error:', err.message);
    process.exit(1);
  });