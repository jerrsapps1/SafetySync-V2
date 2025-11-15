# SafetySync.ai Landing Page - Design Guidelines

## Design System Foundation
Use the GitHub-inspired dark theme with glassmorphic elements and blue ethereal glow effects throughout. This is a comprehensive, established design system that must be followed exactly.

## Design Approach
**System-Based Approach**: Following a custom GitHub-inspired design system with glassmorphic enhancements. This landing page prioritizes visual appeal while maintaining utility-focused clarity for B2B SaaS users (EHS managers, HR teams, training consultants).

## Core Design Elements

### A. Typography
- **Font Family**: Inter (primary), JetBrains Mono (code/technical elements)
- **Hierarchy**: 
  - H1 Hero: 4xl-5xl, font-semibold, tracking-tight
  - H2 Sections: 2xl, font-semibold
  - H3 Cards: text-lg or text-sm, font-semibold
  - Body: text-base, text-[color:var(--text-muted)]
  - Small/Meta: text-xs or text-sm

### B. Layout System
- **Spacing Primitives**: Use Tailwind units of 2, 3, 4, 5, 6, 8, 10, 12, 16, 20
- **Container**: max-w-6xl mx-auto with px-4 sm:px-6 lg:px-8
- **Section Spacing**: mt-20 between major sections, pt-12 for bordered sections
- **Grid Systems**: 
  - Hero: lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]
  - Features: md:grid-cols-2 lg:grid-cols-3 with gap-6
  - Pain cards: md:grid-cols-2 lg:grid-cols-4 with gap-4
  - Two-column sections: lg:grid-cols-2 with gap-10

### C. Component Library

**GlassCard (Signature Component)**:
- Background: bg-card/60 (rgba(22, 27, 34, 0.6))
- Backdrop: blur(12px) saturate(150%)
- Border: border-white/10, rounded-2xl
- Shadow: Multi-layer blue ethereal glow (0 0 40px rgba(88,166,255,0.15), 0 0 80px rgba(56,139,253,0.10)) + standard depth shadows
- Padding: p-6
- Hover: Add hover-elevate class for subtle brightness (rgba(255,255,255,0.04))
- Active: Add active-elevate-2 for stronger brightness (rgba(255,255,255,0.09))

**Header**:
- Sticky top-0, z-20
- Border-bottom with border-[color:var(--border)]/70
- Background: bg-[color:var(--bg)]/80 with backdrop-blur-md
- Logo: Gradient square (h-7 w-7, from-indigo-500/80 via-sky-500/80 to-emerald-400/80) + brand name
- Navigation: Hidden on mobile (md:flex), text-sm text-[color:var(--text-muted)]
- CTA Button: OSHA-orange gradient (from-orange-500 to-orange-600) with shadow-orange-500/30

**Buttons**:
- Primary CTA: bg-gradient-to-r from-orange-500 to-orange-600, border-white/10, shadow-lg shadow-orange-500/30
- Secondary: border-white/15, bg-transparent
- All buttons: rounded-md, hover-elevate active-elevate-2 classes
- Text: text-sm font-medium

**Status Badges**:
- Rounded-full, border, px-2 py-0.5, text-[10px] or text-xs font-medium
- Success: bg-emerald-500/20 text-emerald-300 border-emerald-500/40
- Warning: bg-amber-500/15 text-amber-300 border-amber-500/40
- Error: bg-rose-500/15 text-rose-300 border-rose-500/40

**Data Tables** (for hero preview):
- Container: overflow-hidden rounded-xl border-white/10 bg-[color:var(--canvas)]/70
- Header row: bg-white/5, text-[11px] text-[color:var(--text-muted)]
- Data rows: border-t border-white/5, text-[11px], mix of font-medium and muted

**Login/Auth Forms**:
- Centered glassmorphic card (max-w-md)
- Input fields: bg-secondary/50, border-white/10, rounded-md, focus-visible:ring-2 ring-primary
- Same OSHA-orange gradient button for submit

### D. Background & Atmosphere
**Critical Radial Gradient**:
```css
html.dark body {
  background: 
    radial-gradient(800px circle at 50% -10%, rgba(88,166,255,0.08), transparent 70%),
    var(--bg);
}
```
This creates the ethereal blue atmospheric glow from top-center.

## Page Structure & Sections

1. **Hero** (lg:grid-cols-[1.1fr_1fr]): Left column with badge, H1, description, dual CTAs, small meta text. Right column with GlassCard containing mock employee training table
2. **Pain Points** (4 cards, lg:grid-cols-4): Each GlassCard with title + supporting text
3. **Features** (6 cards, lg:grid-cols-3): Icon + title + description in each GlassCard
4. **For HR** (lg:grid-cols-2): Left column with copy, right column with stats dashboard GlassCard
5. **For Training Providers**: Single or two-column layout with feature highlights
6. **Testimonial**: Single centered GlassCard with quote, attribution, and company
7. **Compliance Note**: Clear, simple text section with border-t separation
8. **Pricing Teaser** (3 cards, lg:grid-cols-3): Tier name, blurb, bullet list, CTA
9. **Final CTA**: Bold headline, CTA button, centered
10. **Footer**: Simple links (Privacy, Terms, Contact) in text-[color:var(--text-muted)]

## Images
**No hero image**. The hero uses a glassmorphic "fake app preview" card showing a training status table instead. This is more effective for B2B SaaS demonstration than generic imagery.

## Animations
Minimal. Use only hover-elevate and active-elevate-2 utility classes for subtle interactive feedback. No complex animations.

## Accessibility
- Maintain text contrast: light text (#c9d1d9) on dark backgrounds (#0d1117)
- Focus-visible states on all interactive elements
- Semantic HTML structure
- Clear visual hierarchy