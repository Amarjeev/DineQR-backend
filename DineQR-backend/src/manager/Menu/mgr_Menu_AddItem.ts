/**
 * Manager Menu - Add Menu Item API
 * ---------------------------------------------------
 * Endpoint: POST /api/v1/manager/addMenuItem
 * Features:
 *   - Accepts food item details + image (via Multer).
 *   - Validates input using Zod schema.
 *   - Compresses and processes image (Sharp + custom logic).
 *   - Uploads optimized image to AWS S3.
 *   - Stores menu item data in MongoDB (with S3 URL & blurHash).
 *   - Returns success response with saved item data.
 *
 */

import { Router, Response } from "express";
import multer from "multer";
const storage = multer.memoryStorage(); // Use memory storage for multer (buffer for S3 upload)
import { compress_ImageFC } from "./compress_Image";
const upload = multer({ storage });
import { uploadToS3 } from "../../utils/Upload_s3";
import { AddItemSchema } from "./MenuValidation/mgr_MenuValidation";
import Menu_Item from "../../models/manager/mgr_MenuSchemaModel";
import { verifyToken } from "../../middleware/verifyToken/verifyToken";
import { ManagerPayload } from "../../types/manager";

interface MulterRequest extends Express.Request {
  file?: Express.Multer.File | undefined;
  body: any;
  manager?: ManagerPayload;
}

const mgr_Menu_AddItem_Roter = Router();

mgr_Menu_AddItem_Roter.post(
  "/api/v1/manager/addMenuItem",
  verifyToken("manager"),
  upload.single("image"), // Middleware to handle single image upload
  async (req: MulterRequest, res: Response) => {
    try {
      // Extract and parse incoming form data
      const data = req.body.foodItem;
      const { id } = req.manager as ManagerPayload;

      if (!data) {
        return res.status(400).json({
          message: "Food item data is required but not provided.",
          success: false,
        });
      }

      const item = JSON.parse(data);

      // Validate request data using Zod schema
      const result = AddItemSchema.safeParse(item);
      if (!result.success) {
        return res.status(400).json({
          message: "Some fields are invalid. Please check your input.",
          success: false,
        });
      }

      // Access uploaded file from Multer
      const multerReq = req as Express.Request & { file?: Express.Multer.File };

      // Check if image file exists
      if (!multerReq.file) {
        return res.status(400).json({
          message: "Image file is required but not provided.",
          success: false,
        });
      }

      // Compress image and generate blurHash
      const { standardBuffer, blurHash } = await compress_ImageFC(
        multerReq as MulterRequest
      );

      if (!standardBuffer || !blurHash) {
        return res.status(400).json({
          message: "Image processing failed. No valid buffer found.",
          success: false,
        });
      }

      // Upload compressed image to S3 and get file URL
      const standardUrl = await uploadToS3(
        standardBuffer,
        item?.productName || "file.jpg", // Use product name as filename or fallback
        "Menu" // Folder inside S3 bucket
      );

      // If no URL is returned, throw error
      if (!standardUrl) {
        return res.status(500).json({
          message: "Image upload failed. No URL received from S3.",
          success: false,
        });
      }

      // Create new Menu Item document
      const itemData = new Menu_Item({
        hotelKey: id,
        productName: item.productName,
        sizes: item.sizes,
        prices: item.prices,
        foodType: item.foodType,
        dishTime: item.dishTime,
        foodCategory: item.foodCategory,
        availability: item.availability || "Available",
        s3Url: standardUrl,
        blurHash,
      });

      // Save menu item to MongoDB
      await itemData.save();

      return res.status(201).json({
        message: "Menu item added successfully",
        success: true,
      });
    } catch (error) {
      console.error("Error while adding menu item:", error);
      return res.status(500).json({
        message: "Internal server error while adding menu item.",
        success: false,
      });
    }
  }
);

export default mgr_Menu_AddItem_Roter;
