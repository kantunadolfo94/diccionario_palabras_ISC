import {
  Cloud,
  Database,
  Shield,
  Network,
  Braces,
  Code2,
  BookOpen,
  Server,
  Terminal,
} from 'lucide-react';

export function HeroIllustration() {
  return (
    <div className="relative hidden select-none lg:block" aria-hidden>
      {/* Ambient glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-10 right-10 h-56 w-56 rounded-full bg-[#008CFF]/20 blur-3xl" />
        <div className="absolute bottom-0 -left-10 h-56 w-56 rounded-full bg-[#147EFF]/10 blur-3xl" />
      </div>

      {/* Laptop */}
      <div className="relative mx-auto w-[300px]">
        <div className="rounded-t-xl border border-[rgba(0,140,255,0.3)] bg-gradient-to-b from-[#123158] to-[#0B2142] p-3 shadow-[0_0_40px_rgba(0,140,255,0.2)]">
          <div className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-400/70" />
            <span className="h-2 w-2 rounded-full bg-amber-400/70" />
            <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
          </div>
          <div className="mt-3 rounded-md bg-[#060F22] p-3 font-mono text-[10px] leading-relaxed text-[#72C4FF]">
            <p className="text-[#008CFF]">const diccionario = {"{"}</p>
            <p className="pl-3">lingua: {'"'}en-es{'"'},</p>
            <p className="pl-3">terms: 25,</p>
            <p className="pl-3">comunidad: {'"'}ISC{'"'},</p>
            <p className="pl-3">open: <span className="text-[#3DDC84]">true</span>,</p>
            <p className="text-[#008CFF]">{"}"};</p>
            <p className="mt-1 text-[#4A6A8A]">{'// diccionario.sysdict.mx'}</p>
          </div>
        </div>
        {/* Laptop base */}
        <div className="mx-auto h-2 w-[70%] rounded-b-lg bg-gradient-to-r from-[#123158] to-[#0B2142] shadow-[0_8px_24px_rgba(0,120,255,0.25)]" />
        <div className="mx-auto h-1 w-[52%] rounded-full bg-[#0A1F3E]" />
      </div>

      {/* Floating tech icons */}
      <div className="absolute left-6 top-2 animate-[floatY_5s_ease-in-out_infinite] rounded-xl border border-[rgba(0,140,255,0.25)] bg-[#0A1F3E]/90 p-2.5 shadow-[0_4px_20px_rgba(0,140,255,0.2)]">
        <Cloud size={22} className="text-[#38BDF8]" />
      </div>
      <div
        className="absolute right-2 top-16 animate-[floatY_6s_ease-in-out_infinite_0.5s] rounded-xl border border-[rgba(0,140,255,0.25)] bg-[#0A1F3E]/90 p-2.5 shadow-[0_4px_20px_rgba(0,140,255,0.2)]"
      >
        <Database size={22} className="text-[#34D399]" />
      </div>
      <div
        className="absolute left-0 bottom-16 animate-[floatY_5.5s_ease-in-out_infinite_1s] rounded-xl border border-[rgba(0,140,255,0.25)] bg-[#0A1F3E]/90 p-2.5 shadow-[0_4px_20px_rgba(0,140,255,0.2)]"
      >
        <Shield size={22} className="text-[#F87171]" />
      </div>
      <div
        className="absolute right-10 bottom-2 animate-[floatY_6.5s_ease-in-out_infinite_1.5s] rounded-xl border border-[rgba(0,140,255,0.25)] bg-[#0A1F3E]/90 p-2.5 shadow-[0_4px_20px_rgba(0,140,255,0.2)]"
      >
        <Network size={22} className="text-[#FCD34D]" />
      </div>
      <div
        className="absolute left-14 top-0 animate-[floatY_7s_ease-in-out_infinite_0.8s] rounded-xl border border-[rgba(0,140,255,0.2)] bg-[#0A1F3E]/90 p-2.5 shadow-[0_4px_20px_rgba(0,140,255,0.15)]"
      >
        <Braces size={20} className="text-[#A78BFA]" />
      </div>

      {/* Books */}
      <div className="absolute -left-4 bottom-14 flex flex-row-reverse gap-1.5">
        {['#147EFF', '#0FA3A3', '#6366F1'].map((c, i) => (
          <div
            key={i}
            className="flex h-14 w-9 items-center rounded-md border border-[rgba(255,255,255,0.1)]"
            style={{
              background: `linear-gradient(135deg, ${c}cc, ${c}55)`,
              boxShadow: '0 4px 14px rgba(0,120,255,0.25)',
            }}
          >
            <Code2 size={13} className="mx-auto text-white/80" />
          </div>
        ))}
      </div>

      {/* Code badge */}
      <div className="absolute right-0 top-0 flex items-center gap-1.5 rounded-full border border-[rgba(0,140,255,0.25)] bg-[#0A1F3E]/90 px-3 py-1 text-[10px] font-semibold text-[#9DD7FF] shadow-[0_4px_16px_rgba(0,140,255,0.2)]">
        <Terminal size={12} className="text-[#008CFF]" />
        ISC · Ingeniería en Sistemas
      </div>

      {/* Server dot */}
      <div className="absolute top-1/2 -right-6 hidden -translate-y-1/2 animate-[floatY_6s_ease-in-out_infinite_2s] rounded-xl border border-[rgba(0,140,255,0.25)] bg-[#0A1F3E]/90 p-2.5 shadow-[0_4px_20px_rgba(0,140,255,0.2)] xl:block">
        <Server size={22} className="text-[#F472B6]" />
      </div>

      {/* Book bottom */}
      <BookOpen size={16} className="absolute -right-2 bottom-6 text-[#008CFF]/60" />
    </div>
  );
}