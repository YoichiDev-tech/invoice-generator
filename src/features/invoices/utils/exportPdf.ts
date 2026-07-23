import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportInvoicePdf(elementId: string, fileName: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfPageHeight = pdf.internal.pageSize.getHeight();
  const imgHeightOnPdf = (canvas.height * pdfWidth) / canvas.width;

  // If the rendered invoice is taller than one A4 page,
  // slice it across multiple pages instead of squashing everything
  // onto a single page
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

  pdf.save(`${fileName}.pdf`);
}