// Gmail SMTP via nodemailer.
// If credentials are missing the service falls back to console-only mode so
// the rest of the app keeps working in development without leaking errors.
const nodemailer = require("nodemailer");

const config = require("../config");
const { logAudit } = require("./audit.service");

let transporter = null;

function getTransporter() {
  if (!config.isEmailConfigured()) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.email.user,
      pass: config.email.password,
    },
  });
  return transporter;
}

function fromAddress() {
  return `"${config.email.fromName}" <${config.email.user}>`;
}

async function sendMail({ to, subject, html, text, attachments }) {
  const t = getTransporter();
  if (!t) {
    // eslint-disable-next-line no-console
    console.warn(`[email] not configured — would send to ${to}: ${subject}`);
    return { ok: false, fallback: true };
  }
  try {
    const info = await t.sendMail({
      from: fromAddress(),
      to,
      subject,
      text,
      html,
      attachments,
    });
    return { ok: true, id: info.messageId };
  } catch (err) {
    await logAudit({
      actor: "system",
      action: "email_failed",
      details: { to, subject, error: err.message },
    });
    return { ok: false, error: err.message };
  }
}

// ── Templates ─────────────────────────────────────────────────

function renderApprovalEmail({ purpose, code, context }) {
  const purposeLabels = {
    login: "Login attempt",
    edit: "Edit product",
    delete: "Delete product",
  };
  const label = purposeLabels[purpose] || "Action";

  const contextHtml = context
    ? `<p style="margin:16px 0 0 0;color:#553344;font-size:13px;">
         <strong>Details:</strong><br>
         <code style="background:#FFF1F6;padding:8px;display:block;border-radius:6px;color:#9D174D;">${escapeHtml(
           JSON.stringify(context, null, 2)
         )}</code>
       </p>`
    : "";

  return `
    <div style="font-family:Inter,sans-serif;background:#FFFBF7;padding:32px;">
      <div style="max-width:480px;margin:0 auto;background:#FFFFFF;border:1px solid #FFE0EC;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(236,72,153,0.08);">
        <h1 style="color:#BE185D;font-size:20px;margin:0 0 8px 0;">${label} approval</h1>
        <p style="color:#553344;font-size:14px;margin:0 0 24px 0;">
          Your staff is requesting permission to perform an action in the Stock Entry app.
          Share this code with them only if you approve.
        </p>
        <div style="font-size:42px;letter-spacing:8px;font-weight:800;color:#EC4899;background:#FFF1F6;border:2px dashed #FB6FA3;border-radius:12px;padding:24px;text-align:center;font-family:'Courier New',monospace;">
          ${code}
        </div>
        <p style="color:#8A6B7A;font-size:12px;margin:16px 0 0 0;text-align:center;">
          This code expires in ${config.approval.codeTtlMinutes} minutes.
        </p>
        ${contextHtml}
      </div>
    </div>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function sendApprovalCode({ purpose, code, context }) {
  return sendMail({
    to: config.email.ownerEmail,
    subject: `Stock Entry — ${purpose} approval code: ${code}`,
    html: renderApprovalEmail({ purpose, code, context }),
    text: `Approval code for ${purpose}: ${code} (valid ${config.approval.codeTtlMinutes} minutes)`,
  });
}

async function sendMonthlyInventoryReport({ xlsxBuffer, summary, monthLabel }) {
  const html = `
    <div style="font-family:Inter,sans-serif;background:#FFFBF7;padding:32px;">
      <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #FFE0EC;border-radius:16px;padding:32px;">
        <h1 style="color:#BE185D;font-size:22px;margin:0 0 8px 0;">Monthly Inventory Report</h1>
        <p style="color:#553344;font-size:14px;">${escapeHtml(monthLabel)}</p>
        <ul style="color:#553344;font-size:14px;line-height:1.8;">
          <li>In-stock items: <strong>${summary.totalInStock}</strong></li>
          <li>Total weight: <strong>${summary.totalWeight.toFixed(3)} g</strong></li>
          <li>Sold this month: <strong>${summary.soldThisMonth}</strong></li>
          <li>Added this month: <strong>${summary.addedThisMonth}</strong></li>
        </ul>
        <p style="color:#8A6B7A;font-size:12px;">Full inventory attached as Excel.</p>
      </div>
    </div>`;
  return sendMail({
    to: config.email.ownerEmail,
    subject: `Monthly Inventory Report — ${monthLabel}`,
    html,
    text: `Monthly inventory report for ${monthLabel}. See attached spreadsheet.`,
    attachments: [
      {
        filename: `inventory_${monthLabel.replace(/\s+/g, "_")}.xlsx`,
        content: xlsxBuffer,
      },
    ],
  });
}

module.exports = { sendApprovalCode, sendMonthlyInventoryReport };
