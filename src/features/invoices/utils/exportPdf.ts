import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportInvoicePdf(elementId: string, fileName: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("The invoice preview is not available for export.");
  }

  const previousWidth = element.style.width;
  const previousMaxWidth = element.style.maxWidth;

  try {
    // Wait for fonts before capturing the invoice to keep PDF typography stable.
    await document.fonts.ready;

    // Render at an A4-like CSS width so mobile exports retain the desktop layout.
    element.style.width = "794px";
    element.style.maxWidth = "794px";

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: 794,
    });

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error("The invoice preview is empty and cannot be exported.");
    }

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfPageHeight = pdf.internal.pageSize.getHeight();
    const imgHeightOnPdf = (canvas.height * pdfWidth) / canvas.width;

    // Split long invoices over multiple pages without scaling down the text.
    if (imgHeightOnPdf <= pdfPageHeight) {
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeightOnPdf);
    } else {
      let heightRemaining = imgHeightOnPdf;
      let position = 0;

      while (heightRemaining > 0) {
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeightOnPdf);
        heightRemaining -= pdfPageHeight;
        position -= pdfPageHeight;

        if (heightRemaining > 0) {
          pdf.addPage();
        }
      }
    }

    const safeFileName = fileName.trim().replace(/[<>:"/\\|?*]/g, "-") || "invoice";
    pdf.save(`${safeFileName}.pdf`);
  } finally {
    // Restore the responsive on-screen preview even when canvas capture fails.
    element.style.width = previousWidth;
    element.style.maxWidth = previousMaxWidth;
  }
}
