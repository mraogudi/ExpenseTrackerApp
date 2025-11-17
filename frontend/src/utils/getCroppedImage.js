import { createImage } from "./imageUtils";

export async function getCroppedImg(imageSrc, crop, zoom, aspect = 1) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const { width, height } = image;

  const cropX = (crop.x * width) / 100;
  const cropY = (crop.y * height) / 100;

  const cropWidth = (crop.width * width) / 100;
  const cropHeight = (crop.height * height) / 100;

  canvas.width = cropWidth;
  canvas.height = cropHeight;

  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob));
  });
}

