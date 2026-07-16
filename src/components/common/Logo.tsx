interface LogoProps {
  size?: number; // optional, default 80px
}

export default function Logo({ size = 80 }: LogoProps) {
  return (
    <div
      className="branding-logo-placeholder"
      style={{
        width: size,
        height: size,
      }}
    >
      Yoichi Digital
    </div>
  );
}