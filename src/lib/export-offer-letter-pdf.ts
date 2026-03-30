import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function rasterizeToPngDataUrl(src: string) {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width || 1;
  canvas.height = image.naturalHeight || image.height || 1;
  const context = canvas.getContext("2d");

  if (!context) {
    return src;
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

async function withEmbeddedImages(container: HTMLElement, task: () => Promise<void>) {
  const images = Array.from(container.querySelectorAll("img"));
  const originals = await Promise.all(
    images.map(async (img) => {
      const originalSrc = img.src;
      if (!originalSrc) {
        return { img, originalSrc, replaced: false };
      }

      try {
        const dataUrl = await rasterizeToPngDataUrl(originalSrc);
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
    if (pages.length === 0) {
      return;
    }

    const pageCanvases = await Promise.all(
      pages.map(async (page) => {
        const pageRect = page.getBoundingClientRect();
        return await html2canvas(page, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          windowWidth: Math.ceil(pageRect.width),
          width: Math.ceil(pageRect.width),
          height: Math.ceil(pageRect.height),
        });
      }),
    );

    const firstCanvas = pageCanvases[0];
    const firstHeightMm = (firstCanvas.height / firstCanvas.width) * 210;
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [210, firstHeightMm] });

    pageCanvases.forEach((canvas, index) => {
      const pageHeightMm = (canvas.height / canvas.width) * 210;

      if (index > 0) {
        pdf.addPage([210, pageHeightMm], "portrait");
      }

      const imageData = canvas.toDataURL("image/jpeg", 0.85);
      pdf.addImage(imageData, "JPEG", 0, 0, 210, pageHeightMm, undefined, "FAST");

      if (showPageNumbers) {
        pdf.setFontSize(8);
        pdf.setTextColor(120, 128, 140);
        pdf.text(`Page ${index + 1} of ${pageCanvases.length}`, 200, pageHeightMm - 6, {
          align: "right",
        });
      }
    });

    pdf.save(`${fileName || "offer-letter"}.pdf`);
  });
}

export async function exportOfferLetterTextPdf(element: HTMLElement, fileName: string, showPageNumbers: boolean) {
  await document.fonts.ready;

  await withEmbeddedImages(element, async () => {
    const pages = Array.from(element.querySelectorAll<HTMLElement>("[data-export-page='true']"));
    if (pages.length === 0) {
      return;
    }

    let pdf: jsPDF | null = null;

    for (const [index, page] of pages.entries()) {
      const pageRect = page.getBoundingClientRect();
      const pageHeightMm = (pageRect.height / pageRect.width) * 210;

      if (!pdf) {
        pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [210, pageHeightMm] });
      } else {
        pdf.addPage([210, pageHeightMm], "portrait");
      }

      await pdf.html(page, {
        x: 0,
        y: 0,
        width: 210,
        windowWidth: Math.ceil(pageRect.width),
        autoPaging: "text",
        html2canvas: {
          scale: 1,
          useCORS: true,
          backgroundColor: "#ffffff",
          width: Math.ceil(pageRect.width),
          height: Math.ceil(pageRect.height),
        },
      });

      if (showPageNumbers) {
        pdf.setFontSize(8);
        pdf.setTextColor(120, 128, 140);
        pdf.text(`Page ${index + 1} of ${pages.length}`, 200, pageHeightMm - 6, {
          align: "right",
        });
      }
    }

    pdf?.save(`${fileName || "offer-letter"}.pdf`);
  });
}
