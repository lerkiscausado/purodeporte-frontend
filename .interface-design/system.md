# Puro Deporte — Design System

## Direction & Feel
**Tablero de marcadores de coliseo deportivo de barrio.**
Energético pero no corporativo. Cercano, comunitario, con la tensión del resultado deportivo.
Dense, structured, informational. Like approaching the scoreboard at a neighborhood sports arena.

## Signature Element
**La línea de marca** — 4px left border in `--linea-marca` (orange #F5941E).
Applied to: all cards (torneo, noticia, partido, resultado), section headers via `.marca-line` utility.

## Depth Strategy
**Borders-only** — clean, technical. No shadows except on hero CTA buttons.
Cards use `border border-border/60` with the signature `border-l-4`.
Column separation uses `lg:border-x lg:border-border/60`.

## Spacing
- Base unit: 4px
- Micro: 4px (gap-1), 6px (gap-1.5)
- Component: 10px (p-2.5), 12px (p-3), 14px (p-3.5)
- Section: 24px (gap-6), 32px (gap-8)
- Column gap: 32px

## Border Radius
`--radius: 0.375rem` — sharper, more athletic/technical. All components use `rounded-sm`.

## Typography
- Font: Inter (via Google Fonts)
- Section headers: `text-lg font-extrabold` with `.marca-line`
- Card titles: `text-sm font-bold leading-snug`
- Metadata: `text-[11px] text-muted-foreground`
- Scores: `font-black tabular-nums tracking-wider`
- Badges: `text-[9px] uppercase tracking-wider font-bold`

## Colors (Light)
- Background: `hsl(220 20% 96%)` — the field
- Card: `hsl(220 15% 99%)`
- Primary: `hsl(33 92% 54%)` — orange (#F5941E)
- Foreground: `hsl(218 50% 22%)` — navy
- Border: `hsl(220 15% 88%)`

## Domain Tokens
- `--cancha`: background
- `--tiza`: warm white
- `--marcador`: orange (action, score)
- `--tribuna`: navy (structure)
- `--linea-marca`: orange (signature border)

## Key Component Patterns

### CardTorneo
Compact planilla card. `border-l-4 border-l-primary/70`. Badge + icon row, title, date.

### CardNoticia
Article with `border-l-4 border-l-primary/50`. Image (h-40), date, title, summary.

### PartidoItem
Compact match card. `border-l-4` color varies by state. Date+status row, teams+score row.

### TablaResultados
Card-list format (not table). Each result as a compact card with `border-l-4`. Winner highlighted in orange.

### Footer
Dark navy bg `hsl(218 50% 14%)` with `border-t-4 border-primary/50`. Logo, nav links, social icons.
