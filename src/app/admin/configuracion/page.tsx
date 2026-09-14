import type { Metadata } from 'next';
import { Settings, Database, Palette, Info, CloudOff, Cloud } from 'lucide-react';
import { isDbConfigured } from '@/lib/data';
import { LocalDataPanel } from '@/components/admin/LocalDataPanel';

export const metadata: Metadata = {
  title: 'Configuración',
};

export default async function AdminConfiguracionPage() {
  const dbConfigured = isDbConfigured();

  const renderRows = [
    ['Almacenamiento', dbConfigured ? 'Turso (remoto)' : 'Modo demostración (memoria)'],
    ['Búsqueda', 'Texto en inglés y español, con sinónimos'],
    ['Idiomas', 'Inglés (término) → Español (traducción)'],
    ['Favoritos', 'Favoritos y historial en el navegador'],
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white">Configuración</h2>
        <p className="text-sm text-[#8BA3BF]">
          Información general y preferencias de la aplicación.
        </p>
      </div>

      {/* Estado de la base de datos */}
      <section className="rounded-xl border border-[rgba(0,140,255,0.15)] bg-[#081B32] p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
          <Database size={15} className="text-[#00AAFF]" />
          Base de datos
        </h3>
        <div
          className={
            'flex items-start gap-3 rounded-lg border px-4 py-3 ' +
            (dbConfigured
              ? 'border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.08)]'
              : 'border-[rgba(250,204,21,0.3)] bg-[rgba(250,204,21,0.08)]')
          }
        >
          {dbConfigured ? (
            <Cloud size={18} className="mt-0.5 shrink-0 text-[#34D399]" />
          ) : (
            <CloudOff size={18} className="mt-0.5 shrink-0 text-[#FCD34D]" />
          )}
          <div>
            <p className="text-sm font-semibold text-white">
              {dbConfigured
                ? 'Turso configurado'
                : 'Modo demostración activo'}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[#8BA3BF]">
              {dbConfigured
                ? 'La aplicación usa Turso (libsql) como base de datos y gestiona su propia autenticación con sesiones.'
                : 'No se detectaron las variables de entorno de Turso. Los datos se guardan en memoria del servidor y se pierden al reiniciar. Agrega TURSO_DATABASE_URL y TURSO_AUTH_TOKEN en el archivo .env.local para conectar a Turso.'}
            </p>
          </div>
        </div>
      </section>

      {/* Datos locales */}
      <section className="rounded-xl border border-[rgba(0,140,255,0.15)] bg-[#081B32] p-5">
        <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-white">
          <Info size={15} className="text-[#00AAFF]" />
          Datos locales del navegador
        </h3>
        <p className="mb-4 text-xs text-[#8BA3BF]">
          Los favoritos y el historial del sitio público se guardan en el navegador. Puedes borrarlos desde aquí.
        </p>
        <LocalDataPanel />
      </section>

      {/* Apariencia */}
      <section className="rounded-xl border border-[rgba(0,140,255,0.15)] bg-[#081B32] p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
          <Palette size={15} className="text-[#00AAFF]" />
          Tema de la interfaz
        </h3>
        <div className="flex flex-wrap items-end gap-3">
          {[
            ['Fondo', '#06152A'],
            ['Panel', '#081B32'],
            ['Panel claro', '#0A203A'],
            ['Primario', '#008CFF'],
            ['Primario claro', '#147EFF'],
            ['Acento', '#00AAFF'],
          ].map(([label, color]) => (
            <div key={color} className="flex flex-col items-center gap-1.5">
              <span
                className="h-12 w-12 rounded-xl border border-white/10 shadow-inner"
                style={{ background: color }}
              />
              <span className="text-[10px] text-[#4A6A8A]">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Info */}
      <section className="rounded-xl border border-[rgba(0,140,255,0.15)] bg-[#081B32] p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
          <Settings size={15} className="text-[#00AAFF]" />
          Información
        </h3>
        <ul className="space-y-2.5">
          {renderRows.map(([label, value]) => (
            <li key={label} className="flex items-start justify-between gap-4 text-xs">
              <span className="text-[#4A6A8A]">{label}</span>
              <span className="text-right text-white">{value}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}