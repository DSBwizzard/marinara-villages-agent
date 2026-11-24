export const DEFAULT_TOWN_MAP_LAYOUT_PROMPT =
  "Create a single overhead map of the described area and level on a 16:9 landscape canvas. Fill the image edge to edge. " +
  "Follow the Village description for anything Map details leave unspecified. " +
  "Make rooms, outdoor spaces, entrances and connecting routes easy to distinguish. Preserve described architecture, density and current conditions. Use cutaways only where needed for navigation. " +
  "Render an unoccupied environment. Do not reserve blank spaces for annotations or add placeholder panels, photograph frames, borders, interface elements, symbols or writing. Do not draw outlined lots or a zoning grid.";
export const DEFAULT_TOWN_MAP_NEGATIVE_PROMPT =
  "text, letters, writing, numerals, labels, captions, signs, icons, markers, interface elements, legend, compass rose, watermark, decorative border, blank annotation panels, placeholder boxes, photograph frames, label plaques, people, characters, outlined lots, zoning grid, crowded composition, blurry, low quality";
