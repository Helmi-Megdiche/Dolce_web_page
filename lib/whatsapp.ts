function env(name: string) {
  return (process.env[name] || "").trim();
}

export function isWhatsAppConfigured() {
  return Boolean(
    env("ULTRA_MSG_BASE_URL") &&
      env("ULTRA_MSG_API_TOKEN") &&
      env("WHATSAPP_ADMIN_NUMBER")
  );
}

/**
 * Send a WhatsApp message via UltraMsg.
 * @param message - text body
 * @param to - optional recipient; defaults to WHATSAPP_ADMIN_NUMBER
 */
export async function sendWhatsAppMessage(
  message: string,
  to = env("WHATSAPP_ADMIN_NUMBER")
): Promise<boolean> {
  const baseUrl = env("ULTRA_MSG_BASE_URL").replace(/\/?$/, "/");
  const token = env("ULTRA_MSG_API_TOKEN");
  const recipient = (to || "").trim();

  if (!baseUrl || !token || !recipient) {
    console.warn(
      "[whatsapp] ULTRA_MSG_BASE_URL / ULTRA_MSG_API_TOKEN / recipient not set — skipping WhatsApp."
    );
    return false;
  }

  try {
    const res = await fetch(`${baseUrl}messages/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        to: recipient,
        body: message,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("[whatsapp] UltraMsg request failed:", res.status, data);
      return false;
    }

    console.info("[whatsapp] Message sent:", data);
    return true;
  } catch (error) {
    console.error("[whatsapp] Failed to send message:", error);
    return false;
  }
}

/** Convenience wrapper for admin alerts (reservations, reclamations). */
export async function sendWhatsAppAlert(message: string): Promise<boolean> {
  return sendWhatsAppMessage(message);
}
