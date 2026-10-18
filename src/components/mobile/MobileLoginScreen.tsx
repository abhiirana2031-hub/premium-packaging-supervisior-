'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Box, Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { MobileStatusBar } from './MobileStatusBar';
import { authService } from '@/lib/authService';

interface MobileLoginScreenProps {
  onContinue: () => void;
  onOpenProfileSetup: () => void;
}

export function MobileLoginScreen({ onContinue }: MobileLoginScreenProps) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [gisReady, setGisReady] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    if (!clientId) return;

    const initGsi = () => {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response: any) => {
              if (response?.credential) {
                setIsLoading(true);
                setErrorMessage(null);
                const res = await authService.signInWithGoogleIdToken(response.credential);
                if (res.error) {
                  setErrorMessage(res.error);
                  setIsLoading(false);
                } else {
                  onContinue();
                }
              }
            },
          });

          if (googleBtnRef.current) {
            try {
              (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
                type: 'standard',
                theme: 'outline',
                size: 'large',
                text: 'continue_with',
                shape: 'rectangular',
                logo_alignment: 'left',
                width: 280,
              });
              setGisReady(true);
            } catch (renderErr) {
              console.warn('Mobile GIS renderButton error:', renderErr);
            }
          }
        } catch (e) {
          console.warn('Mobile GIS init error:', e);
        }
      }
    };

    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initGsi();
      };
      document.body.appendChild(script);
    } else {
      initGsi();
    }
  }, [onContinue]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    // Try GIS native prompt first
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            authService.signInWithGoogle().then((res) => {
              if (res.error) {
                setErrorMessage(res.error);
                setIsLoading(false);
              }
            });
          }
        });
        return;
      } catch {}
    }

    try {
      const res = await authService.signInWithGoogle();
      if (res.error) {
        setErrorMessage(res.error);
        setIsLoading(false);
      } else {
        onContinue();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google login failed');
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await authService.signInWithEmail(email, password);
      if (res.error) {
        setErrorMessage(res.error);
        setIsLoading(false);
      } else {
        onContinue();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white select-none">
      <MobileStatusBar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-between px-6 pt-5 pb-6 overflow-y-auto">
        {/* Branding Header */}
        <div className="flex flex-col items-center text-center mt-1">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-blue-500/20 mb-2.5 p-1 bg-white border border-slate-100 flex items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="Premium Packaging Supervisor Logo"
              width={64}
              height={64}
              className="w-full h-full object-contain rounded-xl"
              priority
            />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
            Premium Packaging
            <br />
            Supervisor
          </h1>
          <p className="text-[11px] text-slate-500 mt-1 font-medium tracking-tight">
            Factory Production • Weight Quality • Daily Log
          </p>
        </div>

        {/* Hero Packaging Visual */}
        <div className="relative w-full max-w-[220px] aspect-square my-2 rounded-3xl bg-slate-50/80 border border-slate-100 flex items-center justify-center p-3 shadow-inner overflow-hidden">
          <Image
            src="/images/packaging_hero.jpg"
            alt="Packaging Products Showcase"
            width={220}
            height={220}
            className="object-contain w-full h-full drop-shadow-md rounded-2xl"
            priority
          />
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="w-full p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold text-center mb-2 leading-relaxed">
            {errorMessage}
          </div>
        )}

        {/* Auth Forms */}
        <div className="w-full space-y-2.5">
          {showEmailForm ? (
            <form onSubmit={handleEmailLogin} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="Enter authorized email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-blue-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-blue-500 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{isLoading ? 'Signing In...' : 'Sign In with Email'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="text-slate-400 font-semibold text-[11px]"
                >
                  Back to Sign In Options
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Google Button */}
              <div className="w-full flex flex-col items-center justify-center">
                <div ref={googleBtnRef} className="w-full flex justify-center empty:hidden" />
                {!gisReady && (
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold shadow-xs hover:bg-slate-50 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                )}
              </div>

              {/* Email Button */}
              <button
                type="button"
                onClick={() => setShowEmailForm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-500/25 hover:bg-blue-700 active:scale-[0.99] transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Sign In with Work Email</span>
              </button>
            </>
          )}

          {/* Invitation Notice */}
          <p className="text-[10px] text-center text-slate-400 pt-2 flex items-center justify-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Plant accounts are issued by the Factory Administrator</span>
          </p>
        </div>
      </div>
    </div>
  );
}
