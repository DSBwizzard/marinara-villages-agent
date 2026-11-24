export const DEFAULT_TOWN_MAP_LAYOUT_PROMPT =
  "Create a single wide, zoomed-out bird's-eye map of the described area and level on a 16:9 landscape canvas. " +
  "Show a broad overview with buildings and landmarks smaller in frame, generous surrounding scenery and readable connecting routes. Fill the image edge to edge with continuous scenery. " +
  "Follow the Village description for anything Map details leave unspecified. " +
  "For outdoor areas, show exterior architecture with complete, opaque roofs and exterior walls. Never remove roofs or walls to reveal interiors. Do not use cutaways, dollhouse views, cross-sections or transparent architecture. " +
  "Show interiors only when the described area and level are indoors. Make outdoor spaces, entrances and connecting routes easy to distinguish. Preserve described architecture, density and current conditions. " +
  "Render an unoccupied environment. Do not reserve blank spaces for annotations or add placeholder panels, photograph frames, borders, interface elements, symbols or writing. Do not draw outlined lots or a zoning grid.";
export const DEFAULT_TOWN_MAP_NEGATIVE_PROMPT =
  "text, letters, writing, numerals, labels, captions, signs, icons, markers, interface elements, legend, compass rose, watermark, decorative border, blank annotation panels, placeholder boxes, photograph frames, label plaques, people, characters, outlined lots, zoning grid, cutaways, roofless buildings, dollhouse views, cross-sections, transparent walls, crowded composition, blurry, low quality";
