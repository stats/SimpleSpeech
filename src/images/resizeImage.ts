const MAX_IMAGE_SIZE = 125;
const IMAGE_QUALITY = 0.8;

export async function resizeImage(file: File): Promise<string> {
  const image = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = MAX_IMAGE_SIZE;
  canvas.height = MAX_IMAGE_SIZE;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create image canvas.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, MAX_IMAGE_SIZE, MAX_IMAGE_SIZE);

  const scale = Math.max(MAX_IMAGE_SIZE / image.width, MAX_IMAGE_SIZE / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  const x = (MAX_IMAGE_SIZE - width) / 2;
  const y = (MAX_IMAGE_SIZE - height) / 2;

  context.drawImage(image, x, y, width, height);

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
