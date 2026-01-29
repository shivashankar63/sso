"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
      fontFamily: "system-ui, sans-serif",
      background: "#0a0a0a",
      color: "#fff"
    }}>
      <div style={{
        maxWidth: "500px",
        padding: "2rem",
        background: "#1a1a1a",
        border: "1px solid #333",
        borderRadius: "8px"
      }}>
        <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.5rem" }}>
          Something went wrong!
        </h2>
        <p style={{ margin: "0 0 1.5rem 0", color: "#999" }}>
          {error.message || "An unexpected error occurred"}
        </p>
        <button
          onClick={reset}
          style={{
            padding: "0.5rem 1rem",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
