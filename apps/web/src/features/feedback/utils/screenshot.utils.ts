const MAX_SCREENSHOT_WIDTH = 1600;
const MAX_SCREENSHOT_HEIGHT = 1600;
const JPEG_QUALITY = 0.8;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Dosya okunamadı."));
        return;
      }
      resolve(result);
    };

    reader.onerror = () => reject(new Error("Dosya okuma hatası."));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Görsel yüklenemedi."));
    image.src = dataUrl;
  });
}

function calculateScaledSize(
  width: number,
  height: number,
): { width: number; height: number } {
  const widthRatio = MAX_SCREENSHOT_WIDTH / width;
  const heightRatio = MAX_SCREENSHOT_HEIGHT / height;
  const ratio = Math.min(1, widthRatio, heightRatio);

  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

function canvasToJpegDataUrl(canvas: HTMLCanvasElement): string {
  const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  if (!dataUrl) {
    throw new Error("Görsel dönüştürülemedi.");
  }
  return dataUrl;
}

export async function createScreenshotDataUrl(file: File): Promise<string> {
  const sourceDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(sourceDataUrl);
  const scaled = calculateScaledSize(image.width, image.height);

  const canvas = document.createElement("canvas");
  canvas.width = scaled.width;
  canvas.height = scaled.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas oluşturulamadı.");
  }

  context.drawImage(image, 0, 0, scaled.width, scaled.height);
  return canvasToJpegDataUrl(canvas);
}
