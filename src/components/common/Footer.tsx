interface FooterProps {
  senderEmail: string;
  senderCompany: string;
}

export default function Footer({ senderEmail, senderCompany }: FooterProps) {
  return (
    <div className="preview-footer space-y">
      <p className="footer-line">Thank you for working with us.</p>
      <p className="footer-line">If you have any questions, please email us.</p>
      <p className="footer-contact">{senderEmail}</p>
      <p className="footer-company">{senderCompany}</p>
    </div>
  );
}