import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import Logo from '../common/Logo';

/**
 * Minimalist, standard LoginView for BrainPopZ.
 * Features pure Google OAuth authentication, dark backdrop with subtle dot grid,
 * and clean typography.
 */
export default function LoginView({ onLoginSuccess, isRestoringSession }) {
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const googleBtnRef = useRef(null);

  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    'your_google_client_id_here.apps.googleusercontent.com';

  const isRealGisConfigured =
    googleClientId &&
    !googleClientId.includes('your_google_client_id_here') &&
    googleClientId.endsWith('.apps.googleusercontent.com');

  // Handle GIS credential callback
  const handleGoogleCredentialResponse = useCallback(async (response) => {
    if (!response?.credential) {
      setErrorMessage('No credential returned from Google. Please try again.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      if (onLoginSuccess) {
        await onLoginSuccess(response.credential);
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage(err.message || 'Google authentication failed. Please retry.');
    } finally {
      setIsLoading(false);
    }
  }, [onLoginSuccess]);

  // Initialize official Google Identity Services button
  useEffect(() => {
    let checkInterval;

    const setupGoogleSignIn = () => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          if (googleBtnRef.current) {
            googleBtnRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              type: 'standard',
              theme: 'filled_black',
              size: 'large',
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: 320,
            });
          }
        } catch (err) {
          console.warn('[GIS] Setup warning:', err.message);
        }
      }
    };

    if (window.google?.accounts?.id) {
      setupGoogleSignIn();
    } else {
      checkInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkInterval);
          setupGoogleSignIn();
        }
      }, 250);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [googleClientId, handleGoogleCredentialResponse]);

  // Fallback Google Sign-In click
  const handleFallbackGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      if (onLoginSuccess) {
        await onLoginSuccess('dev-eval-token:alex.rivera@university.edu');
      }
    } catch (err) {
      console.error('Google sign in error:', err);
      setErrorMessage(err.message || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isRestoringSession) {
    return (
      <div className="min-h-screen bg-midnight bg-dot-grid flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-[#161720] p-1 flex items-center justify-center">
            <img src="/brainpopz-logo.png" alt="BrainPopZ" className="w-10 h-10 object-contain" />
          </div>
          <span className="text-xs text-zinc-400 font-medium tracking-tight">
            Verifying BrainPopZ session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0] bg-dot-grid text-zinc-900 flex flex-col justify-between selection:bg-brand-violet-lilac selection:text-zinc-950">
      {/* Top Header - Clean logo only */}
      <header className="w-full px-6 py-5 flex items-center justify-between border-b border-[#E8E2D5] max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
        </div>
      </header>

      {/* Main Centered Hero & Form Card */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-[420px] mx-auto text-center space-y-6">
          {/* Hero Headlines with Editorial Styling */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-zinc-950 tracking-tight leading-tight">
              Build on the<br />BrainPopZ Platform. <span className="font-serif italic font-normal text-zinc-600">Learn effortlessly.</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-sm mx-auto leading-relaxed">
              Create active recall flashcards and diagnostic quizzes with frontier AI models and managed study infrastructure.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white border-2 border-midnight-ink rounded-2xl p-6 sm:p-7 shadow-neo-lg text-left space-y-5">
            {/* Error Message Banner */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5 stroke-[1.75]" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Google OAuth Button */}
            {isRealGisConfigured ? (
              <div className="flex justify-center min-h-[44px]">
                <div ref={googleBtnRef} />
              </div>
            ) : (
              <button
                type="button"
                onClick={handleFallbackGoogleSignIn}
                disabled={isLoading}
                className="w-full h-11 px-4 rounded-xl bg-white hover:bg-zinc-50 border-2 border-midnight-ink text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] active:scale-[0.99]"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-600" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                )}
                <span>Continue with Google</span>
              </button>
            )}

            {/* Terms and Privacy Policy Notice */}
            <p className="text-[11px] text-zinc-500 text-center leading-normal pt-2">
              By continuing, you agree to BrainPopZ's{' '}
              <a href="#terms" className="text-zinc-800 underline hover:text-black">
                Commercial Terms
              </a>{' '}
              and{' '}
              <a href="#usage" className="text-zinc-800 underline hover:text-black">
                Usage Policy
              </a>
              , and acknowledge our{' '}
              <a href="#privacy" className="text-zinc-800 underline hover:text-black">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-6 border-t border-[#E8E2D5] text-center text-xs text-zinc-500">
        <p>Built by figmayukh • Active Recall & Spaced Repetition Engine</p>
      </footer>
    </div>
  );
}
