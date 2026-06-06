import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { requestLogin, verifyLogin } from "../api/auth.api";
import { Button } from "../components/ui/Button";

// The whole authentication ceremony lives on a single screen so first-time
// staff don't need any onboarding: click → check the owner's email → type code.
export default function Login() {
  const { login } = useAuth();
  const [step, setStep] = useState("idle"); // "idle" | "code"
  const [pendingId, setPendingId] = useState("");
  const [devCode, setDevCode] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleRequest() {
    setBusy(true);
    setError("");
    try {
      const { pendingId, devCode } = await requestLogin();
      setPendingId(pendingId);
      if (devCode) setDevCode(devCode);
      setStep("code");
    } catch (e) {
      setError(e.message || "Could not send login email");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    if (code.length !== 6) return setError("Enter the 6-digit code");
    setBusy(true);
    setError("");
    try {
      const { token } = await verifyLogin(pendingId, code);
      login(token);
    } catch (e) {
      setError(e.message || "Invalid or expired code");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 via-cream-100 to-primary-50 p-6">
      <div className="surface !p-10 w-full max-w-md animate-fade-in-up">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary-500 text-3xl">diamond</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-primary-700">Stock Entry</h1>
          <p className="text-sm text-ink-500 mt-2">Jewelry inventory · staff terminal</p>
        </div>

        {step === "idle" && (
          <div className="space-y-5">
            <p className="text-sm text-ink-700 leading-relaxed text-center">
              Tap the button below. We'll email a one-time 6-digit code to the business owner.
              Enter that code on the next screen to unlock this terminal.
            </p>
            {error && <p className="text-xs font-bold text-red-500 uppercase tracking-widest text-center">{error}</p>}
            <Button className="w-full" onClick={handleRequest} disabled={busy}>
              {busy ? "Sending…" : "Request login code"}
            </Button>
          </div>
        )}

        {step === "code" && (
          <form onSubmit={handleVerify} className="space-y-5">
            <p className="text-sm text-ink-700 leading-relaxed text-center">
              A 6-digit code has been sent to the owner. Enter it below within 10 minutes.
            </p>
            {devCode && (
              <p className="text-[11px] text-primary-700 bg-primary-50 border border-primary-200 rounded-lg p-3 text-center">
                <strong>Dev mode:</strong> code is <code className="font-mono">{devCode}</code>
              </p>
            )}
            <input
              autoFocus
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              className="w-full text-center text-3xl tracking-[0.5em] font-mono font-extrabold py-4
                         bg-white border-2 border-primary-200 rounded-2xl
                         focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
            />
            {error && <p className="text-xs font-bold text-red-500 uppercase tracking-widest text-center">{error}</p>}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => { setStep("idle"); setCode(""); setError(""); }}
                disabled={busy}
              >
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={busy || code.length !== 6}>
                {busy ? "Verifying…" : "Unlock"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
