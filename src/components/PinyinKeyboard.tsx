type PinyinKeyboardProps = {
  onInsert: (char: string) => void;
  onBackspace: () => void;
};

const ROWS: string[][] = [
  ["ā", "á", "ǎ", "à", "a"],
  ["ē", "é", "ě", "è", "e"],
  ["ī", "í", "ǐ", "ì", "i"],
  ["ō", "ó", "ǒ", "ò", "o"],
  ["ū", "ú", "ǔ", "ù", "u"],
  ["ü", "ǖ", "ǘ", "ǚ", "ǜ"],
];

export function PinyinKeyboard({ onInsert, onBackspace }: PinyinKeyboardProps) {
  return (
    <div className="mt-3 rounded-2xl bg-muted/60 p-3">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        Keyboard pinyin
      </p>
      <div className="space-y-1.5">
        {ROWS.map((row) => (
          <div key={row[0]} className="flex gap-1.5">
            {row.map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => onInsert(ch)}
                className="flex-1 rounded-lg bg-card py-2 text-sm font-bold outline-1 -outline-offset-1 outline-border active:scale-95"
              >
                {ch}
              </button>
            ))}
            <button
              type="button"
              onClick={onBackspace}
              className="rounded-lg bg-card px-3 text-sm font-bold outline-1 -outline-offset-1 outline-border active:scale-95"
            >
              ⌫
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
