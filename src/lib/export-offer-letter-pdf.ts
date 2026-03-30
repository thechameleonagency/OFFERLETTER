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

function isWhiteRow(data: Uint8ClampedArray, width: number, row: number) {
  const offset = row * width * 4;

  for (let x = 0; x < width; x += 1) {
    const pixel = offset + x * 4;
    if (data[pixel] < 240 || data[pixel + 1] < 240 || data[pixel + 2] < 240) {
      return false;
    }
  }

  return true;
}

function findBestBreakPosition(canvas: HTMLCanvasElement, idealY: number, minY: number, maxY: number) {
  const context = canvas.getContext("2d");
  if (!context) {
    return idealY;
  }

  const { width, height } = canvas;
  const safeMin = Math.max(0, Math.min(height - 1, minY));
  const safeMax = Math.max(0, Math.min(height - 1, maxY));
  const image = context.getImageData(0, 0, width, height);

  for (let distance = 0; distance < safeMax - safeMin; distance += 1) {
    const up = Math.max(safeMin, idealY - distance);
    if (isWhiteRow(image.data, width, up)) {
      return up;
    }

    const down = Math.min(safeMax, idealY + distance);
    if (isWhiteRow(image.data, width, down)) {
      return down;
    }
  }

  return idealY;
}

function trimTrailingWhitespace(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  if (!context) {
    return canvas.height;
  }

  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let row = canvas.height - 1; row >= 0; row -= 1) {
    if (!isWhiteRow(image.data, canvas.width, row)) {
      return row + 1;
    }
  }

  return canvas.height;
}

export async function exportOfferLetterPdf(element: HTMLElement, fileName: string, showPageNumbers: boolean) {
  await document.fonts.ready;

  const markerPositions = Array.from(element.querySelectorAll<HTMLElement>("[data-page-break='true']")).map((marker) => {
    const rect = marker.getBoundingClientRect();
    const parentRect = element.getBoundingClientRect();
    return rect.top - parentRect.top;
  });

  await withEmbeddedImages(element, async () => {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: 800,
    });

    const trimmedHeight = trimTrailingWhitespace(canvas);
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidthMm = 210;
    const pageHeightMm = 297;
    const pixelsPerPage = canvas.width * (pageHeightMm / pageWidthMm);
    const forceBreaks = markerPositions.map((position) => Math.round(position * 2));
    const slices: Array<{ start: number; end: number }> = [];
    let startY = 0;

    while (startY < trimmedHeight) {
      const forcedBreak = forceBreaks.find((position) => position > startY && position <= startY + pixelsPerPage);
      if (forcedBreak) {
        slices.push({ start: startY, end: forcedBreak });
        startY = forcedBreak;
        continue;
      }

      if (startY + pixelsPerPage >= trimmedHeight) {
        slices.push({ start: startY, end: trimmedHeight });
        break;
      }

      const ideal = Math.round(startY + pixelsPerPage);
      const range = Math.round(pixelsPerPage * 0.15);
      const breakY = findBestBreakPosition(canvas, ideal, ideal - range, ideal + range);
      slices.push({ start: startY, end: breakY });
      startY = breakY;
    }

    const filteredSlices = slices.filter((slice) => slice.end - slice.start > 12);

    filteredSlices.forEach((slice, index) => {
      if (index > 0) {
        pdf.addPage();
      }

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = slice.end - slice.start;
      const pageContext = pageCanvas.getContext("2d");

      if (!pageContext) {
        return;
      }

      pageContext.fillStyle = "#ffffff";
      pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      pageContext.drawImage(
        canvas,
        0,
        slice.start,
        canvas.width,
        slice.end - slice.start,
        0,
        0,
        canvas.width,
        slice.end - slice.start,
      );

      const imageHeightMm = (pageCanvas.height / pageCanvas.width) * pageWidthMm;
      const imageData = pageCanvas.toDataURL("image/jpeg", 0.85);
      pdf.addImage(imageData, "JPEG", 0, 0, pageWidthMm, imageHeightMm, undefined, "FAST");

      if (showPageNumbers) {
        pdf.setFontSize(8);
        pdf.setTextColor(120, 128, 140);
        pdf.text(`Page ${index + 1} of ${filteredSlices.length}`, pageWidthMm - 10, pageHeightMm - 6, {
          align: "right",
        });
      }
    });

    pdf.save(`${fileName || "offer-letter"}.pdf`);
  });
}
