---
name: Warm Editorial Escrow
colors:
  bg-canvas: '#FFFFFF'
  bg-warm: '#F8F6F1'
  bg-subtle: '#F4F3EF'
  ink-primary: '#1A1A1A'
  ink-muted: '#5F6368'
  border-hairline: '#E5E5E5'
  accent-amber: '#FFB800'
  status-pending-bg: '#F2F0EB'
  status-pending-fg: '#5F6368'
  status-secured-bg: '#FFF4D6'
  status-secured-fg: '#8A5A00'
  status-shipped-bg: '#EEF4FF'
  status-shipped-fg: '#1E40AF'
  status-released-bg: '#EBF7EE'
  status-released-fg: '#1E6B3A'
  status-disputed-bg: '#FDECEC'
  status-disputed-fg: '#B42318'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '500'
    lineHeight: 38px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 17px
    fontWeight: '500'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-amount-lg:
    fontFamily: JetBrains Mono
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 34px
  label-amount-md:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
  label-eyebrow:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  label-status:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style
This design system defines an escrow commerce infrastructure for social selling and buying across Nigeria. It bridges peer-to-peer trust barriers on platforms like Instagram and WhatsApp by presenting escrow transactions not as complex financial instruments or crypto-adjacent wallets, but as calm, reliable digital purchase agreements.

The visual direction merges **Warm Editorial Minimalism** with structural, financial precision:
- **Tone:** Authoritative, transparent, serene, and disciplined. It eliminates speculative financial noise and strictly avoids crypto, wallet, and web3 vernacular. Balances are held simply as safeguarded payments awaiting order fulfillment.
- **Visual Aesthetic:** Editorial restraint driven by pure white paper-like surfaces, warm alabaster secondary tiers, crisp hairline borders, deep charcoal typography, and an intentional restraint on font weights (strictly regular and medium, avoiding aggressive bolding).
- **Tabular Rigor:** High-value numeric anchors—Naira values (₦), time-lock countdowns, and 6-digit release OTPs—are grounded with monospaced tabular glyphs to convey audit-level accuracy and peace of mind.

## Colors
The palette balances an ultra-clean transaction environment with tactile warmth and unambiguous operational status cues.

### Core Roles
- **Canvas & Primary Surfaces (`#FFFFFF`):** High-clarity background for transactional receipt sheets, checkout cards, and modal sheets.
- **Secondary Surface & Protection Banners (`#F8F6F1`):** A warm alabaster used for trust shields, buyer-protection guarantee drawers, order breakdowns, and contextual disclaimers.
- **Primary Ink & Pill Actions (`#1A1A1A`):** Deep carbon charcoal for all primary headings, key data labels, and primary high-priority pill actions.
- **Secondary Ink (`#5F6368`):** Muted slate charcoal for timestamps, seller verification metadata, tracking IDs, and explanatory helper text.
- **Hairline Divider & Border (`#E5E5E5`):** Subdued 1px structural framing for cards, input bounds, tabular rows, and item separation.
- **Escrow Amber Accent (`#FFB800`):** Reserved exclusively for high-trust temporal actions—4px countdown completion bars, active escrow time-locks, and pending payment alerts.

### Semantic Transaction State Matrix
Status pills use dedicated background fills paired with high-contrast foreground ink:
- **Awaiting Payment:** Background `#F2F0EB`, Text `#5F6368`
- **Confirming Payment:** Background `#FFF4D6`, Text `#8A5A00` (accompanied by an active pulsing `#FFB800` dot)
- **Funds Locked / Payment Secured:** Background `#FFF4D6`, Text `#8A5A00`
- **Shipped / In Transit:** Background `#EEF4FF`, Text `#1E40AF`
- **Delivered & Released:** Background `#EBF7EE`, Text `#1E6B3A`
- **Refunded:** Background `#F2F0EB`, Text `#5F6368`
- **Disputed / Frozen:** Background `#FDECEC`, Text `#B42318`

## Typography
The typographical hierarchy balances editorial poise with technical clarity:

- **Editorial Headlines (Plus Jakarta Sans):** Set in 500 Medium weight. Heavy bold weights (600+) are avoided across all scales to maintain an understated, non-promotional tone.
- **Narrative & Helper Copy (Inter):** Utilized for product descriptions, seller delivery instructions, buyer protections, and legal clauses. Configured in 400 Regular and 500 Medium weights for optimal micro-legibility at 12–14px.
- **Data & Verification Numerics (JetBrains Mono):** Tabular monospace treatment for:
  - All Naira currency values (`₦45,000.00`).
  - 6-digit confirmation/release OTPs (`4 8 2 9 1 0`) with wide character tracking.
  - Expiry and dispute countdown clocks (`47:59:12`).
  - Section eyebrows (`label-eyebrow`), rendered in uppercase with `letter-spacing: 0.08em` for audit-like sectioning.

## Layout & Spacing
The layout follows a mobile-first philosophy optimized around a compact 390px viewport, typical of WhatsApp and Instagram referral browsers in Nigeria.

### Layout Rules
- **Canvas Constraints:** On mobile devices, views utilize a single-column stacked layout with `margin: 1rem` (16px) dynamic edge padding. Desktop viewports constrain checkout flows to a max-width 480px centered transaction sheet or a two-column 840px split layout (Summary Card left, Payment/Fulfillment actions right).
- **Vertical Flow:** Spacing follows a strict rhythm based on 4px multiples:
  - Form field groupings and list items sit `space-sm` (8px) to `space-md` (16px) apart.
  - Independent order blocks, item breakdown cards, and escrow timeline milestones use `space-lg` (24px) margins.
  - The sticky transaction footer holds `space-md` padding on top and bottom, accommodating mobile safe areas.

## Elevation & Depth
This design system avoids high-blur, heavy drop shadows in favor of **Crisp Hairline Architecture** and **Tonal Depth**.

- **Surfaces & Separation:** Elevation is achieved through direct background alternation—layering pure white `#FFFFFF` cards against the warm alabaster `#F8F6F1` canvas—bound together by a precise `1px solid #E5E5E5` hairline.
- **Zero Heavy Shadows:** Standard cards, action rows, and inputs carry zero box-shadow.
- **Floating Modals & Drawers:** When bottom verification sheets or release confirmation drawers slide into view, elevation is marked by a subtle, ambient contact shadow: `box-shadow: 0 -4px 20px rgba(26, 26, 26, 0.05)`, backed by a `rgba(26, 26, 26, 0.35)` backdrop overlay.
- **Hairline Dividers:** Section separators use `1px solid #E5E5E5` lines without grooved or inset styling.

## Shapes
The shape language uses deliberate contrast between container structural frames and interactive tokens:

- **Cards, Accordions & Input Surfaces:** Set with `roundedness: 2` (8px standard corner radius, extending to 16px on root transaction cards) to evoke structural paper balance.
- **CTAs, Status Tags & Action Chips:** Rendered as complete pills (`rounded-full` / 9999px radius). The pill shape immediately denotes interactability or temporal status, standing out clearly from the rectangular container grid.
- **Progress Bars:** Escrow duration and countdown timers use a 4px tall flat bar with subtle 2px end caps.

## Components

### Buttons & Action Bars
- **Primary Pill Action:** Height `48px`, background `#1A1A1A`, text `#FFFFFF`, font Inter 500 14px, shape `rounded-full`. Hover/Active: `#2E2E2E`. Disabled: `#E5E5E5` with `#A3A3A3` text.
- **Secondary Outline Pill:** Height `48px`, background `transparent`, border `1px solid #E5E5E5`, text `#1A1A1A`, shape `rounded-full`.
- **Destructive / Dispute Trigger:** Ghost pill, height `40px`, text `#B42318`, background `transparent`.

### Semantic Status Pills
- Compact badges (`rounded-full`, padding `4px 12px`, Inter 500 12px) rendered directly beside order transaction headers.
- When an active state requires attention (e.g., *Confirming Payment*), the badge includes a 6px circular indicator tinted `#FFB800` pulsing at 1.5s intervals.

### Escrow Countdown Timer Bar
- Positioned directly above key release actions or at the card crest.
- Height: `4px`. Background track: `#F2F0EB`. Active progress fill: `#FFB800`.
- Accompanied by monospaced tabular text (`JetBrains Mono`, 12px) specifying remaining delivery window time (e.g., `47h 18m left for delivery`).

### Amount Display & OTP Release Fields
- **Amount Card:** Centered monetary card holding the current payment state. ₦ currency symbol rendered alongside numeric amounts in `JetBrains Mono` 28px (`label-amount-lg`).
- **6-Digit Release Pin Display:** Segmented inputs or pill clusters displaying verification codes (`JetBrains Mono` 22px) with `0.15em` tracking for easy vocal readback during courier handoff.

### Form Inputs & Checkboxes
- **Text Inputs:** Height `44px`, background `#FFFFFF`, border `1px solid #E5E5E5`, corner radius `8px`, text `#1A1A1A`. Focus: `1px solid #1A1A1A` without blue focus halos.
- **Selection Checkboxes & Radios:** Hairline borders `#E5E5E5`. Checked state filled with `#1A1A1A` displaying an interior white tick.

### Trust Banner
- Container background `#F8F6F1`, border `1px solid #E5E5E5`, radius `12px`, padding `16px`.
- Contains an inline hairline shield icon, title ("Secured via Neutral Escrow"), and concise 12px helper copy explaining that funds remain locked until the buyer inspects the package. Zero crypto terminology throughout.