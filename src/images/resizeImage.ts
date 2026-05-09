const STORED_IMAGE_SIZE = 512;
const IMAGE_QUALITY = 0.9;

export async function resizeImage(file: File): Promise<string> {
  const image = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = STORED_IMAGE_SIZE;
  canvas.height = STORED_IMAGE_SIZE;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create image canvas.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, STORED_IMAGE_SIZE, STORED_IMAGE_SIZE);

  const scale = Math.max(STORED_IMAGE_SIZE / image.width, STORED_IMAGE_SIZE / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  const x = (STORED_IMAGE_SIZE - width) / 2;
  const y = (STORED_IMAGE_SIZE - height) / 2;

  context.drawImage(image, x, y, width, height);

  const webpDataUrl = canvas.toDataURL("image/webp", IMAGE_QUALITY);

  if (webpDataUrl.startsWith("data:image/webp")) {
    return webpDataUrl;
  }

  return canvas.toDataURL("image/jpeg", IMAGE_QUALITY);
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load the selected image."));
    };
    image.src = url;
  });
}
