import { Router, Response } from "express";
import { verifyToken } from "../../middleware/verifyToken/verifyToken";
import { MultiUserRequest } from "../../types/user";
import Notification_Schema from "../../models/notification/notification_SchemaModel";
import { Server as SocketIOServer } from "socket.io";

const post_Update_Notification_Status_Router = Router();

post_Update_Notification_Status_Router.post(
  "/api/v1/:role/:itemId/:action/update/notification-status",
  verifyToken(""),
  async (req: MultiUserRequest, res: Response) => {
    try {
      // ==============================================
      // 🧩 REQUEST PARAMETERS EXTRACTION
      // ==============================================
      
      // Extract role, itemId, and action from URL parameters
      const { role, itemId, action } = req.params;

      // ==============================================
      // 🧩 PARAMETER VALIDATION
      // ==============================================
      
      // Validate that all required parameters exist and action is valid
      if (
        !role ||
        !itemId ||
        !["markRead", "delete"].includes(action?.trim() || "")
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid parameters.",
        });
      }

      // ==============================================
      // 🧩 ROLE VALIDATION
      // ==============================================
      
      // Validate that role is one of the allowed values
      if (
        !["manager", "staff", "guest"].includes(
          role?.toLowerCase().trim() || ""
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid role. Allowed roles are manager, staff, guest.",
        });
      }

      // ==============================================
      // 🧩 USER AND HOTEL INFORMATION EXTRACTION
      // ==============================================
      
      // Extract hotelKey and userId from request based on role
      const hotelKey = req[role as keyof MultiUserRequest]?.hotelKey;
      const userId = req[role as keyof MultiUserRequest]?.userId;

      // Validate that hotelKey and userId are present
      if (!hotelKey || !userId) {
        return res.status(400).json({
          success: false,
          message: "Hotel key or user ID missing.",
        });
      }

      // ==============================================
      // 🧩 UPDATE FIELD DETERMINATION
      // ==============================================
      
      // Determine which field to update based on action type
      // "markRead" updates messageReaders array
      // "delete" updates messageDelete array
      const updateField =
        action === "markRead" ? "messageReaders" : "messageDelete";

      // ==============================================
      // 🧩 DATABASE UPDATE OPERATION
      // ==============================================
      
      // Find notification by ID and add userId to the appropriate array
      // $addToSet prevents duplicate entries in the array
      const updatedNotification =
        await Notification_Schema.findByIdAndUpdate(
          itemId,
          { $addToSet: { [updateField]: userId } }, // $addToSet prevents duplicates
          { new: true } // Return updated document
        );

      // Check if notification was found and updated
      if (!updatedNotification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found.",
        });
      }

      // ==============================================
      // 🧩 REAL-TIME NOTIFICATION UPDATE
      // ==============================================
      
      // If action is markRead, emit socket event for real-time update
      if (action === "markRead") {
        const io = req.app.get("io") as SocketIOServer;
        io.emit("markReadNewNotification", updatedNotification);
      }

      // ==============================================
      // 🧩 SUCCESS RESPONSE
      // ==============================================
      
      return res.status(200).json({
        success: true,
        message:
          action === "markRead"
            ? "Notification marked as read."
            : "Notification deleted successfully.",
      });
    } catch (error) {
      // ==============================================
      // 🧩 ERROR HANDLING
      // ==============================================
      
      console.error("Error updating notification:", error);
      return res.status(500).json({
        success: false,
        message: "Server error while updating notification.",
      });
    }
  }
);

export default post_Update_Notification_Status_Router;