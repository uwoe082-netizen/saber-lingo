CREATE TABLE public.items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  language text NOT NULL CHECK (language IN ('en','zh')),
  level text NOT NULL CHECK (level IN ('pemula','menengah','mahir')),
  topic text NOT NULL,
  type text NOT NULL CHECK (type IN ('kosakata','tata bahasa','nada','terjemahan')),
  prompt text NOT NULL,
  answer text NOT NULL,
  hint text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.items TO anon, authenticated;
GRANT ALL ON public.items TO service_role;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "items_open" ON public.items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.item_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id uuid NOT NULL UNIQUE REFERENCES public.items(id) ON DELETE CASCADE,
  times_seen integer NOT NULL DEFAULT 0,
  times_correct integer NOT NULL DEFAULT 0,
  times_wrong integer NOT NULL DEFAULT 0,
  last_confidence integer,
  streak integer NOT NULL DEFAULT 0,
  interval_days numeric NOT NULL DEFAULT 0,
  due_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.item_progress TO anon, authenticated;
GRANT ALL ON public.item_progress TO service_role;
ALTER TABLE public.item_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "item_progress_open" ON public.item_progress FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.study_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  question_count integer NOT NULL DEFAULT 0,
  correct_count integer NOT NULL DEFAULT 0,
  avg_confidence numeric,
  difficulty_rating integer CHECK (difficulty_rating BETWEEN 1 AND 4)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_sessions TO anon, authenticated;
GRANT ALL ON public.study_sessions TO service_role;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "study_sessions_open" ON public.study_sessions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.session_answers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES public.study_sessions(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  user_answer text NOT NULL DEFAULT '',
  is_correct boolean NOT NULL DEFAULT false,
  confidence integer NOT NULL CHECK (confidence BETWEEN 1 AND 4),
  answered_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.session_answers TO anon, authenticated;
GRANT ALL ON public.session_answers TO service_role;
ALTER TABLE public.session_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "session_answers_open" ON public.session_answers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_item_progress_due ON public.item_progress(due_at);
CREATE INDEX idx_session_answers_session ON public.session_answers(session_id);

INSERT INTO public.items (language, level, topic, type, prompt, answer, hint) VALUES
('en','pemula','Kata Kerja Dasar','kosakata','Apa arti kata ''borrow''?','meminjam','verb'),
('en','pemula','Kata Kerja Dasar','kosakata','Apa arti kata ''bring''?','membawa','verb'),
('en','pemula','Angka & Waktu','kosakata','Apa arti ''quarter past nine''?','jam sembilan lewat lima belas','waktu'),
('en','pemula','Kata Benda Harian','kosakata','Apa arti kata ''spoon''?','sendok',''),
('en','pemula','Tata Bahasa Dasar','tata bahasa','Lengkapi: She ___ to school every day.','goes','present simple'),
('en','pemula','Tata Bahasa Dasar','tata bahasa','Lengkapi: There ___ two books on the table.','are',''),
('en','pemula','Artikel','tata bahasa','Lengkapi: I saw ___ elephant at the zoo.','an',''),
('en','pemula','Terjemahan','terjemahan','Terjemahkan: ''Saya sedang belajar.''','I am studying',''),
('en','pemula','Terjemahan','terjemahan','Terjemahkan: ''Dia punya dua saudara.''','He has two brothers',''),
('en','menengah','Kosakata Akademik','kosakata','Apa arti kata ''resilient''?','tangguh','adj'),
('en','menengah','Kosakata Akademik','kosakata','Apa arti kata ''elaborate'' (verb)?','menjelaskan secara rinci',''),
('en','menengah','Kosakata Akademik','kosakata','Apa arti kata ''reluctant''?','enggan','adj'),
('en','menengah','Past Tense','tata bahasa','Bentuk lampau dari ''teach''?','taught',''),
('en','menengah','Present Perfect','tata bahasa','Lengkapi: I ___ lived here since 2019.','have',''),
('en','menengah','Preposisi','tata bahasa','Lengkapi: She is good ___ math.','at',''),
('en','menengah','Terjemahan','terjemahan','Terjemahkan: ''Kalau saja aku tahu lebih awal.''','If only I had known earlier',''),
('en','menengah','Phrasal Verb','kosakata','Apa arti ''put off''?','menunda',''),
('en','mahir','Idiom','kosakata','Apa arti idiom ''bite the bullet''?','menghadapi hal sulit dengan berani',''),
('en','mahir','Kosakata Formal','kosakata','Apa arti kata ''ubiquitous''?','ada di mana-mana','adj'),
('en','mahir','Subjunctive','tata bahasa','Lengkapi: I suggest that he ___ early.','leave','subjunctive'),
('en','mahir','Inversi','tata bahasa','Ubah jadi inversi: ''I have never seen such a thing.''','Never have I seen such a thing',''),
('en','mahir','Terjemahan','terjemahan','Terjemahkan: ''Seandainya kebijakan itu tidak diberlakukan.''','Had the policy not been implemented',''),
('zh','pemula','Sapaan','kosakata','Apa arti ''你好''?','halo','nǐ hǎo'),
('zh','pemula','Sapaan','kosakata','Apa arti ''谢谢''?','terima kasih','xiè xie'),
('zh','pemula','Angka','kosakata','Apa arti ''三''?','tiga','sān'),
('zh','pemula','Nada','nada','Tulis pinyin lengkap dengan nada untuk ''妈''','mā','nada 1'),
('zh','pemula','Nada','nada','Tulis pinyin lengkap dengan nada untuk ''马''','mǎ','nada 3'),
('zh','pemula','Tata Bahasa Dasar','tata bahasa','Isi partikel tanya: 你好___?','吗',''),
('zh','pemula','Terjemahan','terjemahan','Terjemahkan ke pinyin: ''Saya orang Indonesia.''','wǒ shì yìnní rén',''),
('zh','menengah','Kosakata Sehari-hari','kosakata','Apa arti ''方便''?','praktis / nyaman','fāng biàn'),
('zh','menengah','Kosakata Sehari-hari','kosakata','Apa arti ''习惯''?','kebiasaan','xí guàn'),
('zh','menengah','Nada','nada','Tulis pinyin dengan nada untuk ''行'' (berjalan)','xíng','nada 2'),
('zh','menengah','Tata Bahasa','tata bahasa','Isi kata pelengkap hasil: 我听___懂了。','得',''),
('zh','menengah','Tata Bahasa','tata bahasa','Isi partikel: 我吃___饭了。','过','pengalaman'),
('zh','menengah','Terjemahan','terjemahan','Terjemahkan ke pinyin: ''Saya sudah belajar tiga tahun.''','wǒ xué le sān nián le',''),
('zh','mahir','Chengyu','kosakata','Apa arti chengyu ''马马虎虎''?','biasa saja / sembarangan','mǎ ma hū hū'),
('zh','mahir','Chengyu','kosakata','Apa arti chengyu ''入乡随俗''?','di mana bumi dipijak di situ langit dijunjung',''),
('zh','mahir','Tata Bahasa','tata bahasa','Isi struktur pasif formal: 这本书___他写的。','是','是...的'),
('zh','mahir','Nada','nada','Tulis pinyin dengan nada untuk ''概念''','gài niàn',''),
('zh','mahir','Terjemahan','terjemahan','Terjemahkan ke pinyin: ''Meskipun sulit, saya tetap berusaha.''','suīrán hěn nán, dànshì wǒ háishì nǔlì','');

INSERT INTO public.item_progress (item_id, due_at) SELECT id, now() FROM public.items;