import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

async function toDataUrl(url: string) {
  const response = await fetch(url);
  const blob = await response.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function withEmbeddedImages(container: HTMLElement, task: () => Promise<void>) {
  const images = Array.from(container.querySelectorAll("img"));
  const originals = await Promise.all(
    images.map(async (img) => {
      const originalSrc = img.src;
      if (!originalSrc || originalSrc.startsWith("data:")) {
        return { img, originalSrc, replaced: false };
      }

      try {
        const dataUrl = await toDataUrl(originalSrc);
        img.src = dataUrl;
        return { img, originalSrc, replaced: true };
      } catch {
        return { img, originalSrc, replaced: false };
      }
    }),
  );

  try {
    await task();
  } finally {
    originals.forEach(({ img, originalSrc, replaced }) => {
      if (replaced) {
        img.src = originalSrc;
      }
    });
  }
}

export async function exportOfferLetterPdf(element: HTMLElement, fileName: string, showPageNumbers: boolean) {
  await document.fonts.ready;

  await withEmbeddedImages(element, async () => {
    const pages = Array.from(element.querySelectorAll<HTMLElement>("[data-export-page='true']"));
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidthMm = 210;
    const pageHeightMm = 297;

    for (const [index, page] of pages.entries()) {
      const pageRect = page.getBoundingClientRect();
      const canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: Math.ceil(pageRect.width),
        width: Math.ceil(pageRect.width),
        height: Math.ceil(pageRect.height),
      });

      if (index > 0) {
        pdf.addPage();
      }

      const imageData = canvas.toDataURL("image/jpeg", 0.85);
      const imageHeightMm = (canvas.height / canvas.width) * pageWidthMm;
      pdf.addImage(imageData, "JPEG", 0, 0, pageWidthMm, imageHeightMm, undefined, "FAST");

      if (showPageNumbers) {
        pdf.setFontSize(8);
        pdf.setTextColor(120, 128, 140);
        pdf.text(`Page ${index + 1} of ${pages.length}`, pageWidthMm - 10, pageHeightMm - 6, {
          align: "right",
        });
      }
    }

    pdf.save(`${fileName || "offer-letter"}.pdf`);
  });
}
