// Tracked font files and license notices.
export const letterFontSources = {
  "letter-fonts/alegreya.json": [
    "letter-fonts/alegreya-cyrillic-400-normal.woff2",
    "letter-fonts/alegreya-cyrillic-ext-400-normal.woff2",
    "letter-fonts/alegreya-greek-400-normal.woff2",
    "letter-fonts/alegreya-greek-ext-400-normal.woff2",
    "letter-fonts/alegreya-latin-400-normal.woff2",
    "letter-fonts/alegreya-latin-ext-400-normal.woff2",
    "letter-fonts/alegreya-vietnamese-400-normal.woff2",
  ],
  "letter-fonts/architects-daughter.json": [
    "letter-fonts/architects-daughter-latin-400-normal.woff2",
    "letter-fonts/architects-daughter-latin-ext-400-normal.woff2",
  ],
  "letter-fonts/assistant.json": [
    "letter-fonts/assistant-latin-400-normal.woff2",
    "letter-fonts/assistant-latin-ext-400-normal.woff2",
  ],
  "letter-fonts/caveat.json": [
    "letter-fonts/caveat-cyrillic-400-normal.woff2",
    "letter-fonts/caveat-cyrillic-ext-400-normal.woff2",
    "letter-fonts/caveat-latin-400-normal.woff2",
    "letter-fonts/caveat-latin-ext-400-normal.woff2",
  ],
  "letter-fonts/comic-neue.json": ["letter-fonts/comic-neue-latin-400-normal.woff2"],
  "letter-fonts/kalam.json": [
    "letter-fonts/kalam-devanagari-400-normal.woff2",
    "letter-fonts/kalam-latin-400-normal.woff2",
    "letter-fonts/kalam-latin-ext-400-normal.woff2",
  ],
  "letter-fonts/lekton.json": [
    "letter-fonts/lekton-latin-400-normal.woff2",
    "letter-fonts/lekton-latin-ext-400-normal.woff2",
  ],
  "letter-fonts/lora.json": [
    "letter-fonts/lora-cyrillic-400-normal.woff2",
    "letter-fonts/lora-cyrillic-ext-400-normal.woff2",
    "letter-fonts/lora-latin-400-normal.woff2",
    "letter-fonts/lora-latin-ext-400-normal.woff2",
    "letter-fonts/lora-vietnamese-400-normal.woff2",
  ],
  "letter-fonts/nanum-pen-script.json": ["letter-fonts/nanum-pen-script-latin-400-normal.woff2"],
  "letter-fonts/patrick-hand.json": [
    "letter-fonts/patrick-hand-latin-400-normal.woff2",
    "letter-fonts/patrick-hand-latin-ext-400-normal.woff2",
    "letter-fonts/patrick-hand-vietnamese-400-normal.woff2",
  ],
  "letter-fonts/shadows-into-light.json": [
    "letter-fonts/shadows-into-light-latin-400-normal.woff2",
    "letter-fonts/shadows-into-light-latin-ext-400-normal.woff2",
  ],
  "letter-fonts/yomogi.json": [
    "letter-fonts/yomogi-cyrillic-400-normal.woff2",
    "letter-fonts/yomogi-latin-400-normal.woff2",
    "letter-fonts/yomogi-latin-ext-400-normal.woff2",
    "letter-fonts/yomogi-vietnamese-400-normal.woff2",
  ],
};
export const letterFontAssets = [
  "letter-fonts/PROVENANCE.txt",
  ...Object.keys(letterFontSources).flatMap((path) => [path, path.replace(/\.json$/u, ".license.txt")]),
];
