---
title: Escrow Pay Links — UI Design Specification
aesthetic: Warm Editorial Minimalism
status: implemented
related_docs:
  intent: ../intent.md
  system_design: ../system-design.md
  plan: ../plan.md
  tokens: ./DESIGN.md
lookup:
  principles_and_constraints:
    lines: "68-86"
    summary: Zero-wallet UX, zero-signup buying, honest boundaries, responsive viewports
  tokens:
    colors:
      lines: "91-102"
      values: ["#FFFFFF", "#F8F6F1", "#1A1A1A", "#5F6368", "#E5E5E5", "#F4F3EF", "#FFB800"]
    status_pills:
      lines: "103-116"
      statuses: [PENDING_PAYMENT, PROCESSING_PAYMENT, SECURED, SHIPPED, RELEASED, REFUNDED, DISPUTED]
    typography_and_radii:
      lines: "117-133"
      fonts: ["Plus Jakarta Sans (display)", "Inter (body)", "JetBrains Mono (data)"]
  screen_inventory:
    lines: "136-148"
  screens:
    landing_page:
      route: "/"
      viewport: "1440px / 390px"
      lines: "153-158"
    product_checkout:
      route: "/p/[slug]"
      viewport: "Desktop 2-col (max 1040px) / Mobile 390px"
      lines: "159-180"
    buyer_order_tracking:
      route: "/o/[token]"
      viewport: "Mobile 390px (Desktop centered 520px)"
      lines: "181-214"
      includes: [PENDING_PAYMENT, PROCESSING_PAYMENT, SECURED, SHIPPED, deadline_expired, DISPUTED, RELEASED, REFUNDED, chain_receipt_drawer]
    auth_and_onboarding:
      routes: ["/login", "/signup", "/onboarding"]
      lines: "215-222"
    seller_dashboard:
      route: "/dashboard/*"
      viewport: "1440px / 390px (4-tab bottom nav)"
      lines: "223-239"
      includes: [sidebar, bottom_nav, summary_banner, withdraw_modal, filter_bar, order_cards, release_code_modal, pay_links]
    create_pay_link:
      route: "/dashboard/products/new"
      lines: "240-251"
      includes: [image_url_preview, window_pills_custom, whatsapp_og_preview]
    admin_disputes:
      route: "/admin"
      lines: "252-259"
    system_states:
      routes: ["not-found.tsx", "error.tsx", "loading.tsx", "icon.svg"]
      lines: "260-264"
---

# Escrow Pay Links — UI Design Specification

> **Purpose:** Authoritative UI/UX specification aligned with the implemented Warm Editorial Minimalism interface.  
> **Aesthetic Direction:** **Warm Editorial Minimalism** — pure white receipt surfaces, warm alabaster protection bands, deep charcoal pill CTAs, crisp `1px` hairline dividers, and tabular monospace numbers.  
> **Aligned With:** [`intent.md`](../intent.md), [`system-design.md`](../system-design.md), and [`DESIGN.md`](./DESIGN.md)

---

## 1. Design Philosophy & Hard Constraints

Social-commerce buyers in Nigeria are hyper-vigilant about scams. A calm, receipt-like interface signals institutional safety far better than loud neon fintech UI.

### Non-Negotiable Rules
1. **Zero-Wallet / Zero-Crypto UX:** Never display words like *crypto, blockchain, wallet, XLM, Stellar, Soroban,* or *gas* anywhere in buyer or seller flows. Buyers and sellers only see **Naira (`₦`)**, **delivery windows**, **Paystack checkout**, and a **6-digit release code**.
   - *Only exception:* A single muted, collapsed accordion at the bottom of order pages labeled **`Receipt on the chain`**.
2. **Zero-Signup Buying:** Buyers never create an account, password, or profile. They land on a link, fill in delivery details (including a valid email for payment receipts), pay, and track via their unique order URL (`/o/[token]`).
3. **Honest Boundaries (No Fake Features):**
   - Do **not** promise SMS notifications (copy tells buyers to keep/bookmark/copy their order link).
   - **`Withdraw to Bank`** opens an honest coming-soon modal (*"Payouts launch with our banking partner"*), never a fake payout success screen.
   - Product images use an **Image URL input + live preview** (not a fake file-upload dropzone).
   - Keep buyer-facing screens clean and production-grade (no `TEST MODE / SANDBOX` banners inside `/o/[token]`; Paystack's own test checkout page handles test-mode simulation).
4. **Responsive Viewports:**
   - Landing page (`/`) spans full width with alternating `#FFFFFF` and `#F8F6F1` editorial bands, a persistent fixed top navbar, and a full footer.
   - Public product checkout (`/p/[slug]`) uses a 2-column gallery sheet (`max-w-[1040px]`) on desktop and a stacked `390px` mobile-first layout in WhatsApp/Instagram in-app browsers.
   - Buyer order tracking (`/o/[token]`) renders as a unified digital receipt sheet (`max-w-[520px]`) centered on desktop and edge-to-edge on mobile.
   - Seller screens (`/dashboard/*`, `/admin`) use a `1440px` desktop shell with a `240px` left sidebar, switching to a fixed 4-tab bottom navigation bar on mobile (`< 768px`).

---

## 2. Design Tokens

### 2.1 Color Palette

| Token | Hex | Usage |
| --- | --- | --- |
| **Canvas (`bg-canvas`)** | `#FFFFFF` | Page background, main receipt sheets, form inputs, modals |
| **Warm Surface (`bg-warm`)** | `#F8F6F1` | Alternating editorial bands, escrow protection banners, 6-digit code container backdrop, seller trust strip, active sidebar item, summary banner |
| **Primary Ink / CTA (`ink-primary`)** | `#1A1A1A` | Headings, primary solid pill buttons (`rounded-full`), active pill tabs |
| **Secondary Ink (`ink-muted`)** | `#5F6368` | Helper text, delivery instructions, timestamps, muted metadata |
| **Hairline Border (`border-hairline`)** | `#E5E5E5` | `1px` card borders, receipt dividers, input borders |
| **Hover Surface (`bg-subtle`)** | `#F4F3EF` | Subtle button/row hover states |
| **Escrow Amber (`accent-amber`)** | `#FFB800` | Thin `4px` countdown progress bar & seller completion trust bar |

### 2.2 Semantic Status Pills (Mapped 1:1 to `OrderStatus`)

All status badges use `rounded-full`, `12px` medium text (`font-sans`), `px-2.5 py-1`:

| `OrderStatus` | Display Label | Fill | Text | Border / Dot |
| --- | --- | --- | --- | --- |
| `PENDING_PAYMENT` | **Awaiting Payment** | `#F2F0EB` | `#5F6368` | `#E5E5E5` |
| `PROCESSING_PAYMENT` | **Confirming Payment…** | `#FFF4D6` | `#8A5A00` | `#FFB800` (pulsing dot) |
| `SECURED` | **Payment Secured — Ship Now** *(seller)* / **Funds Locked in Escrow** *(buyer)* | `#FFF4D6` | `#8A5A00` | `#FFB800` |
| `SHIPPED` | **Shipped — In Transit** | `#EEF4FF` | `#1E40AF` | `#BFDBFE` |
| `RELEASED` | **Delivered & Released** | `#EBF7EE` | `#1E6B3A` | `#BBF7D0` |
| `REFUNDED` | **Refunded** | `#F2F0EB` | `#5F6368` | `#E5E5E5` |
| `DISPUTED` | **Disputed — Frozen** | `#FDECEC` | `#B42318` | `#FECACA` |

### 2.3 Typography

- **Display Headings (`--font-display`):** `Plus Jakarta Sans` — weights **`400` (Regular)** and **`500` (Medium)**. Heavy bold weights (`600+`) are avoided to preserve the calm editorial tone.
- **Body & UI Copy (`--font-sans`):** `Inter` — weights **`400` (Regular)** and **`500` (Medium)**.
- **Trust & Precision Monospace (`--font-mono`):** `JetBrains Mono` (`tabular-nums`) — used strictly for:
  - Naira amounts: `₦45,000`
  - The 6-digit release code: `4 8 2   9 1 0`
  - Delivery countdowns: `47h 18m left`
  - Uppercase tracked eyebrows (`11px`, `tracking-[0.08em]`): `ESCROW PROTECTED`, `YOUR RELEASE CODE`, `ORDER #EPL-8042`, `RECEIPT ON THE CHAIN`

### 2.4 Radii, Borders & Elevation
- **Cards & Receipt Sheets:** `16px` (`rounded-2xl`), `1px solid #E5E5E5` (or `#F8F6F1` for nested warm panels).
- **Inputs:** `12px` (`rounded-xl`), `1px solid #E5E5E5`, `44px` min touch height, focus border `#1A1A1A`.
- **Primary & Secondary Buttons:** `9999px` (`rounded-full`), `48px` height on mobile CTAs, `40px` on desktop actions.
- **Filter Chips / Window Tabs:** `8px` (`rounded-lg`) for filter chips; `9999px` pill tabs for delivery windows.
- **Elevation:** Flat by default using `1px` hairline borders and `#FFFFFF` / `#F8F6F1` tonal alternation. Only modals and floating overlays use subtle ambient shadow (`0 8px 24px rgba(26, 26, 26, 0.06)`).

---

## 3. Screen Inventory

| # | Screen / Flow | Route | Primary Viewport |
| --- | --- | --- | --- |
| **0** | **Editorial Landing Page** | `/` | Desktop `1440px` + Mobile `390px` |
| **1** | **Public Product & Inline Checkout** (+ WhatsApp OG Preview) | `/p/[slug]` | Desktop 2-col `1040px` / Mobile `390px` |
| **2** | **Buyer Order Tracking & Resolution** (all 7 states + chain drawer) | `/o/[token]` | Mobile `390px` (Desktop centered `520px`) |
| **3** | **Seller Auth & Onboarding** | `/login`, `/signup`, `/onboarding` | Responsive centered `420px` card |
| **4** | **Seller Dashboard Shell** (Overview, Pay Links, Orders, Release Code Modal, Withdraw Modal) | `/dashboard/*` | Desktop `1440px` + Mobile `390px` (4-tab bottom nav) |
| **5** | **Create Pay Link & Share Confirmation** | `/dashboard/products/new` | Single-column `640px` |
| **6** | **Admin Dispute Arbitration** | `/admin` | Desktop `960px` |
| **7** | **System States** (404, Error Boundary, Loading Skeletons, Branded Favicon) | `not-found.tsx`, `error.tsx`, `loading.tsx`, `icon.svg` | All viewports |

---

## 4. Screen-by-Screen Architecture

### Screen 0: Editorial Landing Page (`/`)
- **Persistent Fixed Navbar:** Branded shield mark + `EscrowPay` wordmark on left, `Sign in` ghost link + `Create Store` charcoal pill on right (`backdrop-blur` warm-white hairline header).
- **Hero Band (`#FFFFFF`):** 2-column desktop / stacked mobile layout pairing editorial headline + primary CTA on the left with a custom studio lifestyle photograph (`public/images/hero-editorial.jpg`) and a floating interactive 3-beat **`EscrowFlowDemo`** widget (*Paid & Locked* → *Buyer Shares Code* → *Released to Seller*).
- **Alternating Editorial Bands (`#F8F6F1` / `#FFFFFF`):** Full-width paper/alabaster alternation explaining the 3-step loop (Create link → Buyer pays in Naira → 6-digit release code) and zero-signup buyer guarantees.
- **Footer (`#F8F6F1`):** Wordmark, concise positioning copy, quick links (`Sign in`, `Create store`), and honest copyright bar.

### Screen 1: Public Product & Inline Checkout (`/p/[slug]`)
*Buyers arrive directly from a WhatsApp or Instagram chat. No sidebar, no marketing nav.*

1. **Minimal Top Header (`56px`):**
   - Left: Shield mark + `EscrowPay` wordmark.
   - Right: Subtle warm pill (`#F8F6F1`, `1px solid #E5E5E5`): shield icon + `Escrow Protected`.
2. **Desktop 2-Column Gallery Sheet (`max-w-[1040px]`, stacks cleanly on `390px` mobile):**
   - **Left Column — Product Showcase & Seller Trust:**
     - Product photo frame (`4:3`, `object-contain` on `#F8F6F1` backdrop so tall studio/skincare photos are never clipped, clean fallback icon if no image).
     - Eyebrow (`JetBrains Mono`, `11px`, `#5F6368`): e.g. `48H DELIVERY WINDOW` or `2M TEST WINDOW`.
     - Product Name (`Plus Jakarta Sans` Medium `500`), optional description (`Inter` `14px`, `#5F6368`), and monospace price (`JetBrains Mono`, `28px`, `#1A1A1A`).
     - **Earned Seller Trust Strip (`#F8F6F1`, `rounded-xl`):** Initials avatar + Store Name + `98% completed · 42 orders` (or `New seller · Escrow protected`) + `4px` amber progress bar (`#FFB800`).
   - **Right Column — Zero-Signup Delivery Form (`#FFFFFF`):**
     - Section eyebrow: `DELIVERY DETAILS`
     - Fields:
       - **Full Name** (required)
       - **Phone / WhatsApp Number** (required)
       - **Email Address** (required — for Paystack payment receipt and order recovery)
       - **Structured Nigerian Delivery Address:** Street Address (required), City / Area (required), State select (36 states + FCT, required), and Landmark / Delivery Notes (optional)
     - Quiet note: *"No account or password needed. After paying, keep your order link to view your release code."*
     - Solid charcoal pill CTA (`#1A1A1A`, `48px`): **`Pay ₦45,000 Safely →`** + micro-copy *"Your money is held safely until you confirm delivery."*

### Screen 2: Buyer Order Tracking & Resolution (`/o/[token]`)
*Unified digital paper receipt sheet (`max-w-[520px]`) serving all 7 `OrderStatus` states.*

#### Top Minimal Header
- Wordmark on left + **`Copy order link`** outline pill on right (toggles to `Copied ✓`) so buyers never lose the URL in WhatsApp's in-app browser.

#### State 2A: `PENDING_PAYMENT` (Awaiting Paystack Checkout)
- Monospace eyebrow `ORDER #EPL-8042` + Warm Grey pill `Awaiting Payment`.
- Headline: **"Complete payment to lock ₦45,000 in escrow."**
- Compact order summary (product thumbnail, name, `₦45,000`, delivery window, buyer delivery address).
- Full-width charcoal pill CTA: **`Pay ₦45,000 via Paystack →`** + quiet *"Already paid? Refresh status"* action.

#### State 2B: `PROCESSING_PAYMENT` (Returned from Paystack `?verify=1`)
- Pulsing Amber pill **`Confirming Payment…`** with subtle progress indicator: *"Confirming your transfer and locking funds in escrow…"* (~5 seconds).

#### State 2C: `SECURED` or `SHIPPED` (Active Escrow)
1. **Status Header (`#F8F6F1`):** `ORDER #EPL-8042` + Amber pill **`Funds Locked in Escrow`** (or Blue pill **`Shipped — In Transit`** with timestamp), headline **"Your ₦45,000 is safe."**, and `4px` amber countdown progress bar + live client-side ticking readout (`46h 12m left for delivery`).
2. **6-Digit Release Code Panel:** Eyebrow `YOUR RELEASE CODE`, centered oversized monospace digits (`32px`, `letter-spacing: 0.18em`): **`4 8 2   9 1 0`** + `Copy` button + warning note (*"Share this code with the seller only when your item is in your hands."*).
3. **Resolution Actions:** Outline pills **`Report a problem`** (opens Dispute modal before deadline) and muted/disabled **`Claim full refund`** (*"Available after delivery window expires"*).

#### State 2D: Deadline Expired while `SECURED`, `SHIPPED`, or `DISPUTED`
- Countdown hits `0%` (`Delivery window expired`), headline updates to **"Delivery deadline passed — refund available."**, and **`Claim full refund`** becomes a full-width solid charcoal pill (`#1A1A1A`). `Report a problem` is hidden.

#### State 2E: `DISPUTED` (Before Deadline)
- Soft Coral pill **`Disputed — Frozen`** (`#FDECEC` / `#B42318`), headline **"Payout frozen for review."**, showing the buyer's submitted dispute reason.

#### State 2F: Terminal States (`RELEASED` / `REFUNDED`)
- **`RELEASED`:** Sage pill **`Delivered & Released`** (`#EBF7EE` / `#1E6B3A`), headline **"Delivery confirmed — ₦45,000 released."**, timestamp.
- **`REFUNDED`:** Warm Grey pill **`Refunded`**, headline **"₦45,000 refunded to buyer."**, timestamp.

#### Shared Bottom Component (All Post-Payment States): Collapsed Chain Receipt
- Hairline accordion at the bottom of the receipt: `Receipt on the chain ⌄`
- Expanded view shows Escrow Status (`OPEN` / `CLAIMED`), `Escrow Lock Tx`, and `Release / Refund Tx` with Stellar Expert Testnet links.

### Screen 3: Auth & Seller Onboarding (`/login`, `/signup`, `/onboarding`)
- Centered Warm Editorial card (`max-w-[420px]`, `#FFFFFF`, `rounded-2xl`, `1px solid #E5E5E5`) on `#F8F6F1`.
- **Sign In / Sign Up (`/login`, `/signup`):** Neon Auth email & password forms styled with `#1A1A1A` solid pill submit buttons and `1px solid #E5E5E5` `rounded-xl` inputs.
- **Onboarding (`/onboarding`, shown once after first signup):**
  - Eyebrow `STEP 1 OF 1 · STORE SETUP`, headline **"Set up your seller profile"**.
  - Fields: **Business / Store Name** (required), **WhatsApp Number** (optional), **Instagram Handle** (optional).
  - CTA: **`Create Store & Continue →`**.

### Screen 4: Seller Dashboard (`/dashboard/*`)
*Desktop `1440px` app shell with `240px` fixed left sidebar; switches to a fixed 4-tab bottom navigation bar on mobile (`< 768px`).*

1. **Navigation:**
   - **Desktop Sidebar (`240px`):** Store Name + `EscrowPay` mark, solid charcoal **`+ Create Link`** CTA, links for **Overview**, **Pay Links**, **Orders** (with amber count badge for `SECURED` orders), **Payouts** (opens Withdraw modal), and bottom seller email + **Sign out**.
   - **Mobile Bottom Nav (`< 768px`):** Fixed 4-tab bar (**Overview**, **Links**, **Orders**, **Payouts**) with active `#1A1A1A` state and safe-area padding.
2. **Dashboard Overview (`/dashboard`) — Top Summary Banner (`#F8F6F1`, `rounded-2xl`):**
   - Monospace **Available Balance** (live from Horizon with count-up) + **In Escrow** total (DB-aggregated).
   - Compact metrics row: `Completed` · `Disputed` · `Completion Rate`.
   - **`Withdraw to Bank`** charcoal pill opening the honest coming-soon modal (*"Payouts launch with our banking partner"*).
3. **Orders View (`/dashboard/orders` & `/dashboard/orders/[id]`):**
   - Server-paginated (18/page) with `PaginationControls`, URL-driven search (`?q=`), and status chips (`All`, `Ship Now`, `In Transit`, `Released`, `Disputed`, `Refunded`) backed by `groupBy` counts.
   - Order cards display product thumbnail, status pill, buyer name/phone/address, monospace amount, live countdown, and contextual actions (**`Mark as shipped`**, **`Enter release code`**, **`View receipt`**).
   - **Segmented 6-Digit Release Code Input (`SixDigitCodeInput`):** Used in both `ReleaseCodeModal` and `VendorOrderDetailView` — 6 individual monospace boxes with auto-advance, Backspace navigation, full 6-digit paste support, remaining attempts indicator (`5 attempts max`), and **`Confirm & Release ₦X`** CTA.
4. **Pay Links View (`/dashboard/products`):**
   - Server-paginated (12/page) list of created products with thumbnail, name, monospace price, delivery window, active toggle, **`Copy link`** pill, and monochrome outlined **`Share to WhatsApp`** pill (`#25D366/12` hover/tap tint).

### Screen 5: Create Pay Link & Share Confirmation (`/dashboard/products/new`)
1. **Single-Column Form (`max-w-[600px]`, `#FFFFFF`, `rounded-2xl`, `1px solid #E5E5E5`):**
   - **Product Photo URL:** URL input (`https://…`) + live `16:10` preview box (`#F8F6F1` background).
   - **Product Name** + **Description** (optional).
   - **Price in Naira (`₦`):** Input with fixed `₦` prefix and `JetBrains Mono` digits.
   - **Delivery Window Selector:** Responsive pill grid (3×2 on mobile) offering **`2m (Test)`** | **`24h`** | **`48h`** | **`72h`** | **`7 days`** | **`Custom`** (numeric input supporting `2..43200` minutes / 30 days).
   - Submit CTA: **`Create Pay Link →`**.
2. **Generated Link Confirmation State:**
   - Copy bar (`#F8F6F1`, `rounded-full`) + charcoal **`Copy`** pill.
   - **Live WhatsApp Preview Mockup** showing the Open Graph card inside a chat bubble.
   - Primary **`Share to WhatsApp`** (monochrome outlined WhatsApp mark with translucent `#25D366/12` hover/tap) + secondary **`View link`**.

### Screen 6: Admin Dispute Arbitration (`/admin`)
- Server-paginated queue (20/page, `max-w-[960px]`).
- Header: Eyebrow `ADMIN ARBITRATION` + count of open `DISPUTED` orders.
- Each disputed order card shows Order ID, product name, monospace amount, seller name, buyer name/phone, Soft Coral panel (`#FDECEC`) with buyer's **Dispute Reason**, and countdown status.
- **Equal-Weight Actions (enabled when `now <= deadline`):** Two neutral outline pills — **`Refund Buyer`** and **`Release to Seller`** (styled with equal visual weight to avoid biasing the arbiter).
- **When `now > deadline`:** Actions disabled with muted notice: *"Escrow window expired on-chain; buyer can claim refund directly."*
- Includes collapsed **`Receipt on the chain ⌄`** drawer.

### System States (`not-found.tsx`, `error.tsx`, `loading.tsx`, `icon.svg`)
- **404 (`src/app/not-found.tsx`):** Centered Warm Editorial card with `404` eyebrow, clear recovery message, and `Return Home` / `Go to Dashboard` pill actions.
- **Error Boundary (`src/app/error.tsx`):** Graceful recovery UI with `Try Again` (`reset()`) and `Return Home` pills, zero stack-trace leakage.
- **Loading Skeletons:** Subtle pulse skeletons matching exact page geometry on `/dashboard`, `/p/[slug]`, and `/o/[token]`.
- **Brand Identity:** Custom charcoal shield + golden checkmark SVG favicon (`src/app/icon.svg`) and root Open Graph / Twitter metadata in `src/app/layout.tsx`.
