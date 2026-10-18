'use client';

import React, { useEffect, useState } from 'react';
import { Download, WifiOff, X, CheckCircle2, Share2, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaController() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('Packaging Supervisor PWA ServiceWorker registered with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('Packaging Supervisor PWA ServiceWorker registration failed:', err);
          });
      });
    }

    // 2. Check standalone / installed status
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error iOS Safari navigator standalone property
      window.navigator.standalone === true;
    setIsStandalone(isStandaloneMode);

    // 3. Detect iOS Safari
    const ua = window.navigator.userAgent;
    const isIosDevice = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window);
    setIsIOS(isIosDevice);

    // 4. Capture beforeinstallprompt for Chrome / Android / Edge
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show subtle banner after 3 seconds if not already installed and not dismissed before
      const dismissed = localStorage.getItem('pps_pwa_banner_dismissed');
      if (!dismissed) {
        setTimeout(() => setShowInstallBanner(true), 2500);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 5. Monitor Network Online / Offline Status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    // 6. Listen for custom trigger to open install prompt
    const handleTriggerInstall = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User installed Packaging Supervisor PWA');
          }
          setDeferredPrompt(null);
          setShowInstallBanner(false);
        });
      } else if (isIosDevice && !isStandaloneMode) {
        setShowIOSPrompt(true);
      } else {
        alert('App is already installed or your browser doesn\'t require an install prompt. You can access it directly!');
      }
    };

    window.addEventListener('pps:trigger-pwa-install', handleTriggerInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('pps:trigger-pwa-install', handleTriggerInstall);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowInstallBanner(false);
        setShowIOSPrompt(true);
      }
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const dismissBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pps_pwa_banner_dismissed', 'true');
  };

  return (
    <>
      {/* Offline Toast Banner */}
      {isOffline && (
        <div className="fixed top-0 inset-x-0 z-[100] bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-300">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>Offline Shop-Floor Mode — Working offline. Data is saved locally and will sync when connected.</span>
        </div>
      )}

      {/* PWA Install Banner (Android / Desktop Chrome / Edge) */}
      {showInstallBanner && !isStandalone && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-slate-900/95 text-white p-4 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-md flex flex-col gap-3 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/30">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">Install Packaging Supervisor</h4>
                <p className="text-xs text-slate-300 mt-0.5">Fast offline access on your phone or desktop</p>
              </div>
            </div>
            <button
              onClick={dismissBanner}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
            <button
              onClick={dismissBanner}
              className="flex-1 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Not Now
            </button>
            <button
              onClick={handleInstallClick}
              className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/40 transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Installation Modal */}
      {showIOSPrompt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Install on iOS (iPhone/iPad)</h3>
              <button
                onClick={() => setShowIOSPrompt(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              To install <strong>Premium Packaging Supervisor</strong> as a native app on your iPhone or iPad:
            </p>

            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl text-xs">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <span>1. Tap the <strong>Share</strong> icon in the Safari toolbar</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <span>2. Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>3. Tap <strong>&quot;Add&quot;</strong> in the top right corner</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSPrompt(false)}
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Global helper function to trigger PWA install prompt from anywhere in the app
export function triggerPwaInstall() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pps:trigger-pwa-install'));
  }
}
