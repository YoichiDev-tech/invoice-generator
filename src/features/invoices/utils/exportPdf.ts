import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportInvoicePdf(elementId: string, fileName: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("The invoice preview is not available for export. Return to the preview and try again.");
  }

  const previousWidth = element.style.width;
  const previousMaxWidth = element.style.maxWidth;

  try {
    await document.fonts.ready;

    element.style.width = "794px";
    element.style.maxWidth = "794px";

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: 794,
      logging: false,
    });

    if (
      !Number.isFinite(canvas.width) ||
      !Number.isFinite(canvas.height) ||
      canvas.width <= 0 ||
      canvas.height <= 0
    ) {
      throw new Error("The invoice preview is empty and cannot be exported.");
    }

    const imgData = canvas.toDataURL("image/png");
    if (!imgData.startsWith("data:image/png;base64,")) {
      throw new Error("The invoice preview could not be converted to a PDF image.");
    }

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfPageHeight = pdf.internal.pageSize.getHeight();
    const imgHeightOnPdf = (canvas.height * pdfWidth) / canvas.width;

    if (!Number.isFinite(imgHeightOnPdf) || imgHeightOnPdf <= 0) {
      throw new Error("The invoice dimensions are invalid. Refresh the preview and try again.");
    }

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

    const safeFileName = fileName
      .trim()
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
      .replace(/[. ]+$/g, "")
      .replace(/\.pdf$/i, "") || "invoice";

    pdf.save(`${safeFileName}.pdf`);
  } catch (error) {
    if (error instanceof Error && /taint|cross-origin|security/i.test(error.message)) {
      throw new Error("A resource in the invoice preview blocked PDF export. Remove the resource or refresh the preview, then try again.");
    }

    if (error instanceof Error && /empty|dimensions|converted to a PDF image/i.test(error.message)) {
      throw error;
    }

    throw new Error("PDF export failed. Please try again. If it keeps happening, refresh the preview and retry.");
  } finally {
    element.style.width = previousWidth;
    element.style.maxWidth = previousMaxWidth;
  }
}
