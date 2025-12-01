// src/routes/RouteError.tsx
import React from "react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export default function RouteError() {
  const err = useRouteError() as any;

  let title = "Erro na aplicação";
  let message = "Ocorreu um erro inesperado.";
  let details = "";

  if (isRouteErrorResponse(err)) {
    title = `Erro ${err.status}`;
    message = err.statusText || message;
    details = typeof err.data === "string" ? err.data : JSON.stringify(err.data ?? {}, null, 2);
  } else if (err instanceof Error) {
    message = err.message || message;
    details = err.stack || "";
  } else if (err) {
    details = JSON.stringify(err, null, 2);
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h2 style={{ marginBottom: 8 }}>{title}</h2>
      <p style={{ marginBottom: 16 }}>{message}</p>
      {details ? (
        <pre style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", padding: 12, borderRadius: 12 }}>
          {details}
        </pre>
      ) : null}
    </div>
  );
}
