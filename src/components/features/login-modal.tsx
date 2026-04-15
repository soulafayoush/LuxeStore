'use client';

import React, { useState, useTransition } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ShoppingBag,
  Package,
  Heart,
  Settings,
  LogOut,
  AlertCircle,
} from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const { data: session, status } = useSession();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const isLoggedIn = status === 'authenticated' && !!session?.user;
  const loggedIn = isLoggedIn;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const isFormValid = isLogin
    ? formData.email.trim() && formData.password.trim()
    : formData.name.trim() && formData.email.trim() && formData.password.trim() && formData.password === formData.confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError('');

    startTransition(async () => {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        const errorMap: Record<string, string> = {
          EMAIL_PASSWORD_REQUIRED: 'Please enter both email and password.',
          INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
          CredentialsSignin: 'Invalid email or password. Please try again.',
          default: 'Sign in failed. Please try again later.',
        };
        const errorCode = result.error as string;
        setError(errorMap[errorCode] || errorMap.default);
      }
    });
  };

  const handleLogout = () => {
    signOut({ redirect: false });
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setError('');
    onOpenChange(false);
  };

  const handleReset = () => {
    setIsLogin(true);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setError('');
  };

  const displayName = session?.user?.name || 'User';
  const displayEmail = session?.user?.email || '';

  return (
    <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) handleReset(); }}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        {loggedIn ? (
          <>
            <SheetHeader className="mb-6">
              <SheetTitle className="flex items-center gap-2 text-xl">
                <User className="h-5 w-5 text-primary" />
                My Account
              </SheetTitle>
              <SheetDescription>Welcome back! Manage your account and orders.</SheetDescription>
            </SheetHeader>

            {/* User Profile Card */}
            <div className="space-y-6">
              <div className="rounded-xl border bg-muted/30 p-6 text-center">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white text-2xl font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="font-bold text-lg">{displayName}</h3>
                <p className="text-sm text-muted-foreground">{displayEmail}</p>
                <Badge className="mt-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">Premium Member</Badge>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: ShoppingBag, label: 'Orders', value: '12' },
                  { icon: Package, label: 'Active', value: '2' },
                  { icon: Heart, label: 'Wishlist', value: '5' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border bg-card p-3 text-center">
                    <stat.icon className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Quick Links */}
              <div className="space-y-1">
                {[
                  { icon: Package, label: 'My Orders', desc: 'View and track your orders' },
                  { icon: Heart, label: 'My Wishlist', desc: 'Your saved items' },
                  { icon: Settings, label: 'Account Settings', desc: 'Update your profile' },
                ].map((link) => (
                  <button key={link.label} className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-xl hover:bg-muted/60 transition-colors">
                    <link.icon className="h-4.5 w-4.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{link.label}</p>
                      <p className="text-[11px] text-muted-foreground">{link.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
                  </button>
                ))}
              </div>

              <Separator />

              <Button variant="outline" className="w-full text-destructive hover:text-destructive" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </>
        ) : (
          <>
            <SheetHeader className="mb-6">
              <SheetTitle className="flex items-center gap-2 text-xl">
                <User className="h-5 w-5 text-primary" />
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </SheetTitle>
              <SheetDescription>
                {isLogin ? 'Sign in to your account to continue shopping.' : 'Join LUXE Store and enjoy exclusive benefits.'}
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="auth-name">Full Name</Label>
                  <Input
                    id="auth-name"
                    name="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="auth-email">Email</Label>
                <Input
                  id="auth-email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-password">Password</Label>
                <div className="relative">
                  <Input
                    id="auth-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="auth-confirm">Confirm Password</Label>
                  <Input
                    id="auth-confirm"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-destructive">Passwords do not match</p>
                  )}
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-end">
                  <button type="button" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={!isFormValid || isPending}
                className="w-full h-11"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>

              <Separator />

              <p className="text-sm text-center text-muted-foreground">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setError(''); }}
                  className="text-primary font-semibold hover:underline"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
