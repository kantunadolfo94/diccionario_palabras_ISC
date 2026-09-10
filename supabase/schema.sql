-- ============================================================
-- SysDictionary - Supabase Schema
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- Habilitar extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES (extiende auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT '',
  email       TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL DEFAULT 'docente' CHECK (role IN ('admin', 'docente')),
  avatar_url  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  icon        TEXT NOT NULL DEFAULT 'Code',
  color       TEXT NOT NULL DEFAULT '#008CFF',
  accent      TEXT NOT NULL DEFAULT '#147EFF',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. TERMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.terms (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  english_word        TEXT NOT NULL,
  spanish_word        TEXT NOT NULL,
  definition          TEXT NOT NULL DEFAULT '',
  technical_definition TEXT NOT NULL DEFAULT '',
  example             TEXT NOT NULL DEFAULT '',
  category_id         UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_by          UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status              TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'pending')),
  is_daily_word       BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. RELATED TERMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.related_terms (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  term_id         UUID NOT NULL REFERENCES public.terms(id) ON DELETE CASCADE,
  related_term_id UUID NOT NULL REFERENCES public.terms(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(term_id, related_term_id),
  CHECK (term_id != related_term_id)
);

-- ============================================================
-- 5. DAILY WORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.daily_words (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  term_id    UUID NOT NULL REFERENCES public.terms(id) ON DELETE CASCADE,
  date       DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. ACTIVITY LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL DEFAULT '',
  entity_id   UUID,
  details     JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_terms_english ON public.terms(LOWER(english_word));
CREATE INDEX IF NOT EXISTS idx_terms_spanish ON public.terms(LOWER(spanish_word));
CREATE INDEX IF NOT EXISTS idx_terms_category ON public.terms(category_id);
CREATE INDEX IF NOT EXISTS idx_terms_status ON public.terms(status);
CREATE INDEX IF NOT EXISTS idx_related_term_id ON public.related_terms(term_id);
CREATE INDEX IF NOT EXISTS idx_daily_words_date ON public.daily_words(date DESC);

-- ============================================================
-- TRIGGERS: updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_terms_updated_at
  BEFORE UPDATE ON public.terms
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- TRIGGER: Auto-crear profile cuando se registra un usuario
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'docente')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.related_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- ---- profiles ----
CREATE POLICY "profiles_public_read" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_own_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ---- categories ----
CREATE POLICY "categories_public_read" ON public.categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "categories_admin_all" ON public.categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ---- terms ----
CREATE POLICY "terms_public_read" ON public.terms
  FOR SELECT USING (status = 'published');

CREATE POLICY "terms_authenticated_insert" ON public.terms
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'docente'))
  );

CREATE POLICY "terms_authenticated_update" ON public.terms
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'docente'))
  );

CREATE POLICY "terms_admin_delete" ON public.terms
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "terms_author_all" ON public.terms
  FOR ALL USING (created_by = auth.uid());

-- ---- related_terms ----
CREATE POLICY "related_terms_public_read" ON public.related_terms
  FOR SELECT USING (true);

CREATE POLICY "related_terms_authenticated_write" ON public.related_terms
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'docente'))
  );

CREATE POLICY "related_terms_authenticated_delete" ON public.related_terms
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'docente'))
  );

-- ---- daily_words ----
CREATE POLICY "daily_words_public_read" ON public.daily_words
  FOR SELECT USING (true);

CREATE POLICY "daily_words_admin_write" ON public.daily_words
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ---- activity_logs ----
CREATE POLICY "activity_logs_admin_read" ON public.activity_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "activity_logs_authenticated_insert" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- VIEW: Terms with category info (helper for public queries)
-- ============================================================
CREATE OR REPLACE VIEW public.terms_with_category AS
  SELECT
    t.id,
    t.english_word,
    t.spanish_word,
    t.definition,
    t.technical_definition,
    t.example,
    t.status,
    t.is_daily_word,
    t.created_at,
    t.updated_at,
    t.created_by,
    c.id       AS category_id,
    c.name     AS category_name,
    c.icon     AS category_icon,
    c.color    AS category_color
  FROM public.terms t
  LEFT JOIN public.categories c ON t.category_id = c.id
  WHERE t.status = 'published';

-- ============================================================
-- FUNCTION: Get term count per category
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_category_term_counts()
RETURNS TABLE(category_id UUID, count BIGINT) AS $$
  SELECT category_id, COUNT(*) as count
  FROM public.terms
  WHERE status = 'published' AND category_id IS NOT NULL
  GROUP BY category_id;
$$ LANGUAGE sql STABLE;
