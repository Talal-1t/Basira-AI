import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, LogIn } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import FormField from '../components/auth/FormField.jsx';
import PasswordField from '../components/auth/PasswordField.jsx';
import OrDivider from '../components/auth/OrDivider.jsx';
import GoogleButton from '../components/auth/GoogleButton.jsx';
import Button from '../components/common/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { authErrorMessage } from '../utils/authErrors.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();

  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const redirectTo = location.state?.from || '/';

  function validate() {
    const next = {};
    if (!values.email) next.email = t('auth.errors.emailRequired');
    else if (!EMAIL_RE.test(values.email)) next.email = t('auth.errors.emailInvalid');
    if (!values.password) next.password = t('auth.errors.passwordRequired');
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login(values);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setFormError(authErrorMessage(err, t));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setFormError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setFormError(authErrorMessage(err, t));
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <AuthLayout title={t('auth.login.title')} subtitle={t('auth.login.subtitle')}>
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
          error={errors.email}
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          autoComplete="email"
        />

        <PasswordField
          id="password"
          label={t('auth.fields.password')}
          placeholder={t('auth.fields.passwordPlaceholder')}
          error={errors.password}
          value={values.password}
          onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted">
            <input
              type="checkbox"
              className="size-3.5 rounded border-border bg-card accent-primary"
            />
            {t('auth.login.remember')}
          </label>
          <Link to="/forgot-password" className="font-medium text-primary hover:text-primary-hover">
            {t('auth.login.forgot')}
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={submitting} icon={LogIn}>
          {submitting ? t('auth.login.submitting') : t('auth.login.submit')}
        </Button>

        <OrDivider label={t('auth.login.divider')} />

        <GoogleButton onClick={handleGoogle} disabled={googleLoading}>
          {t('auth.google')}
        </GoogleButton>

        <p className="pt-2 text-center text-sm text-muted">
          {t('auth.login.noAccount')}{' '}
          <Link to="/register" className="font-medium text-primary hover:text-primary-hover">
            {t('auth.login.createOne')}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
