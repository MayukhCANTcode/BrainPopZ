import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Brain, Sparkles, ShieldCheck, AlertCircle, ArrowRight, Layers, Award } from 'lucide-react';
import Button from '../common/Button';

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
      // Poll briefly for GIS script load
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

  // Instant developer/evaluator test sign-in
  const handleDevSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      if (onLoginSuccess) {
        // Sends dev bypass token to backend endpoint for real cookie session creation
        await onLoginSuccess('dev-eval-token:alex.rivera@university.edu');
      }
    } catch (err) {
      console.error('Dev sign in error:', err);
      setErrorMessage(err.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isRestoringSession) {
    return (
      <div className="min-h-screen bg-midnight flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface border border-surface-border flex items-center justify-center text-brand-violet animate-pulse">
            <Brain className="w-5 h-5" />
          </div>
          <span className="text-xs text-gray-400 font-medium">
            Verifying BrainPopZ session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background ambient gradient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-brand-violet/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-brand-lime/5 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Product Branding & Features */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-surface border border-surface-border flex items-center justify-center shadow-inner">
              <Brain className="w-5 h-5 text-brand-violet" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-lg text-white tracking-tight">
                BrainPop<span className="text-brand-lime">Z</span>
              </span>
              <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                AI Study Engine
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-violet/10 border border-brand-violet/20 text-brand-violet-light text-[11px] font-medium">
              <Sparkles className="w-3.5 h-3.5 text-brand-lime" />
              <span>Google Identity & Gemini 2.5 Flash</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-white tracking-tight leading-tight">
              Master complex topics with <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-violet via-brand-violet-light to-brand-lime">validated active recall</span>.
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Transform unstructured notes into diagnostic flashcards and adaptive exam-prep quizzes with official Google Gemini AI.
            </p>
          </div>

          {/* Value Props */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-surface-elevated border border-surface-border flex items-center justify-center shrink-0 mt-0.5 text-brand-lime">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Synthesized Flashcards</h4>
                <p className="text-[11px] text-gray-400">High-yield concepts with 3D interactive flip and keyboard recall ratings.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-surface-elevated border border-surface-border flex items-center justify-center shrink-0 mt-0.5 text-brand-violet">
                <Award className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Timed Diagnostic Quizzes</h4>
                <p className="text-[11px] text-gray-400">4-option multiple choice with scientific rationales and missed question retesting.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-surface-elevated border border-surface-border flex items-center justify-center shrink-0 mt-0.5 text-brand-orange">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Verified Security</h4>
                <p className="text-[11px] text-gray-400">Secure HTTP-only cookies, Zod schema validation, and zero leaked keys.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="lg:col-span-6">
          <div className="bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-2xl relative space-y-6">
            <div className="space-y-1 text-center">
              <h2 className="text-lg font-heading font-bold text-white tracking-tight">
                Sign in to BrainPopZ
              </h2>
              <p className="text-xs text-gray-400">
                Continue with your Google account to access your AI study studio.
              </p>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Official Google Identity Services Button Container */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div
                ref={googleBtnRef}
                className="w-full flex justify-center min-h-[44px]"
              />

              {!isRealGisConfigured && (
                <div className="w-full text-center">
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-surface-border" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                      <span className="bg-surface px-2 text-gray-500">Developer Evaluation</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    fullWidth
                    size="md"
                    isLoading={isLoading}
                    onClick={handleDevSignIn}
                    className="cursor-pointer text-xs font-medium"
                    rightIcon={ArrowRight}
                  >
                    Continue as Test Student (Dev Mode)
                  </Button>
                  <p className="text-[10px] text-gray-500 mt-2">
                    Authenticates via Express backend and sets real secure HTTP-only session cookie.
                  </p>
                </div>
              )}
            </div>

            {/* Security Guarantee Notice */}
            <div className="pt-4 border-t border-surface-border/60 text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-lime" />
                <span>Basic identity only: openid, email, and profile</span>
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed max-w-xs mx-auto">
                By continuing, your Google ID token is verified server-side with <code className="font-mono text-gray-400">google-auth-library</code> and stored in an HTTP-only cookie.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
