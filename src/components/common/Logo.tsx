interface LogoProps {
  size?: number;
  companyName?: string;
}

export default function Logo({ size = 120, companyName }: LogoProps) {
  const accessibleName = companyName?.trim()
    ? `${companyName} — PW&IG logo`
    : "PW&IG — PrismWave & Invoice Generator";

  return (
    <img
      src="/pw-ig-logo.svg"
      alt={accessibleName}
      width={size}
      height={Math.round(size * (220 / 240))}
      style={{ display: "block", maxWidth: "100%", height: "auto", objectFit: "contain", margin: "0 auto" }}
    />
  );
}
