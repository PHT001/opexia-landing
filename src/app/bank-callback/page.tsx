// Page intermédiaire HTTPS appelée par Bridge après la fin du flow connect.
// On reprend les query params reçus et on redirige vers talix://bank/connected
// pour que l'app iOS reprenne la main.

"use client";

import { useEffect } from "react";

export default function BankCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const target = `talix://bank/connected?${params.toString()}`;
    // Tentative de deeplink — sur iOS Safari ça ouvre l'app si elle est installée
    window.location.replace(target);
    // Fallback : si on est encore là 1.5s plus tard, l'app n'est pas installée
    setTimeout(() => {
      const fallback = document.getElementById("fallback");
      if (fallback) fallback.style.opacity = "1";
    }, 1500);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0A1628 0%, #1E3A5F 100%)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: 24,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔄</div>
        <h1
          style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}
        >
          Retour à Talix...
        </h1>
        <p
          style={{
            fontSize: 14,
            opacity: 0.7,
            lineHeight: 1.5,
            margin: "0 0 24px",
          }}
        >
          Connexion bancaire validée. Si l'application Talix ne s'ouvre pas
          automatiquement, ouvre-la manuellement.
        </p>
        <div
          id="fallback"
          style={{
            opacity: 0,
            transition: "opacity 0.4s",
            fontSize: 12,
            opacity: 0.5,
          }}
        >
          Pas d'app Talix installée ? Tu peux fermer cette page.
        </div>
      </div>
    </div>
  );
}
