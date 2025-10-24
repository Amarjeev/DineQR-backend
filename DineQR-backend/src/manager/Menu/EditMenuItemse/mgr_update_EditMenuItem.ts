import { Router, Request, Response } from "express";
import { verifyToken } from "../../../middleware/verifyToken/verifyToken";
import multer from "multer";

// ✅ Configure Multer to store uploaded images in memory (buffer) for processing or S3 upload
const storage = multer.memoryStorage();
import { compress_ImageFC } from "../AddMenuItemse/compress_Image"; // Image compression utility
const upload = multer({ storage }); // Multer middleware instance
import { uploadToS3 } from "../../../utils/Upload_s3"; // AWS S3 upload helper
import { redis } from "../../../config/redis"; // Redis client instance
import { diff } from "deep-diff"; // Deep comparison function for detecting changes
import { AddItemSchema } from "../MenuValidation/mgr_MenuValidation"; // Zod schema for validating menu items
import Menu_Item_Schema from "../../../models/manager/mgr_MenuSchemaModel"; // Mongoose model for menu items

const mgr_update_EditMenuItem_Router = Router();

// ✅ Extend Express Request type to include optional file and flexible body
interface MulterRequest extends Express.Request {
  file?: Express.Multer.File | undefined;
  body: any;
}

/**
 * @route   POST /api/v1/update/edit-menuItems/:productid
 * @desc    Update an existing menu item (manager only)
 * @access  Protected route; requires manager authentication
 */
mgr_update_EditMenuItem_Router.post(
  "/api/v1/update/edit-menuItems/:productid/:currentPage",
  verifyToken("manager"), // Verify manager token
  upload.single("image"), // Middleware to handle single image upload
  async (req: Request, res: Response) => {
    try {
      const multerReq = req as MulterRequest;
      const { productid, currentPage } = req.params;

      // ✅ Parse updated menu item data from request body
      const UpdatedData =
        typeof req.body.foodItem === "string"
          ? JSON.parse(req.body.foodItem)
          : req.body.foodItem;

      // ✅ Validate the updated data using Zod schema
      const result = AddItemSchema.safeParse(UpdatedData);
      if (!result.success) {
        return res.status(400).json({
          message: "Some fields are invalid. Please check your input.",
          success: false,
        });
      }

      // ✅ Fetch original menu item data from Redis cache
      const cacheKey = `mgr_menuItem${productid}`;
      const orginalData = await redis.get(cacheKey);

      // ✅ Detect differences between original and updated data
      const differences = diff(UpdatedData, orginalData);
      const updatedKeys: string[] = [];

      // ✅ Collect keys of fields that have been modified
      differences?.forEach((d) => {
        if (d.kind === "E" && d.path) {
          const key = d.path[d.path.length - 1]; // Last element in diff path
          updatedKeys.push(key);
        }
      });

      // ✅ If nothing changed and no file uploaded, return early
      if (!multerReq.file && updatedKeys.length === 0) {
        return res.status(400).json({
          message:
            "No changes detected. Please update some fields or upload an image.",
          success: false,
        });
      }

      // ✅ Prepare object with only updated fields to update MongoDB
      const results: any = {};
      const nestedKeys = ["quarter", "half", "full"]; // Special handling for nested size/price fields
      let addedNested = false;

      updatedKeys.forEach((key) => {
        if (key in UpdatedData) {
          results[key] = UpdatedData[key]; // Directly copy changed field
        } else if (nestedKeys.includes(key) && !addedNested) {
          results.sizes = UpdatedData.sizes; // Include sizes if nested field changed
          results.prices = UpdatedData.prices; // Include prices if nested field changed
          addedNested = true;
        }
      });

      // ✅ Handle image upload: compress, upload to S3, attach URL and blurHash
      if (multerReq?.file) {
        const { standardBuffer, blurHash } = await compress_ImageFC(multerReq);

        if (!standardBuffer || !blurHash) {
          return res.status(400).json({
            message: "Image processing failed. No valid buffer found.",
            success: false,
          });
        }

        const standardUrl = await uploadToS3(
          standardBuffer,
          UpdatedData?.productName || "file.jpg",
          "Menu"
        );

        if (!standardUrl) {
          return res.status(500).json({
            message: "Image upload failed. No URL received from S3.",
            success: false,
          });
        }

        results.s3Url = standardUrl;
        results.blurHash = blurHash;
      }

      // ✅ Update the menu item document in MongoDB
      const updatedDoc = await Menu_Item_Schema.findByIdAndUpdate(
        productid,
        { $set: results },
        { new: true } // Return the updated document
      );

      if (!updatedDoc) {
        return res.status(404).json({
          message: "Menu item not found",
          success: false,
        });
      }

      // ✅ Update Redis cache with fresh data and set expiration
      await redis.set(cacheKey, JSON.stringify(updatedDoc), { ex: 3600 });

        // ✅ Clear related menu list cache for the manager to reflect changes
        
      // Loop from page 1 up to the current page
      const pageNumber: number = Number(currentPage);

      for (let page: number = 1; page <= pageNumber; page++) {
        const MenuListRedisKey = `mgr_menu_list:${UpdatedData.foodCategory}:${pageNumber}:${UpdatedData.hotelKey}`;

        // Delete each redis key
        await redis.del(MenuListRedisKey);
      }

      // ✅ Send updated document back to client
      return res.status(200).json({
        message: "Menu item updated successfully",
        success: true,
      });
    } catch (error) {
      console.error("Error updating menu item:", error);
      return res.status(500).json({
        message: "Server error while updating menu item",
        success: false,
      });
    }
  }
);

export default mgr_update_EditMenuItem_Router;
