'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Download, X, Share } from 'lucide-react';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      return;
    }

    // On iOS, always show the prompt since beforeinstallprompt doesn't work
    if (iOS) {
      setShowPrompt(true);
      return;
    }

    const handler = (e: Event) => {
      // Prevent the default install prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e);
      // Show our custom prompt
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50">
      <div className="bg-bg-secondary border border-border-primary rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {isIOS ? (
              <Share className="w-6 h-6 text-accent-primary" />
            ) : (
              <Download className="w-6 h-6 text-accent-primary" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Install WG Growth App</h3>
            {isIOS ? (
              <p className="text-sm text-text-secondary mb-3">
                Tap <Share className="inline w-4 h-4 mx-1" /> (Share button) at the bottom, then scroll and tap "Add to Home Screen"
              </p>
            ) : (
              <p className="text-sm text-text-secondary mb-3">
                Install the app for quick access and offline functionality
              </p>
            )}
            <div className="flex gap-2">
              {!isIOS && deferredPrompt && (
                <Button onClick={handleInstall} className="flex-1">
                  Install
                </Button>
              )}
              <Button variant="secondary" onClick={handleDismiss} className={isIOS ? "w-full" : "px-3"}>
                {isIOS ? 'Got it' : <X size={18} />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
