export default function Home() {
  return (
    <main
      style={{
        backgroundColor: "black",
        color: "white",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "2rem" }}>
        Give Me Five.
      </h1>

      <button
        style={{
          background: "white",
          color: "black",
          border: "none",
          padding: "1rem 2rem",
          fontSize: "1.5rem",
          cursor: "pointer",
        }}
      >
        +5€
      </button>
    </main>
  );
}
