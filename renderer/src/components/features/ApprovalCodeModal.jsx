import { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

// Two-step modal:
//   1) "Request approval" — calls onRequest() which sends an email to owner
//      and returns { pendingId, devCode? }.
//   2) Code entry — staff types the 6-digit code; we call onVerify(pendingId, code).
//
// Used by Edit/Delete actions and (in a slightly different shape) by the
// Login page. The component is fully controlled by the parent's state.
export function ApprovalCodeModal({
  open,
  purpose,        // "edit" | "delete"
  productName,    // for the subtitle
  onRequest,      // async () => ({ pendingId, devCode? })
  onVerify,       // async (pendingId, code) => any  (throws on failure)
  onClose,
  onSuccess,
}) {
  const [step, setStep] = useState("request"); // "request" | "code"
  const [pendingId, setPendingId] = useState("");
  const [devCode, setDevCode] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setStep("request");
      setPendingId("");
      setCode("");
      setDevCode("");
      setError("");
      setBusy(false);
    }
  }, [open]);

  async function handleRequest() {
    setBusy(true);
    setError("");
    try {
      const { pendingId: pid, devCode: dc } = await onRequest();
      setPendingId(pid);
      if (dc) setDevCode(dc);
      setStep("code");
    } catch (e) {
      setError(e.message || "Failed to send approval request");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onVerify(pendingId, code);
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  const titleText = purpose === "delete" ? "Owner approval to delete" : "Owner approval to edit";

  return (
    <Modal open={open} onClose={() => !busy && onClose?.()} title={titleText} subtitle={productName} width={460}>
      {step === "request" && (
        <div>
          <p className="text-sm text-ink-700 leading-relaxed">
            An email with a 6-digit approval code will be sent to the business owner.
            Enter that code on the next screen to {purpose === "delete" ? "delete" : "save"} this product.
          </p>
          {error && <p className="mt-4 text-xs font-bold text-red-500 uppercase tracking-widest">{error}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" type="button" disabled={busy} onClick={onClose}>Cancel</Button>
            <Button type="button" disabled={busy} onClick={handleRequest}>
              {busy ? "Sending…" : "Send approval email"}
            </Button>
          </div>
        </div>
      )}

      {step === "code" && (
        <form onSubmit={handleVerify}>
          <p className="text-sm text-ink-700 leading-relaxed">
            We sent a 6-digit code to the owner. Enter it below to confirm.
          </p>
          {devCode && (
            <p className="mt-3 text-[11px] text-primary-700 bg-primary-50 border border-primary-200 rounded-lg p-3">
              <strong>Dev mode:</strong> email isn't configured. Code is <code className="font-mono">{devCode}</code>.
            </p>
          )}
          <input
            autoFocus
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="mt-5 w-full text-center text-3xl tracking-[0.5em] font-mono font-extrabold py-4
                       bg-white border-2 border-primary-200 rounded-2xl
                       focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
            placeholder="••••••"
          />
          {error && <p className="mt-3 text-xs font-bold text-red-500 uppercase tracking-widest">{error}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" type="button" disabled={busy} onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={busy || code.length !== 6}>
              {busy ? "Verifying…" : "Verify & confirm"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
