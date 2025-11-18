// GridOverlay.tsx
export default function GridOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />
  );
}
