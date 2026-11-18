# Aiman Kabli GTM Campaign Room

Private Next.js dashboard. Set `PORTAL_PASSWORD` and `SESSION_SECRET` as encrypted Vercel environment variables before deployment. Never commit secrets or lead-level personal information. Middleware checks signed HttpOnly session cookie before serving dashboard routes. Change SESSION_SECRET to revoke all sessions. Metrics are campaign snapshots, not live CRM data.
