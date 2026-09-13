import Link from 'next/link';
import { ArrowRight, ChevronRight, Sparkles, Braces } from 'lucide-react';
import { fetchCategories, fetchDailyWord, fetchTerms } from '@/lib/data';
import { SearchBar } from '@/components/SearchBar';
import { HeroIllustration } from '@/components/HeroIllustration';
import { CategoryIcon } from '@/components/CategoryIcon';
import { DailyWordCard } from '@/components/DailyWordCard';
import { RecentHistory } from '@/components/RecentHistory';

export default async function HomePage() {
  const [categories, dailyWord, terms] = await Promise.all([
    fetchCategories(),
    fetchDailyWord(),
    fetchTerms(),
  ]);

  const totalTerms = terms.length;

  return (
    <div className="relative overflow-hidden">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,140,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,140,255,0.06) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />
      <div className="pointer-events-none absolute -top-32 left-1/3 h-80 w-80 rounded-full bg-[#008CFF]/10 blur-3xl" />
      <div className="pointer-events-none absolute top-40 right-0 h-72 w-72 rounded-full bg-[#147EFF]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 pt-10 pb-16 sm:px-6 lg:px-8 lg:pt-16">
        {/* ===== HERO ===== */}
        <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(0,140,255,0.25)] bg-[rgba(0,140,255,0.08)] px-3 py-1.5 text-xs font-semibold text-[#9DD7FF]">
              <Sparkles size={13} className="text-[#00AAFF]" />
              Plataforma técnica universitaria
            </div>

            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
              Diccionario técnico de{' '}
              <span className="bg-gradient-to-r from-[#008CFF] via-[#00AAFF] to-[#147EFF] bg-clip-text text-transparent">
                Ingeniería en Sistemas Computacionales
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#8BA3BF] sm:text-lg">
              Traduce y comprende los términos más usados en el mundo de la
              programación, redes, bases de datos, desarrollo web y más.
            </p>

            <div className="mt-7">
              <SearchBar />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[#4A6A8A]">
              <span>
                <strong className="text-[#9DD7FF]">{totalTerms}</strong> términos
              </span>
              <span aria-hidden>·</span>
              <span>
                <strong className="text-[#9DD7FF]">{categories.length}</strong>{' '}
                categorías
              </span>
              <span aria-hidden>·</span>
              <span className="flex items-center gap-1">
                <Braces size={12} className="text-[#008CFF]" />
                EN → ES y ES → EN
              </span>
            </div>
          </div>

          <HeroIllustration />
        </section>

        {/* ===== MAIN GRID ===== */}
        <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Left: categories + history */}
          <div className="min-w-0 space-y-8">
            <section>
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Categorías</h2>
                  <p className="mt-1 text-sm text-[#8BA3BF]">
                    Explora las palabras por área de especialización.
                  </p>
                </div>
                <Link
                  href="/categorias"
                  className="flex items-center gap-1.5 text-sm font-semibold text-[#00AAFF] transition-colors hover:text-white"
                >
                  Ver todas <ArrowRight size={15} />
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {categories.slice(0, 9).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categorias/${cat.id}`}
                    className="group flex items-center gap-3.5 rounded-xl border border-[rgba(0,140,255,0.12)] bg-[#081B32]/80 p-4 transition-all hover:border-[rgba(0,140,255,0.4)] hover:bg-[#0A203A] hover:shadow-[0_4px_20px_rgba(0,140,255,0.12)]"
                  >
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                      style={{
                        background: `${cat.color}22`,
                        border: `1px solid ${cat.color}55`,
                      }}
                    >
                      <CategoryIcon icon={cat.icon} color={cat.color} size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-white">
                        {cat.name}
                      </p>
                      <p className="text-xs text-[#4A6A8A]">
                        {cat.term_count ?? 0} términos
                      </p>
                    </div>
                    <ChevronRight
                      size={16}
                      className="shrink-0 text-[#4A6A8A] transition-all group-hover:translate-x-0.5 group-hover:text-[#008CFF]"
                    />
                  </Link>
                ))}
              </div>
            </section>

            {/* Mobile-only history */}
            <div className="lg:hidden">
              <RecentHistory />
            </div>
          </div>

          {/* Right rail */}
          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <DailyWordCard term={dailyWord} />
            <div className="hidden lg:block">
              <RecentHistory />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}