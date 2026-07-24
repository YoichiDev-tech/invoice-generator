interface LogoProps {
  size?: number; // optional, default 80px
  companyName?: string; // optional, shown in the placeholder mark
}

export default function Logo({ size = 80, companyName = "Company name" }: LogoProps) {
  return (
    <div
      className="branding-logo-placeholder"
      style={{
        width: size,
        height: size,
      }}
    >
      {companyName}
    </div>
  );
}