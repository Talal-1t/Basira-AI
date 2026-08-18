import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import Logo from '../common/Logo.jsx';
import LanguageSwitch from '../common/LanguageSwitch.jsx';
import DashboardMockup from '../dashboard/DashboardMockup.jsx';
import AmbientBackground from '../common/AmbientBackground.jsx';

export default function AuthLayout({ title, subtitle, children }) {
  const { t } = useTranslation();
  return (
    <div className="relative min-h-screen bg-bg text-text">
      <AmbientBackground />

      <div className="grid min-h-screen lg:grid-cols-2">
        {/* form panel */}
        <div className="flex flex-col px-6 py-8 sm:px-12 lg:px-16">
          <div className="flex items-center justify-between">
            <RouterLink to="/" aria-label="Basira AI home">
              <Logo />
            </RouterLink>
            <LanguageSwitch />
          </div>

          <div className="flex flex-1 items-center py-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto w-full max-w-sm"
            >
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
              <div className="mt-8">{children}</div>
            </motion.div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted">
            <ShieldCheck className="size-3.5 text-primary" strokeWidth={2.25} />
            {t('auth.trust')}
          </div>
        </div>

        {/* brand / visual panel */}
        <div className="relative hidden overflow-hidden border-s border-border bg-surface lg:flex lg:flex-col lg:justify-center lg:px-16">
          <div aria-hidden="true" className="absolute inset-0 -z-10 grid-glow opacity-70" />
          <p className="max-w-md text-2xl font-bold leading-snug tracking-tight">
            {t('auth.brandPanel.title')}
          </p>
          <p className="mt-3 max-w-sm text-sm text-muted">{t('auth.brandPanel.subtitle')}</p>
          <div className="mt-10">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </div>
  );
}
