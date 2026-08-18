# Basira AI — Frontend

React 19 + Vite + Tailwind CSS v4, with instant Arabic (RTL) / English (LTR)
switching. No login required — the app is fully open.

## Pages

- `/` — landing page: hero, working upload area, feature cards, dashboard
  and chat previews, how-it-works, footer
- `/dashboard/:fileId` — real dashboard for an uploaded file: report header
  (with a working JSON export), status-colored KPI cards, a data-quality
  gauge, auto-generated charts (pie/bar/line/scatter via Recharts), a
  fields/schema panel, AI insights, and a PDF-specific view (headings,
  extracted tables, text preview) when the file is a PDF
- `/chat/:fileId` — real chat with the file: markdown-lite formatted AI
  replies, auto-resizing input (Enter to send, Shift+Enter for a newline),
  copy-to-clipboard on replies, suggested starter questions

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173. The app expects the backend at
`VITE_API_BASE_URL` (see `.env` / `.env.example`) — default is
`http://localhost:5000/api`.

## Project structure

```
src/
  components/
    layout/     Navbar, Footer, AppTopBar
    common/     Button, Logo, LanguageSwitch, AnimatedNumber, AmbientBackground
    hero/       Hero, InteractiveBanner
    upload/     UploadArea (uploads to the backend, redirects to the dashboard)
    features/   FeatureCards, HowItWorks
    dashboard/  ReportHeader, KpiCard, QualityGauge, ColumnsPanel, ChartCard,
                InsightsPanel, PdfPreview, DashboardMockup, DashboardPreview
    chat/       ChatWindow, ChatMessage, ChatPreview
  pages/        Home, Dashboard, Chat
  routes/       AppRoutes
  hooks/        useFileDashboard, useInsights, useLanguage
  services/     api (axios instance — upload/getFile/getInsights/askQuestion/deleteFile)
  utils/        cn, renderChatText (safe markdown-lite for chat replies)
  i18n/         i18next config + en/ar locale files
  styles/       Tailwind v4 theme tokens (index.css)
```

## Design tokens

All colors, fonts, and animation timings live in `src/styles/index.css` under
`@theme` (background `#050816`, primary `#22C55E`, Inter for English, IBM
Plex Sans Arabic for Arabic, dark mode by default).

## Not built yet

- Deployment (Vercel)
