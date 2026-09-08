# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are office workers who need free, quick PDF utilities during everyday document work. They arrive with practical tasks: compressing a PDF for email, merging files before sending, converting between Word and PDF, or building a small repeatable PDF workflow.

## Product Purpose

Shining PDF Tools is a free web toolkit for common PDF tasks. It exists to let office workers finish file chores without installing desktop software, creating an account, or sending browser-processed PDFs to a server.

Success means a user understands the available tool, selects local files confidently, completes the operation, and downloads the result without confusion.

## Positioning

The product is a no-account PDF utility site for office work, hosted at `shining.io.vn`, with privacy-forward browser processing where technically possible.

## Operating Context

Users are likely working with business documents, forms, scans, reports, contracts, and email attachments. The product must support short, task-driven visits rather than long onboarding. It currently supports English and Vietnamese routes.

## Capabilities and Constraints

Confirmed active tools include Compress PDF, Merge PDF, Workflow Builder, Word to PDF, and PDF to Word. Planned tools include Split PDF, JPG to PDF, PDF to JPG, and Rotate PDF.

PDF merge, compression, and workflow operations are designed to run locally in the browser. Word/PDF conversion uses a secure converter service, includes verification when configured, enforces file-size limits, and treats PDF to Word as best-effort because complex layouts may not become identical editable documents.

The product is free and does not require accounts. Future work must not invent paid plans, enterprise claims, unlimited guarantees for server-side conversion, testimonials, customer lists, or performance benchmarks without evidence.

## Brand Commitments

The domain is `shining.io.vn`. The brand needs a new logo and a new bento-style visual system inspired by BentoPDF, adapted for Shining rather than copied.

The UI direction should use shadcn-style owned components and a bento listing pattern for tools.

## Evidence on Hand

Current code includes a Next.js 15, React 19, Tailwind CSS v4 app with localized English and Vietnamese dictionaries. Current routes and copy live under `src/app`, `src/i18n`, `src/lib/tools.ts`, and feature folders under `src/features`.

There are no confirmed testimonials, customer logos, published usage metrics, or proprietary brand assets in the repository.

## Product Principles

- Finish the document task fast, with minimal ceremony.
- Make privacy and no-account use visible at the point of action.
- Keep every tool page practical enough for office workers under time pressure.
- Be honest about technical limits, especially server-side conversion and best-effort layout recovery.
- Let the design feel polished and memorable without making the utility feel heavy.

## Accessibility & Inclusion

The product should remain keyboard-accessible, responsive on mobile and desktop, and readable in both English and Vietnamese. File controls, errors, progress states, and download actions must remain clear to non-technical users.
