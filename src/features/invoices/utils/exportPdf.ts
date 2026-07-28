import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportInvoicePdf(elementId: string, fileName: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Fix font loading
  await document.fonts.ready; // Ensures  Inter is actually painted before capture

  // Force a fixed, desktop-equivalent width just for the capture. Without
  // this, exporting from a narrow mobile viewport reflows the layout (the
  // preview's responsive/mobile CSS kicks in) and the PDF comes out
  // squashed or restacked compared to a desktop export. I then restore the
  // original inline width immediately after so the on-screen preview stays
  // responsive the rest of the time
  const previousWidth = element.style.width;
  const previousMaxWidth = element.style.maxWidth;
  element.style.width = "794px"; // A4 width at 96dpi
  element.style.maxWidth = "794px";

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff", // avoids transparent-canvas edge artifacts
    windowWidth: 794,
  });

  element.style.width = previousWidth;
  element.style.maxWidth = previousMaxWidth;

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