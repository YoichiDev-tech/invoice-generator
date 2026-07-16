interface SignatureBlockProps {
  senderName: string;
}

export default function SignatureBlock({ senderName }: SignatureBlockProps) {
  return (
    <div className="signature-block space-y">
      <p>Kind regards,</p>
      <p style={{ fontWeight: 600 }}>{senderName}</p>
      <div className="signature-line"></div>
    </div>
  );
}