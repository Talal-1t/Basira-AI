import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Upload } from 'lucide-react';
import Logo from '../common/Logo.jsx';
import LanguageSwitch from '../common/LanguageSwitch.jsx';
import Button from '../common/Button.jsx';

export default function AppTopBar() {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="container-shell flex h-16 items-center justify-between">
        <Link to="/" aria-label="Basira AI home">
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitch />
          <Button as={Link} to="/#upload" size="sm" variant="outline" icon={Upload} iconPosition="start">
            {t('dashboardPage.newFile')}
          </Button>
        </div>
      </div>
    </header>
  );
}
