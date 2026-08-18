import { useTranslation } from 'react-i18next';
import { Github, Linkedin, MessageCircle, Mail } from 'lucide-react';
import Logo from '../common/Logo.jsx';

const WHATSAPP_NUMBER = '966565242911';
const CONTACT_EMAIL = 'talal.n.albuqami@gmail.com';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const socials = [
    { Icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/talal-albuqami-033371342' },
    { Icon: Github, label: 'GitHub', href: 'https://github.com/Talal-1t' },
    { Icon: MessageCircle, label: 'WhatsApp', href: `https://wa.me/${WHATSAPP_NUMBER}` },
    { Icon: Mail, label: 'Email', href: `mailto:${CONTACT_EMAIL}` },
  ];

  return (
    <footer className="border-t border-border py-10">
      <div className="container-shell flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-start">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Logo />
          <p className="text-xs text-muted">
            © {year} Basira AI. {t('footer.rights')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {socials.map(({ Icon, label, href }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
              aria-label={label}
              className="flex size-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-primary hover:text-primary"
            >
              <Icon className="size-4" strokeWidth={1.9} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
