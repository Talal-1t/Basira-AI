import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, UserPlus } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import FormField from '../components/auth/FormField.jsx';
import PasswordField from '../components/auth/PasswordField.jsx';
import OrDivider from '../components/auth/OrDivider.jsx';
import GoogleButton from '../components/auth/GoogleButton.jsx';
import Button from '../components/common/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { authErrorMessage } from '../utils/authErrors.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();

  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function set(field) {
    return (e) => setValues((v) => ({ ...v, [field]: e.target.value }));
  }

  function validate() {
    const next = {};
    if (!values.name.trim()) next.name = t('auth.errors.nameRequired');
    if (!values.email) next.email = t('auth.errors.emailRequired');
    else if (!EMAIL_RE.test(values.email)) next.email = t('auth.errors.emailInvalid');
    if (!values.password) next.password = t('auth.errors.passwordRequired');
    else if (values.password.length < 8) next.password = t('auth.errors.passwordTooShort');
    if (!values.confirmPassword) next.confirmPassword = t('auth.errors.confirmRequired');
    else if (values.confirmPassword !== values.password)
      next.confirmPassword = t('auth.errors.confirmMismatch');
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await register(values);
      navigate('/', { replace: true });
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
      navigate('/', { replace: true });
    } catch (err) {
      setFormError(authErrorMessage(err, t));
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <AuthLayout title={t('auth.register.title')} subtitle={t('auth.register.subtitle')}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-xs text-danger">
            {formError}
          </div>
        )}

        <FormField
          id="name"
          label={t('auth.fields.name')}
          placeholder={t('auth.fields.namePlaceholder')}
          icon={User}
          error={errors.name}
          value={values.name}
          onChange={set('name')}
          autoComplete="name"
        />

        <FormField
          id="email"
          type="email"
          label={t('auth.fields.email')}
          placeholder={t('auth.fields.emailPlaceholder')}
          icon={Mail}
          error={errors.email}
          value={values.email}
          onChange={set('email')}
          autoComplete="email"
        />

        <PasswordField
          id="password"
          label={t('auth.fields.password')}
          placeholder={t('auth.fields.passwordPlaceholder')}
          error={errors.password}
          value={values.password}
          onChange={set('password')}
          autoComplete="new-password"
        />

        <PasswordField
          id="confirmPassword"
          label={t('auth.fields.confirmPassword')}
          placeholder={t('auth.fields.confirmPasswordPlaceholder')}
          error={errors.confirmPassword}
          value={values.confirmPassword}
          onChange={set('confirmPassword')}
          autoComplete="new-password"
        />

        <Button type="submit" className="w-full" disabled={submitting} icon={UserPlus}>
          {submitting ? t('auth.register.submitting') : t('auth.register.submit')}
        </Button>

        <OrDivider label={t('auth.register.divider')} />

        <GoogleButton onClick={handleGoogle} disabled={googleLoading}>
          {t('auth.google')}
        </GoogleButton>

        <p className="text-center text-xs leading-relaxed text-muted">
          {t('auth.register.terms')}{' '}
          <a href="#" className="font-medium text-text hover:text-primary">
            {t('auth.register.termsLink')}
          </a>{' '}
          {t('auth.register.and')}{' '}
          <a href="#" className="font-medium text-text hover:text-primary">
            {t('auth.register.privacyLink')}
          </a>
          .
        </p>

        <p className="text-center text-sm text-muted">
          {t('auth.register.haveAccount')}{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary-hover">
            {t('auth.register.logIn')}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
