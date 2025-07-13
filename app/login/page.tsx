'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/use-auth';
import { loginSchema, type LoginFormData, validateForm } from '../../lib/validations';
import { Eye, EyeOff, LogIn, Sparkles, Shield } from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validate form data
    const validation = validateForm(loginSchema, formData);
    if (!validation.success) {
      setErrors(validation.errors || {});
      setLoading(false);
      return;
    }

    const result = await signIn(formData.email, formData.password);
    
    if (result.error) {
      setLoading(false);
      setErrors({ general: result.error.message });
    } else {
      // Add a small delay to ensure auth state is updated
      setTimeout(() => {
        router.push('/dashboard');
        setLoading(false);
      }, 100);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background-tertiary flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-primary to-primary-hover rounded-2xl shadow-lg">
            <LogIn className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground mb-2">
          Welcome back
        </h2>
        <p className="text-center text-sm text-foreground-secondary mb-8">
          Sign in to your Ascend Global account
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card shadow-xl">
          <div className="card-content">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {errors.general && (
                <div className="p-4 bg-destructive-light border border-destructive rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">{errors.general}</span>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground-secondary mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`input ${errors.email ? 'border-destructive focus:border-destructive focus:ring-destructive' : ''}`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground-secondary mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`input pr-10 ${errors.password ? 'border-destructive focus:border-destructive focus:ring-destructive' : ''}`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground-secondary" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground-secondary" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-foreground-secondary">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-primary hover:text-primary-hover">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full h-12 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <LogIn className="h-5 w-5 mr-2" />
                      Sign in
                    </div>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">New to Ascend Global?</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-foreground-secondary">
                  Don't have an account?{' '}
                  <a href="/signup" className="font-medium text-primary hover:text-primary-hover">
                    Contact your administrator
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>Powered by Ascend Global Business Management</span>
          </div>
        </div>
      </div>
    </div>
  );
}