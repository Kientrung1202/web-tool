---
name: Shining PDF Tools
description: A bento-style, privacy-forward PDF toolkit for office workers.
colors:
  background: "oklch(15% 0.01 260)"
  foreground: "oklch(97% 0.005 255)"
  muted-foreground: "oklch(72% 0.015 255)"
  panel: "oklch(20% 0.012 260)"
  panel-raised: "oklch(24% 0.014 260)"
  border: "oklch(100% 0 0 / 0.12)"
  primary: "oklch(67% 0.16 255)"
  primary-foreground: "oklch(98% 0.005 255)"
  secondary: "oklch(72% 0.13 165)"
  warning: "oklch(78% 0.14 85)"
typography:
  display:
    fontFamily: "DM Sans, Geist, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "0"
  body:
    fontFamily: "DM Sans, Geist, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0"
rounded:
  sm: "6px"
  md: "8px"
  lg: "14px"
  xl: "20px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "80px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "0 22px"
  tool-tile:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "24px"
---

# Design System: Shining PDF Tools

<!-- SEED: established with the user before implementation; re-run $impeccable document once there's code to capture the actual tokens and components. -->

## Overview

**Creative North Star: "The Document Control Desk"**

Shining PDF Tools should feel like a focused desktop workspace: dark, calm, fast, and arranged in useful bento surfaces. The reference from BentoPDF is the discipline, not the skin: strong privacy message, compact navigation, one clear action, gridded trust signals, and tool listing that feels like a set of utilities ready to pick up.

The product should not become a generic SaaS landing page. The interface is the product. Every surface should help an office worker pick a task, understand privacy implications, upload files safely, watch progress, and download the result.

**Key Characteristics:**
- Dark-first product-tool canvas with subtle grid depth.
- Bento tool directory with mixed tile sizes and clear task hierarchy.
- Shadcn-style primitives customized with Shining tokens.
- Privacy badges placed near file actions, not buried in marketing copy.
- Minimal motion: tactile state changes and restrained reveal only.

## Colors

Use a dark neutral base with a single electric-blue primary accent and restrained semantic colors for privacy, success, and caution.

### Primary
- **Shining Blue**: the main action color for primary CTAs, focus rings, active tool states, and the logo accent.

### Secondary
- **Private Mint**: used only for privacy/safety confirmations and successful local-processing states.

### Tertiary
- **Office Amber**: used only for warnings such as mobile limits, file-size limits, or best-effort conversion notes.

### Neutral
- **Ink Desk**: the page background.
- **Raised Desk Panel**: bento cells, cards, inputs, and tool workspaces.
- **Soft Line**: borders, separators, and control outlines.
- **Paper White**: primary foreground text.
- **Muted Paper**: secondary explanatory text.

### Named Rules

**The One Accent Rule.** Shining Blue is the only promotional/action accent across a page; mint and amber are semantic, not decorative.

**The Privacy Color Rule.** Private Mint appears only when the claim is operationally true for that tool or state.

## Typography

**Display Font:** DM Sans, falling back to Geist and system sans.
**Body Font:** DM Sans, falling back to Geist and system sans.

**Character:** Rounded, modern, and direct. It should feel closer to a polished product tool than an editorial magazine or corporate PDF suite.

### Hierarchy
- **Display**: bold, large, tight but unclipped. Used for homepage and tool-page hero messages.
- **Headline**: bold, compact section titles for bento groups and tool workspaces.
- **Title**: medium-to-bold labels for tool cards, settings panels, and file lists.
- **Body**: readable explanatory copy with a 65-75ch maximum.
- **Label**: small, medium-weight control text. Avoid uppercase tracking except for rare system labels.

### Named Rules

**The Office-Plain Rule.** Copy should name actions plainly: Merge PDF, Compress PDF, Download result. No poetic labels for core workflow.

## Layout

The homepage should use a bento directory rather than equal cards. Active tools deserve larger, richer tiles; coming-soon tools can be smaller and quieter. The first viewport should establish: brand, free/no-account promise, privacy-forward processing, and a direct path to tools.

Use a max content width around 1120-1280px. Desktop layouts may use asymmetric grid spans; mobile collapses into a single column with stable tile order and no horizontal overflow.

Tool pages should feel like workbenches: upload area, selected files, settings, progress, and final download arranged as functional bento panels. Privacy and limits should sit next to the action that depends on them.

## Elevation & Depth

Depth comes from tonal layering, borders, and very soft shadows. Avoid heavy floating-card shadows. The dark background can use a subtle grid or radial field, but it must not overpower text or file controls.

### Named Rules

**The Workbench Layer Rule.** A panel is raised because it contains a task area, control group, or output state. Decorative empty panels are not allowed.

## Shapes

Use a controlled radius system: 6px for small controls, 8px for buttons and inputs, 14-20px for bento panels. Pills are reserved for compact status chips and counters only.

The logo direction should be a simple vector mark: a bright, angular "S" or folded-page spark that can sit beside the Shining wordmark and shrink to a favicon. It should not look like a generic PDF file icon.

## Components

### Buttons
- **Shape:** compact rounded rectangle (8px).
- **Primary:** Shining Blue background, Paper White text, 48px height on desktop, full-width where mobile action needs confidence.
- **Hover / Focus:** slight lift or brightness shift, visible focus ring, no glow halo.
- **Secondary:** transparent or raised-panel fill with Soft Line border.

### Bento Tool Tiles
- **Shape:** large rounded panels (14-20px).
- **Background:** varied dark panels with at least two cells using visual variation, such as a grid field, icon cluster, or semantic accent wash.
- **Content:** tool name, one-line job statement, availability/status, and one clear action area.
- **States:** hover lift, border tint, keyboard focus, disabled/coming-soon treatment.

### Inputs / Fields
- **Style:** raised dark panel fill, visible border, 8px radius.
- **Focus:** Shining Blue ring with enough contrast.
- **Error / Disabled:** inline message below the field or file area.

### Navigation
- **Style:** single-line desktop nav with logo, key links, locale switch, and no crowding.
- **Mobile:** logo, compact utility action if needed, and menu icon. Keep height under 80px.

## Do's and Don'ts

### Do:
- **Do** preserve route slugs and localized EN/VI content unless a migration is explicitly approved.
- **Do** use shadcn/ui as owned primitives, then restyle tokens to this system.
- **Do** make the tool listing a real bento grid with mixed spans and exact cell count.
- **Do** show privacy truth near upload and conversion actions.
- **Do** keep file processing states complete: empty, loading, progress, error, success, and download.

### Don't:
- **Don't** copy BentoPDF's brand, logo, customer logos, GitHub stars, or unsupported claims.
- **Don't** use equal three-card feature rows as the main homepage structure.
- **Don't** invent testimonials, usage metrics, enterprise customers, or offline guarantees.
- **Don't** use purple-blue AI gradients, decorative status dots, scroll cues, or section-number labels.
- **Don't** let bento cells become nested cards.
