---
title: Escrow Pay Links — UI Design Specification
aesthetic: Warm Editorial Minimalism
status: locked
related_docs:
  intent: ../intent.md
  system_design: ../system-design.md
  plan: ../plan.md
lookup:
  principles_and_constraints:
    lines: "62-78"
    summary: Zero-wallet UX, zero-signup buying, honest test boundaries, mobile/desktop viewports
  tokens:
    colors:
      lines: "83-94"
      values: ["#FFFFFF", "#F8F6F1", "#1A1A1A", "#5F6368", "#E5E5E5", "#F4F3EF", "#FFB800"]
    status_pills:
      lines: "95-108"
      statuses: [PENDING_PAYMENT, PROCESSING_PAYMENT, SECURED, SHIPPED, RELEASED, REFUNDED, DISPUTED]
    typography_and_radii:
      lines: "109-124"
      fonts: ["Plus Jakarta Sans / Inter", "JetBrains Mono"]
  screen_inventory:
    lines: "127-139"
  screens:
    product_checkout:
      route: "/p/[slug]"
      viewport: "390px (max 440px)"
      lines: "144-174"
    buyer_order_tracking:
      route: "/o/[token]"
      viewport: "390px (max 440px)"
      lines: "175-232"
      includes: [PENDING_PAYMENT, PROCESSING_PAYMENT, SECURED, SHIPPED, deadline_expired, DISPUTED, RELEASED, REFUNDED, chain_receipt_drawer]
    auth_and_onboarding:
      routes: ["/login", "/signup", "/onboarding"]
      lines: "233-241"
    seller_dashboard:
      route: "/dashboard/*"
      viewport: "1440px / 390px"
      lines: "242-270"
      includes: [sidebar, summary_banner, withdraw_modal, filter_bar, order_cards, release_code_modal, pay_links]
    create_pay_link:
      route: "/dashboard/products/new"
      lines: "271-282"
      includes: [image_url_preview, window_pills_2m_to_7d, whatsapp_og_preview]
    admin_disputes:
      route: "/admin"
      lines: "283-290"
  design_agent_brief:
    lines: "293-295"
---

# Escrow Pay Links — UI Design Specification

> **Purpose:** Complete, execution-ready UI/UX specification for a design agent (Figma, v0, Stitch, Lovable, or frontend build).  
> **Aesthetic Direction:** **Warm Editorial Minimalism** — pure white receipt surfaces, warm alabaster protection banners, deep charcoal pill CTAs, crisp `1px` hairline dividers, and tabular monospace numbers.  
> **Aligned With:** [`intent.md`](../intent.md) & [`system-design.md`](../system-design.md)

---

## 1. Design Philosophy & Hard Constraints

Social-commerce buyers in Nigeria are hyper-vigilant about scams. A calm, receipt-like interface signals institutional safety far better than loud neon fintech UI.

### Non-Negotiable Rules
1. **Zero-Wallet / Zero-Crypto UX:** Never display words like *crypto, blockchain, wallet, XLM, Stellar, Soroban,* or *gas* anywhere in buyer or seller flows. Buyers and sellers only see **Naira (`₦`)**, **delivery windows**, **Paystack checkout**, and a **6-digit release code**.
   - *Only exception:* A single muted, collapsed accordion at the bottom of order pages labeled **`Receipt on the chain`**.
2. **Zero-Signup Buying:** Buyers never create an account, password, or profile. They land on a link, fill in delivery details, pay, and track via their unique order URL (`/o/[token]`).
3. **Honest Boundaries (No Fake Features):**
   - Paystack is clearly badged **`TEST MODE`** on the awaiting-payment screen.
   - Do **not** promise SMS notifications (copy must tell buyers to keep/bookmark/copy their order link).
   - **`Withdraw to Bank`** opens an honest coming-soon modal (*"Payouts launch with our banking partner"*), never a fake payout success screen.
   - Product images use an **Image URL input + live preview** (not a file-upload dropzone).
4. **Mobile-First Buyer, Responsive Desktop Seller:**
   - Buyer screens (`/p/[slug]`, `/o/[token]`) are designed for **`390px`** mobile viewports (WhatsApp/Instagram in-app browsers) and centered cleanly (`max-w-[440px]`) on desktop.
   - Seller screens (`/dashboard/*`, `/admin`) use a `1440px` desktop app shell with a `240px` left sidebar, collapsing cleanly into a mobile drawer/bottom-nav at `< 768px`.

---

## 2. Design Tokens

### 2.1 Color Palette

| Token | Hex | Usage |
| --- | --- | --- |
| **Canvas (`bg-canvas`)** | `#FFFFFF` | Page background, main cards, form inputs, modals |
| **Warm Surface (`bg-warm`)** | `#F8F6F1` | Escrow protection banners, 6-digit code container backdrop, seller trust strip, active sidebar item, summary banner |
| **Primary Ink / CTA (`ink-primary`)** | `#1A1A1A` | Headings, primary solid pill buttons (`rounded-full`), active pill tabs |
| **Secondary Ink (`ink-muted`)** | `#5F6368` | Helper text, delivery instructions, timestamps, muted metadata |
| **Hairline Border (`border-hairline`)** | `#E5E5E5` | `1px` card borders, receipt dividers, input borders |
| **Hover Surface (`bg-subtle`)** | `#F4F3EF` | Subtle button/row hover states |
| **Escrow Amber (`accent-amber`)** | `#FFB800` | Thin `4px` countdown progress bar & seller completion trust bar |

### 2.2 Semantic Status Pills (Mapped 1:1 to `OrderStatus`)

All status badges use `rounded-full`, `12px` medium text (`font-mono` or `font-sans`), `px-2.5 py-1`:

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

- **UI Sans-Serif:** `Plus Jakarta Sans` or `Inter` — weights **`400` (Regular)** and **`500` (Medium)**, `600` (Semibold) sparingly for main screen titles only. Avoid heavy `700–800` bold weights to preserve the calm editorial tone.
- **Trust & Precision Monospace:** `JetBrains Mono` (`tabular-nums`) — used strictly for:
  - Naira amounts: `₦45,000`
  - The 6-digit release code: `4 8 2   9 1 0`
  - Delivery countdowns: `47h 18m left`
  - Uppercase tracked eyebrows (`11px`, `tracking-[0.08em]`): `ESCROW PROTECTED`, `YOUR RELEASE CODE`, `ORDER #EPL-8042`, `RECEIPT ON THE CHAIN`

### 2.4 Radii, Borders & Elevation
- **Cards & Banners:** `16px` (`rounded-2xl`), `1px solid #E5E5E5` (or borderless `#F8F6F1` for nested warm panels).
- **Inputs:** `12px` (`rounded-xl`), `1px solid #E5E5E5`, `44px` min touch height, focus ring `1.5px solid #1A1A1A`.
- **Primary & Secondary Buttons:** `9999px` (`rounded-full`), `48px` height on mobile CTAs, `40px` on desktop actions.
- **Filter Chips / Window Tabs:** `8px` (`rounded-lg`) for filter chips; `9999px` pill segment for delivery windows.
- **Elevation:** Flat by default using hairline borders. Only highlighted action cards (e.g., Release Code card, Modals) use soft shadow: `0 8px 24px rgba(26, 26, 26, 0.06)`.

---

## 3. Screen Inventory

Design the following **6 flows** across the viewports specified:

| # | Screen / Flow | Route | Primary Viewport |
| --- | --- | --- | --- |
| **1** | **Public Product & Inline Checkout** (+ WhatsApp OG Card preview) | `/p/[slug]` | Mobile `390px` (Desktop centered `440px`) |
| **2** | **Buyer Order Tracking & Resolution** (all 7 order states + chain drawer) | `/o/[token]` | Mobile `390px` (Desktop centered `440px`) |
| **3** | **Seller Auth & Onboarding** | `/login`, `/signup`, `/onboarding` | Responsive centered `420px` card |
| **4** | **Seller Dashboard Shell** (Overview, Pay Links, Orders, Release Code Modal, Withdraw Modal) | `/dashboard/*` | Desktop `1440px` + Mobile `390px` |
| **5** | **Create Pay Link & Share Confirmation** | `/dashboard/products/new` | Modal / `640px` single-column view |
| **6** | **Admin Dispute Queue** | `/admin` | Desktop `1280px` |

---

## 4. Screen-by-Screen Architecture

### Screen 1: Public Product & Inline Checkout (`/p/[slug]`)
*Buyers arrive directly from a WhatsApp or Instagram chat. No sidebar, no top navigation links.*

1. **Minimal Top Header (`56px`):**
   - Left: Wordmark (`EscrowPay` or clean typographic mark).
   - Right: Subtle warm pill (`#F8F6F1`, `1px solid #E5E5E5`): shield icon + `Escrow Protected`.
2. **Product Hero Card (`rounded-2xl`, `#FFFFFF`, `1px solid #E5E5E5`):**
   - Top: Full-bleed product photo (`4:3` aspect ratio, clean fallback placeholder if no image).
   - Hairline divider (`1px solid #E5E5E5`).
   - Content block (`20px` padding):
     - Eyebrow (`JetBrains Mono`, `11px`, `#5F6368`): `48H DELIVERY WINDOW` *(renders `2M TEST WINDOW` if 2-min test product)*.
     - Product Name (`20px`, Medium `500`, `#1A1A1A`).
     - Optional short description (`14px`, `#5F6368`, max 3 lines).
     - Monospace Price (`28px`, `JetBrains Mono`, `#1A1A1A`): `₦45,000`.
3. **Earned Seller Trust Strip (`#F8F6F1`, `rounded-xl`, `14px` padding, nested or directly below card):**
   - Top row:
     - Left: Initials circle avatar (`32px`, `#1A1A1A` text on `#FFFFFF` with `#E5E5E5` border) + Seller Store Name (`14px` Medium).
     - Right: `98% completed · 42 orders` (`JetBrains Mono`, `12px`, `#1A1A1A`). *(If 0 finished orders: `New seller · Escrow protected`.)*
   - Bottom: Thin `4px` rounded track (`#E5E5E5`) with amber fill (`#FFB800`) proportional to completion rate.
4. **Zero-Signup Delivery Form (`#FFFFFF`, `rounded-2xl`, `1px solid #E5E5E5`, `20px` padding):**
   - Section eyebrow: `DELIVERY DETAILS`
   - Fields (stack with `12px` gap):
     - **Full Name** (required)
     - **Phone / WhatsApp Number** (required, e.g., `0803 123 4567`)
     - **Delivery Address** (required, textarea / 2 lines)
     - **Email** (optional, helper: *"Optional — for payment receipt"*)
   - Quiet note at bottom of form (`12px`, `#5F6368`): *"No account or password needed. After paying, keep your order link to view your release code."*
5. **Sticky Bottom CTA Bar (`#FFFFFF`, `border-t: 1px solid #E5E5E5`, `16px` padding):**
   - Full-width solid charcoal pill button (`#1A1A1A`, `#FFFFFF` text, `48px` height): **`Pay ₦45,000 Safely →`**
   - Micro-copy centered below (`12px`, `#5F6368`): *"Your money is held safely until you confirm delivery."*

### Screen 2: Buyer Order Tracking & Resolution (`/o/[token]`)
*This single capability URL serves the buyer through the entire order lifecycle. Show clean state transitions for all states below.*

#### Top Minimal Header
- Wordmark on left + **`Copy order link`** subtle outline pill on right (toggles to `Copied ✓`) so the buyer doesn't lose the URL in WhatsApp's in-app browser.

#### State 2A: `PENDING_PAYMENT` (Awaiting Paystack Checkout)
1. **Header Card (`#F8F6F1`, `rounded-2xl`, `20px` padding):**
   - Top row: Monospace eyebrow `ORDER #EPL-8042` + Warm Grey pill `Awaiting Payment`.
   - Test mode notice pill (`#FFF4D6`, `#8A5A00`): `TEST MODE · Paystack Sandbox`.
   - Headline: **"Complete payment to lock ₦45,000 in escrow."**
   - Subcopy: *"Use Paystack Bank Transfer (or Simulate Success in Test Mode) to secure your order."*
2. **Order Summary Card (`#FFFFFF`, `rounded-2xl`, `1px solid #E5E5E5`):**
   - Product thumbnail + name, amount (`₦45,000`), delivery window (`48 hours`), buyer delivery address.
3. **Primary Action:**
   - Full-width solid charcoal pill (`#1A1A1A`): **`Pay ₦45,000 via Paystack →`** (opens Paystack checkout URL).
   - Quiet link below: *"Already paid? Refresh status"* (triggers verify check).

#### State 2B: `PROCESSING_PAYMENT` (Returned from Paystack `?verify=1`)
- Same summary card with pulsing Amber pill **`Confirming Payment…`** and subtle loading progress indicator: *"Confirming your transfer and locking funds in escrow…"* (typically ~5 seconds).

#### State 2C: `SECURED` or `SHIPPED` (Active Escrow)
1. **Status Header Banner (`#F8F6F1`, `rounded-2xl`, `20px` padding):**
   - Top row: `ORDER #EPL-8042` + Amber pill **`Funds Locked in Escrow`** (or Blue pill **`Shipped — In Transit`** with `Shipped 2h ago`).
   - Headline (`22px` Medium): **"Your ₦45,000 is safe."**
   - Thin `4px` amber countdown progress bar (`#FFB800`) + monospace readout: `46h 12m left for delivery` (live ticking).
2. **6-Digit Release Code Card (`#FFFFFF`, `rounded-2xl`, `1px solid #E5E5E5`, soft shadow):**
   - Eyebrow (`JetBrains Mono`, `11px`, `#5F6368`): `YOUR RELEASE CODE`
   - Centered oversized monospace digits (`32px`, `letter-spacing: 0.18em`, `#1A1A1A`): **`4 8 2   9 1 0`** + subtle `Copy` icon button.
   - Warning note (`13px`, `#5F6368`): *"Share this code with the seller **only** when your item is in your hands. Giving this code releases your money."*
3. **Resolution Actions (below hairline divider):**
   - Two secondary outline pill buttons (`1px solid #E5E5E5`, `rounded-full`):
     - **`Report a problem`** (opens Dispute modal with reason textarea before deadline).
     - **`Claim full refund`** — muted/disabled (`opacity-50`, helper text: *"Available after delivery window expires"*).

#### State 2D: Deadline Expired while `SECURED`, `SHIPPED`, or `DISPUTED`
- Status banner countdown bar hits `0%` with monospace text: `Delivery window expired`.
- Headline updates to: **"Delivery deadline passed — refund available."**
- **`Claim full refund`** button switches from disabled outline to **full-width solid charcoal pill (`#1A1A1A`)**.
- `Report a problem` button is hidden.

#### State 2E: `DISPUTED` (Before Deadline)
- Top pill: Soft Coral **`Disputed — Frozen`** (`#FDECEC` / `#B42318`).
- Banner headline: **"Payout frozen for review."**
- Displays buyer's submitted dispute reason and helper text: *"An administrator is reviewing this order. Funds cannot be released to the seller while disputed."*

#### State 2F: Terminal States (`RELEASED` / `REFUNDED`)
- **`RELEASED`:** Sage pill **`Delivered & Released`** (`#EBF7EE` / `#1E6B3A`), headline **"Delivery confirmed — ₦45,000 released."**, timestamp (`Released Nov 19, 14:22`). Release code box hidden/collapsed.
- **`REFUNDED`:** Warm Grey pill **`Refunded`**, headline **"₦45,000 refunded to buyer."**, timestamp.

#### Shared Bottom Component (All Post-Payment States): Collapsed Chain Receipt
- Single hairline row at bottom of `/o/[token]` (`1px solid #E5E5E5`, `rounded-xl`):
  - Collapsed header (`JetBrains Mono`, `12px`, `#5F6368`): `Receipt on the chain` + chevron `⌄`
  - Expanded view:
    - Escrow Status (`OPEN` / `CLAIMED`)
    - `Escrow Lock Tx`: truncated hash + external link icon (Stellar Expert testnet)
    - `Release / Refund Tx`: truncated hash + link (when present)

### Screen 3: Auth & Seller Onboarding (`/login`, `/signup`, `/onboarding`)
- Centered card (`max-w-[420px]`, `#FFFFFF`, `rounded-2xl`, `1px solid #E5E5E5`, `32px` padding) on a `#F8F6F1` warm background.
- **Sign In / Sign Up (`/login`, `/signup`):** Neon Auth email & password card styled with Warm Editorial tokens (`#1A1A1A` solid pill submit button, `1px solid #E5E5E5` `rounded-xl` inputs).
- **Onboarding (`/onboarding`, shown once after first signup):**
  - Eyebrow: `STEP 1 OF 1 · STORE SETUP`
  - Headline: **"Set up your seller profile"**
  - Fields: **Business / Store Name** (required), **WhatsApp Number** (optional), **Instagram Handle** (optional).
  - CTA (`#1A1A1A` pill): **`Create Store & Continue →`** (shows subtle loading state while provisioning store account).

### Screen 4: Seller Dashboard (`/dashboard/*`)
*Desktop `1440px` app shell with `240px` fixed left sidebar; collapses to top bar + slide-over drawer on mobile.*

1. **Left Sidebar (`240px`, `#FFFFFF`, `border-r: 1px solid #E5E5E5`):**
   - Top: Store Name + `EscrowPay` badge.
   - Primary CTA: Full-width solid charcoal pill **`+ Create Link`** (`#1A1A1A`).
   - Nav links (`14px` Medium, `1.5px` stroke icons, active item in `#F8F6F1` `rounded-xl`):
     - **Overview** (`/dashboard`)
     - **Pay Links** (`/dashboard/products`)
     - **Orders** (`/dashboard/orders`, with small amber badge count for `SECURED` "Ship Now" orders)
     - **Payouts** (opens Withdraw modal)
   - Bottom: Seller email + **Sign out** ghost button.
2. **Dashboard Overview (`/dashboard`) — Top Split Summary Banner (`#F8F6F1`, `rounded-2xl`, `24px` padding):**
   - **Left (~65%):**
     - Two side-by-side monospace balance figures: `AVAILABLE BALANCE` (**`₦185,000`**) and `IN ESCROW` (**`₦90,000`**, `#8A5A00` label).
     - Compact metrics row (`13px`, `#5F6368`): `24 Completed` · `1 Disputed` · `96% Completion Rate`
     - Solid charcoal pill CTA: **`Withdraw to Bank`** (opens **Withdraw Modal**: pure white modal clearly labelled *"Demo Mode — Payouts launch with our banking partner. Real bank transfers are not active in test mode."*).
   - **Right (~35%, hidden on small mobile):** Subtle geometric wireframe illustration in warm beige/amber (`#E5E0D5` / `#FFB800`) depicting a parcel + shield motif.
3. **Orders View (`/dashboard/orders` & Overview Recent Orders):**
   - **Filter Bar:** Pill search input (`Search buyer or product…`) + `8px`-radius filter chips: `All`, `Ship Now` (`SECURED`), `In Transit` (`SHIPPED`), `Released`, `Disputed`, `Refunded`.
   - **Order Cards Grid (3-col desktop / 1-col mobile, `#FFFFFF`, `rounded-2xl`, `1px solid #E5E5E5`):**
     - **Top:** Product `40px` square thumbnail + Product Name + semantic status pill (e.g., Amber **`Payment secured, ship now`**).
     - **Middle (between `1px` hairlines):** Buyer Name + Phone (`0803…`) + Delivery Address (truncated to 2 lines, full in detail drawer/page); Monospace Amount (`₦45,000`) + Amber countdown bar (`22h left`).
     - **Footer Actions:** `SECURED` → **`Mark as shipped`** + **`Enter release code`**; `SHIPPED` → **`Enter release code`**; Terminal/Disputed → Timestamp + **`View receipt`** (with collapsed **`Receipt on the chain ⌄`**).
   - **Enter Release Code Modal / Detail View (`/dashboard/orders/[id]`):**
     - 6-digit segmented or large monospace input (`4 8 2 9 1 0`), remaining attempts indicator (`5 attempts max` → `"Incorrect code. 3 attempts remaining."` in Soft Coral `#B42318`, locked at `0`), and **`Confirm & Release ₦45,000`** CTA.
4. **Pay Links View (`/dashboard/products`):**
   - Grid/list of created products with thumbnail, name, monospace price (`₦45,000`), delivery window (`48h`), active toggle, **`Copy link`** pill, and **`Share to WhatsApp`** outline pill.

### Screen 5: Create Pay Link & Share Confirmation (`/dashboard/products/new`)
1. **Single-Column Form (`max-w-[600px]`, `#FFFFFF`, `rounded-2xl`, `1px solid #E5E5E5`, `28px` padding):**
   - **Product Photo URL:** Clean URL input (`https://…`) + live `16:10` preview box (`#F8F6F1` background, shows product image immediately when valid URL is pasted, or clean camera placeholder).
   - **Product Name** + **Description** (optional).
   - **Price in Naira (`₦`):** Input with fixed `₦` prefix and `JetBrains Mono` digits.
   - **Delivery Window Selector:** Pill tab group (`#F8F6F1` container, active option `#1A1A1A` solid charcoal with `#FFFFFF` text): **`2m (Test)`** | **`24h`** | **`48h`** | **`72h`** | **`7 days`**.
   - Submit CTA: **`Create Pay Link →`**.
2. **Generated Link Confirmation State:**
   - Copy bar (`#F8F6F1`, `rounded-full`): `https://escrowpay.ng/p/a9x4k2` + charcoal **`Copy`** pill.
   - **Live WhatsApp Preview Mockup:** Shows how the Open Graph card renders inside a WhatsApp chat bubble (product photo, title, `₦45,000 · 48h Escrow Protected`).
   - Primary CTA: **`Share to WhatsApp`** + secondary **`View link`**.

### Screen 6: Admin Dispute Arbitration (`/admin`)
- Clean single-column table/card queue (`max-w-[960px]`).
- Header: Eyebrow `ADMIN ARBITRATION` + count of open `DISPUTED` orders.
- Each disputed order card shows: Order ID, product name, monospace amount (`₦45,000`), seller name, buyer name/phone, Soft Coral panel (`#FDECEC`) with buyer's **Dispute Reason**, and countdown status.
- **Actions (enabled when `now <= deadline`):** Outline pill **`Refund Buyer`** + Charcoal pill **`Release to Seller`**.
- **When `now > deadline`:** Action buttons disabled with muted notice: *"Escrow window expired on-chain; buyer can claim refund directly."*
- Includes collapsed **`Receipt on the chain ⌄`** drawer.

---

## 5. Copy-Paste Brief for a Design Agent

> "Design the complete UI system in Figma/React for **Escrow Pay Links**, a Nigerian social-commerce Naira (`₦`) escrow payment link app, using **Warm Editorial Minimalism**: pure white (`#FFFFFF`) canvas and cards, warm alabaster (`#F8F6F1`) secondary surfaces and protection banners, deep charcoal (`#1A1A1A`) headings and solid pill CTAs (`rounded-full`), muted grey (`#5F6368`) helper copy, and `1px solid #E5E5E5` hairline borders. Pair `Plus Jakarta Sans` or `Inter` (`400`/`500` weights—avoid heavy bold) with `JetBrains Mono` (`tabular-nums`) for all Naira amounts (`₦45,000`), 6-digit release codes (`4 8 2   9 1 0`), countdown timers, and uppercase tracked eyebrows. Use `#FFB800` amber for thin `4px` escrow countdown/trust bars, and semantic pastel pills for all 7 order states (`Awaiting Payment`, `Confirming Payment…`, `Funds Locked / Ship Now`, `Shipped`, `Delivered & Released`, `Refunded`, `Disputed — Frozen`). Strictly avoid all crypto/wallet terminology—keep on-chain hashes inside a collapsed `Receipt on the chain ⌄` accordion at the bottom of order pages. Include: (1) mobile-first `390px` Public Product & Zero-Signup Inline Checkout (`/p/[slug]`), (2) mobile-first Buyer Order page (`/o/[token]`) covering Paystack Test Mode launch, verification loading, active 6-digit release code card, dispute modal, post-deadline refund state, and terminal states, (3) clean Auth + Store Onboarding (`/login`, `/signup`, `/onboarding`), (4) responsive `1440px` Seller Dashboard with `240px` left sidebar, `+ Create Link` pill CTA, split balance/escrow summary banner with `Withdraw to Bank` coming-soon modal, filterable order cards with `Mark as shipped` and 5-attempt-limited `Enter release code` modal, (5) Create Link form using Image URL + live preview and `2m (Test) | 24h | 48h | 72h | 7 days` delivery window pills + WhatsApp OG preview card, and (6) Admin Dispute Queue (`/admin`)."
