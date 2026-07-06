# Galbijjim Pixel Archive Style Guide

## Source Direction

This site adapts the archived AQNB homepage into a recipe page for Korean braised beef short ribs. The design should feel like an independent arts-publishing page first: pale pink field, oversized masthead, serif editorial story text, compact metadata, thin horizontal rules, and image blocks that sit inside the grid rather than floating as cards.

The recipe imagery then shifts that editorial framework into a 90s pixel-game cooking archive. No unmodified food photography should appear on the page.

## Visual Theme

- Mood: AQNB-like editorial announcement crossed with a 16-bit recipe quest.
- Background: flat pale pink, not a gradient and not a textured grid.
- Layout: wide editorial grid with a large masthead, a "Recent" side label, central story text, and right-side image placement.
- Texture: thin dark rules, square image crops, visible pixel art, and restrained interface elements.
- Motion: minimal. Interactions should be quiet and functional.

## Color Palette

- Ink: `#2c241e`
- Paper: `#f4d8d5`
- Bone: `#f8e3e0`
- Wash: `#edc4c8`
- Muted text: `#6a5750`
- Soy brown: `#4b241a`
- Hot pink accent: `#dd3e8b`
- Pickle green: `#42633a`
- Radish light: `#f2e7df`
- Carrot orange: `#cf6f24`
- Focus blue: `#2f48b7`

The dominant read should be pale pink with dark brown-black type, matching the AQNB reference. Food colors should appear mainly inside the pixel images, not as large UI color blocks.

## Typography

- Masthead: `Arial Black`, then Helvetica/Arial fallback.
- Body sans: `Helvetica Neue`, Helvetica, Arial, sans-serif.
- Editorial serif: Georgia, Times New Roman, Times, serif.
- Brand masthead: very large, heavy, uppercase sans, tight line-height, no negative letter spacing.
- Main recipe title and intro: serif, regular weight, article-like, not all caps.
- Section titles: serif, large, regular weight.
- Labels, nav, captions, and buttons: small uppercase sans.

## Layout Rules

- Header is relative, not sticky. It should act like a publication masthead.
- Main content width is capped around `1240px` with narrow viewport gutters.
- Hero uses three columns: side label, editorial text, and square image.
- Horizontal rules should be thin `1px` lines.
- Avoid rounded cards, heavy drop shadows, and boxed UI treatments.
- Images must not cross or visually sit on top of divider rules; keep image crops contained in their assigned grid column.

## Image Rules

- All recipe images should look like 1990s console game assets: visible square pixels, limited palette, dark brown outlines, simplified shading.
- Use `image-rendering: pixelated` on recipe images.
- Hero image: square crop, right column, max height around `270px`, no heavy frame.
- Step images: square crop, max height around `190px`, placed to the left of each method step.
- Step imagery should describe the cooking action: cleaning ribs, parboiling, straining stock, mixing sauce, braising, and finishing.
- Avoid photorealism, blur, stock food photography, vector-flat illustration, labels inside images, and watermarks.

## Components

- Masthead: huge "Columbia GSAPP" text in heavy sans with small underlined nav links.
- Hero: "Recent" side label, small kicker, serif headline and intro, underlined source link, square pixel art image.
- Quick stats: four text cells between thin horizontal rules.
- Ingredients: three editorial columns, transparent backgrounds, thin top rules, and list items separated by faint rules.
- Method steps: numbered rows with a step image, serif instruction text, and small underlined done/reset control.
- Notes: three plain editorial blocks with thin top rules.
- Footer: source credit plus the asterisked Korean web-comic meme note in large serif text.

## Accessibility

- Maintain strong contrast between `#2c241e` text and `#f4d8d5` background.
- Keep visible focus outlines using the blue focus color.
- Do not rely on color alone for completed method steps; use text decoration as well.
- Every image requires descriptive alt text.
- Interactive controls must remain keyboard reachable.

## Content Voice

- Clear and instructional for recipe content.
- Editorial rather than app-like.
- Slightly playful through section labels such as "Build the Party" and "Cook the Quest."
- Recipe facts remain practical and credited to the Korean Bapsang source.
- The final meme note should read as contextual annotation, not as a standard recipe instruction.
