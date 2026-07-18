---
name: Bravo Instalações
description: Adaptive app for Bravo Instalações
colors:
  primary: "#ffc409"
  secondary: "#1a1a1a"
  tertiary: "#f5f3ff"
  success: "#16a34a"
  warning: "#ea580c"
  danger: "#dc2626"
  neutral-bg: "#f4f5f8"
  neutral-text: "#111111"
  card-bg: "#ffffff"
typography:
  body:
    fontFamily: "'Outfit', 'Inter', sans-serif"
rounded:
  card: "16px"
  header: "24px"
  badge: "20px"
  budget: "14px"
spacing:
  card-padding: "18px"
  budget-padding: "16px"
components:
  app-header:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.primary}"
    rounded: "{rounded.header}"
    padding: "24px 20px"
  bravo-card:
    backgroundColor: "{colors.card-bg}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-padding}"
  status-badge:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.card-bg}"
    rounded: "{rounded.badge}"
    padding: "6px 12px"
  budget-card:
    backgroundColor: "{colors.tertiary}"
    rounded: "{rounded.budget}"
    padding: "{spacing.budget-padding}"
---

# Design System: Bravo Instalações

## 1. Overview

**Creative North Star: "The Modern Technician"**

The design language is premium and focused, balancing dark headers and sharp contrast with polished surfaces. It conveys an efficient, clear, and professional tone tailored for service technicians and customers alike. It embraces a high-contrast aesthetic that feels distinctly modern, rejecting utilitarian blandness in favor of deliberate, tactile boundaries.

**Key Characteristics:**
- High-contrast elements
- Premium, focused layouts
- Tactile, rounded components (16px+ radius)
- Layered depth

## 2. Colors

The "Modern Service" palette pairs high-visibility Bravo Yellow with deep Charcoal for a striking, focused aesthetic.

### Primary
- **Bravo Yellow** (#ffc409): Used for primary actions, highlights, and crucial status indicators against dark backgrounds.

### Secondary
- **Charcoal Dark** (#1a1a1a): Provides a premium backdrop for headers, badges, and high-emphasis contrasting elements.

### Tertiary
- **Pastel Purple** (#f5f3ff): A soft accent reserved specifically for budget-related cards and elements.

### Neutral
- **Background Light** (#f4f5f8): The standard canvas color.
- **Text Ink** (#111111): Default color for body typography.
- **Surface White** (#ffffff): Background color for cards and inputs.

### Named Rules
**The High-Contrast Header Rule.** App headers always use the Charcoal Dark background with Bravo Yellow text to establish an immediate premium hierarchy.

## 3. Typography

**Body Font:** Outfit (with Inter as fallback)

**Character:** A modern, geometric sans-serif that feels clean, approachable, yet highly professional and technical.

### Hierarchy
- **Headline** (600/700, various): Used for page titles and major sections.
- **Title** (600, 16px): Used inside cards like the budget title.
- **Body** (400, 15px/13px): Standard text for content and timeline descriptions.
- **Label** (600, 12px): Used in status badges.

## 4. Elevation

The system uses a **Layered** approach, where tactile cards and containers float above the background on soft, deliberate shadows.

### Shadow Vocabulary
- **Card Float** (`box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05)`): Standard elevation for `.bravo-card`.
- **Header Drop** (`box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3)`): A deep, prominent shadow separating the dark header from the light canvas.

### Named Rules
**The Tactile Card Rule.** Cards are never entirely flat; they require a subtle shadow at rest and scale down slightly (`scale(0.98)`) with a reduced shadow on interaction.

## 5. Components

Tactile and distinct, with clear boundaries and generous rounding.

### App Header
- **Shape:** 24px bottom radius.
- **Colors:** Charcoal background, Bravo Yellow text.
- **Shadow:** Deep Header Drop shadow to float above content.

### Cards (.bravo-card)
- **Shape:** 16px radius.
- **Background:** Surface White with a 1px faint border (`rgba(0,0,0,0.04)`).
- **Internal Padding:** 18px.
- **Interactive State:** Squeezes down on active (`scale(0.98)`) for tactile feedback.

### Budget Card
- **Shape:** 14px radius.
- **Background:** Pastel Purple with a dashed shade border.
- **Internal Padding:** 16px.

### Status Badge
- **Shape:** Full pill (20px radius).
- **Colors:** Charcoal background with white text.
- **Internal Padding:** 6px 12px.

### Inputs / Fields
- **Style:** Always crisp white backgrounds against the light gray canvas, maintaining high contrast. 4px subtle radius.

## 6. Do's and Don'ts

### Do:
- **Do** use Charcoal Dark for headers and main navigation areas to create a premium feel.
- **Do** apply a 16px radius to standard content cards.
- **Do** ensure inputs remain pure white for clarity.

### Don't:
- **Don't** use flat gray backgrounds for cards; always use Surface White with the Card Float shadow.
- **Don't** use sharp corners on main UI elements; embrace the tactile, rounded boundaries.
- **Don't** over-use Bravo Yellow for large backgrounds; keep it as a highlight or text color against dark surfaces.
