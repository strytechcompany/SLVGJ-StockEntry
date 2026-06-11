import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { requestLogin, verifyLogin } from "../api/auth.api";
import { Button } from "../components/ui/Button";

// Full business name displayed as premium centred heading.
// Staff enter their name first so the OTP email shows who is attempting login.
export default function Login() {
  const { login } = useAuth();
  const [step, setStep]       = useState("idle"); // "idle" | "code"
  const [staffName, setStaffName] = useState("");
  const [pendingId, setPendingId] = useState("");
  const [devCode, setDevCode] = useState("");
  const [code, setCode]       = useState("");
  const [busy, setBusy]       = useState(false);
  const [error, setError]     = useState("");

  async function handleRequest() {
    if (!staffName.trim()) return setError("Please enter your name first");
    setBusy(true);
    setError("");
    try {
      const { pendingId, devCode } = await requestLogin(staffName.trim());
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
      login(token, staffName.trim());
    } catch (e) {
      setError(e.message || "Invalid or expired code");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #FFF5F0 0%, #FFF0F7 40%, #FFF8EC 100%)",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative blurred orbs */}
      <div style={{
        position: "absolute", top: "-80px", left: "-80px",
        width: "340px", height: "340px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-60px", right: "-60px",
        width: "280px", height: "280px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(236,72,153,0.14) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Card */}
      <div style={{
        width: "100%",
        maxWidth: "460px",
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(251,191,36,0.25)",
        borderRadius: "24px",
        padding: "44px 40px 40px",
        boxShadow: "0 8px 48px rgba(251,191,36,0.12), 0 2px 8px rgba(236,72,153,0.08)",
        animation: "slvg-fade-up 0.5s ease both",
      }}>

        {/* ── Brand header ── */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          {/* Lotus + diamond icon */}
          <div style={{
            width: "68px", height: "68px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
            border: "3px solid rgba(251,191,36,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 4px 20px rgba(251,191,36,0.3)",
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: "32px", color: "#B45309" }}>diamond</span>
          </div>

          {/* Shop name — single bold centered line */}
          <h1 style={{
            margin: "0 0 6px",
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: "24px",
            fontWeight: "900",
            lineHeight: "1.25",
            letterSpacing: "0.02em",
            color: "#B45309",
            textAlign: "center",
            textShadow: "0 1px 2px rgba(180,83,9,0.15)",
          }}>
            Sri Lakshmi Vinayaka Golden Jewellery
          </h1>

          {/* Decorative rule */}
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            margin: "10px auto 0", maxWidth: "240px",
          }}>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, #D97706)" }} />
            <span style={{ fontSize: "14px", color: "#D97706" }}>✦</span>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left, transparent, #D97706)" }} />
          </div>

          <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#9D174D", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Staff Stock Terminal
          </p>
        </div>

        {/* ── Step: idle (name + request) ── */}
        {step === "idle" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{
                display: "block", marginBottom: "6px",
                fontSize: "12px", fontWeight: "700",
                color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.07em",
              }}>
                Your Name
              </label>
              <input
                autoFocus
                type="text"
                value={staffName}
                onChange={(e) => { setStaffName(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleRequest()}
                placeholder="Enter your full name…"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 16px",
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#1F2937",
                  background: "#FFFBF7",
                  border: "2px solid #FDE68A",
                  borderRadius: "12px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => e.target.style.borderColor = "#D97706"}
                onBlur={(e) => e.target.style.borderColor = "#FDE68A"}
              />
            </div>

            <p style={{ margin: "0", fontSize: "13px", color: "#6B7280", lineHeight: "1.6", textAlign: "center" }}>
              We'll send a 6-digit OTP to the owner's email once you tap the button below. Your name will be included so the owner knows who is requesting access.
            </p>

            {error && (
              <p style={{ margin: "0", fontSize: "12px", fontWeight: "700", color: "#DC2626", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {error}
              </p>
            )}

            <button
              onClick={handleRequest}
              disabled={busy}
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "14px",
                fontWeight: "800",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#fff",
                background: busy
                  ? "#FCA5A5"
                  : "linear-gradient(135deg, #D97706 0%, #EC4899 100%)",
                border: "none",
                borderRadius: "14px",
                cursor: busy ? "not-allowed" : "pointer",
                boxShadow: busy ? "none" : "0 4px 20px rgba(217,119,6,0.35)",
                transition: "all 0.2s",
              }}
            >
              {busy ? "Sending OTP…" : "🔐 Request Login OTP"}
            </button>
          </div>
        )}

        {/* ── Step: code entry ── */}
        {step === "code" && (
          <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Who's logging in */}
            <div style={{
              background: "linear-gradient(135deg, #FEF3C7, #FFF0F7)",
              border: "1px solid #FDE68A",
              borderRadius: "12px",
              padding: "12px 16px",
              textAlign: "center",
            }}>
              <p style={{ margin: "0", fontSize: "12px", color: "#92400E", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Logging in as
              </p>
              <p style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: "800", color: "#B45309" }}>
                {staffName}
              </p>
            </div>

            <p style={{ margin: "0", fontSize: "13px", color: "#6B7280", lineHeight: "1.6", textAlign: "center" }}>
              A 6-digit OTP has been sent to the owner's email with your name. Enter it below within 10 minutes.
            </p>

            {devCode && (
              <p style={{
                margin: "0", fontSize: "12px",
                color: "#7C3AED", background: "#F5F3FF",
                border: "1px solid #C4B5FD",
                borderRadius: "10px", padding: "10px 14px",
                textAlign: "center",
              }}>
                <strong>Dev mode:</strong> code is <code style={{ fontFamily: "monospace", fontWeight: "800" }}>{devCode}</code>
              </p>
            )}

            <input
              autoFocus
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              style={{
                width: "100%",
                boxSizing: "border-box",
                textAlign: "center",
                fontSize: "36px",
                letterSpacing: "0.5em",
                fontFamily: "'Courier New', monospace",
                fontWeight: "800",
                padding: "20px 16px",
                background: "#fff",
                border: "2px solid #FDE68A",
                borderRadius: "16px",
                outline: "none",
                color: "#B45309",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = "#D97706"}
              onBlur={(e) => e.target.style.borderColor = "#FDE68A"}
            />

            {error && (
              <p style={{ margin: "0", fontSize: "12px", fontWeight: "700", color: "#DC2626", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {error}
              </p>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                onClick={() => { setStep("idle"); setCode(""); setError(""); }}
                disabled={busy}
                style={{
                  flex: 1, padding: "13px",
                  fontSize: "13px", fontWeight: "700",
                  color: "#B45309",
                  background: "#FEF3C7",
                  border: "1px solid #FDE68A",
                  borderRadius: "12px",
                  cursor: busy ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                }}
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={busy || code.length !== 6}
                style={{
                  flex: 2, padding: "13px",
                  fontSize: "13px", fontWeight: "800",
                  letterSpacing: "0.05em",
                  color: "#fff",
                  background: (busy || code.length !== 6)
                    ? "#FCA5A5"
                    : "linear-gradient(135deg, #D97706 0%, #EC4899 100%)",
                  border: "none",
                  borderRadius: "12px",
                  cursor: (busy || code.length !== 6) ? "not-allowed" : "pointer",
                  boxShadow: (busy || code.length !== 6) ? "none" : "0 4px 16px rgba(217,119,6,0.35)",
                  transition: "all 0.2s",
                }}
              >
                {busy ? "Verifying…" : "🔓 Unlock Terminal"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Keyframe injection */}
      <style>{`
        @keyframes slvg-fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
