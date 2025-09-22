import sharp from "sharp";
import { encode } from "blurhash";

interface MulterRequest extends Express.Request {
  file?: Express.Multer.File | undefined;
}

export const compress_ImageFC = async (file: MulterRequest) => {
  if (!file.file?.buffer) throw new Error("No file buffer found");

  // --- Compress image for S3 ---
  let standardQuality = 70;
  let standardBuffer = await sharp(file.file.buffer)
    .resize({ width: 400 }) // card width fixed
    .jpeg({ quality: standardQuality })
    .toBuffer();

  // Reduce quality if larger than 100 KB
  while (standardBuffer.length > 100 * 1024 && standardQuality > 10) {
    standardQuality -= 10;
    standardBuffer = await sharp(file.file.buffer)
      .resize({ width: 400 })
      .jpeg({ quality: standardQuality })
      .toBuffer();
  }

  // --- Generate BlurHash ---
  // Resize to small width for BlurHash but keep original aspect ratio
  const { data, info } = await sharp(standardBuffer)
    .raw()
    .ensureAlpha()
    .resize({ width: 128 }) // tiny width for encoding
    .toBuffer({ resolveWithObject: true }); // height auto

  const blurHash = encode(
    new Uint8ClampedArray(data),
    info.width,
    info.height,
    4, // component X
    4  // component Y
  );

  return {
    standardBuffer, // save to S3
    blurHash,       // save in MongoDB for placeholder
  };
};
