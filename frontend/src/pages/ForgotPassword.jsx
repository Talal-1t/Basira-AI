import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Mail, MailCheck } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import FormField from '../components/auth/FormField.jsx';
import Button from '../components/common/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { authErrorMessage } from '../utils/authErrors.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    if (!email) {
      setError(t('auth.errors.emailRequired'));
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError(t('auth.errors.emailInvalid'));
      return;
    }
    setError('');

    setSubmitting(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setFormError(authErrorMessage(err, t));
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <AuthLayout title={t('auth.forgotPassword.sentTitle')}>
        <div className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="size-6 text-primary" strokeWidth={1.9} />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {t('auth.forgotPassword.sentSubtitle', { email })}
          </p>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-6 text-sm font-medium text-primary hover:text-primary-hover disabled:opacity-50"
          >
            {t('auth.forgotPassword.resend')}
          </button>
          <p className="mt-8 text-sm text-muted">
            <Link to="/login" className="font-medium text-primary hover:text-primary-hover">
              {t('auth.forgotPassword.backTo')} {t('auth.forgotPassword.login')}
            </Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('auth.forgotPassword.title')} subtitle={t('auth.forgotPassword.subtitle')}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-xs text-danger">
            {formError}
          </div>
        )}

        <FormField
          id="email"
          type="email"
          label={t('auth.fields.email')}
          placeholder={t('auth.fields.emailPlaceholder')}
          icon={Mail}
          error={error}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? t('auth.forgotPassword.submitting') : t('auth.forgotPassword.submit')}
        </Button>

        <p className="text-center text-sm text-muted">
          <Link to="/login" className="font-medium text-primary hover:text-primary-hover">
            {t('auth.forgotPassword.backTo')} {t('auth.forgotPassword.login')}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
