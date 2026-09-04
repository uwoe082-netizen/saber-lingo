import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Chip, Panel } from "@/components/AppShell";
import { LEVELS, languageLabel, levelLabel, type Language, type Level } from "@/lib/lingo";

export const Route = createFileRoute("/kursus")({
  head: () => ({
    meta: [
      { title: "Rekomendasi Kursus Coursera — Lingo-SRS" },
      {
        name: "description",
        content:
          "Referensi kursus Coursera untuk Bahasa Inggris dan Mandarin, dikelompokkan per level Pemula, Menengah, dan Mahir.",
      },
      { property: "og:title", content: "Rekomendasi Kursus Coursera — Lingo-SRS" },
      {
        property: "og:description",
        content: "Daftar kursus eksternal sebagai pelengkap latihan harian Lingo-SRS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KursusPage,
});

type Course = {
  name: string;
  provider: string;
  url: string;
  language: Language;
  level: Level;
};

const COURSES: Course[] = [
  {
    name: "Learn English: Beginning Grammar",
    provider: "University of California, Irvine",
    url: "https://www.coursera.org/specializations/learn-english-grammar",
    language: "en",
    level: "pemula",
  },
  {
    name: "English for Career Development",
    provider: "University of Pennsylvania",
    url: "https://www.coursera.org/learn/careerdevelopment",
    language: "en",
    level: "pemula",
  },
  {
    name: "Learn English: Intermediate Grammar",
    provider: "University of California, Irvine",
    url: "https://www.coursera.org/specializations/intermediate-grammar",
    language: "en",
    level: "menengah",
  },
  {
    name: "Business English Communication Skills",
    provider: "University of Washington",
    url: "https://www.coursera.org/specializations/business-english",
    language: "en",
    level: "menengah",
  },
  {
    name: "Academic English: Writing",
    provider: "University of California, Irvine",
    url: "https://www.coursera.org/specializations/academic-english",
    language: "en",
    level: "mahir",
  },
  {
    name: "Advanced Writing",
    provider: "University of California, Irvine",
    url: "https://www.coursera.org/learn/advanced-writing",
    language: "en",
    level: "mahir",
  },
  {
    name: "Chinese for Beginners",
    provider: "Peking University",
    url: "https://www.coursera.org/learn/learn-chinese",
    language: "zh",
    level: "pemula",
  },
  {
    name: "Basic Mandarin Chinese – Level 1",
    provider: "Shanghai Jiao Tong University",
    url: "https://www.coursera.org/learn/basic-mandarin-chinese-level-1",
    language: "zh",
    level: "pemula",
  },
  {
    name: "More Chinese for Beginners",
    provider: "Peking University",
    url: "https://www.coursera.org/learn/more-chinese-for-beginners",
    language: "zh",
    level: "menengah",
  },
  {
    name: "Intermediate Mandarin Chinese – Level 3",
    provider: "Shanghai Jiao Tong University",
    url: "https://www.coursera.org/learn/intermediate-mandarin-chinese-level-3",
    language: "zh",
    level: "menengah",
  },
  {
    name: "Chinese for HSK 4",
    provider: "Peking University",
    url: "https://www.coursera.org/learn/hsk-4",
    language: "zh",
    level: "mahir",
  },
  {
    name: "Chinese for HSK 5",
    provider: "Peking University",
    url: "https://www.coursera.org/learn/hsk5-1",
    language: "zh",
    level: "mahir",
  },
];

function KursusPage() {
  return (
    <AppShell>
      <header className="mt-6">
        <h1 className="text-2xl font-extrabold">Rekomendasi kursus eksternal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Referensi tambahan di Coursera. Bukan bagian dari sistem latihan harian
          Lingo-SRS.
        </p>
      </header>

      <div className="mt-5 space-y-4">
        {(["en", "zh"] as Language[]).map((lang) => (
          <Panel key={lang} title={languageLabel[lang]}>
            <div className="mt-3 space-y-4">
              {LEVELS.map((level) => {
                const list = COURSES.filter(
                  (c) => c.language === lang && c.level === level,
                );
                return (
                  <div key={level}>
                    <div className="flex items-center gap-2">
                      <Chip tone="muted">{levelLabel[level]}</Chip>
                    </div>
                    <ul className="mt-2 divide-y divide-border">
                      {list.map((c) => (
                        <li key={c.url}>
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:text-brand"
                          >
                            <span>
                              <span className="block text-sm font-bold">{c.name}</span>
                              <span className="block text-[11px] font-semibold text-muted-foreground">
                                {c.provider}
                              </span>
                            </span>
                            <span className="text-xs font-bold text-muted-foreground">
                              buka ↗
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
