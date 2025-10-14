/**
 * ================================================
 * EduSpark Backend - Entry Point
 * -----------------------------------------------
 * Well-structured entry point for the backend:
 * - Loads environment variables
 * - Connects to MongoDB
 * - Starts Express server
 * - Registers global middlewares & routes
 * ================================================
 */

import dotenv from "dotenv";
import express, { Application } from "express";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { securityHeaders } from "./middleware/WebsiteSecurity/securityHeaders";
import fileManagerRoutes from "./middleware/WebsiteSecurity/fileRoutes";
import compression from "compression";
import { initSocket } from "./config/socket/socket";

import { createServer } from "http";

// Database connection
import connectDB from "./config/mongoDb";

// Route imports
import emailCheckRouter from "./controllers/Manager/checkEmail/check_Email";
import mgr_Signup_Router from "./controllers/Manager/signup/mgr_Signup";
import mgr_Login_Router from "./controllers/Manager/login/mgr_Login";
import Mgr_OtpVerification_Router from "./controllers/Manager/otpVerification/Mgr_OtpVerification";
import mgr_checkEmail_Resetpwd_Router from "./controllers/Manager/forgotPassword/mgr_checkEmail_Resetpwd";
import mgr_newPassword_Resetpwd_Router from "./controllers/Manager/forgotPassword/mgr_newPassword_Resetpwd";
import mgr_verifyOtp_Resetpwd_Router from "./controllers/Manager/forgotPassword/mgr_verifyOtp_Resetpwd";
import mgr_Menu_AddItem_Roter from "./manager/Menu/AddMenuItemse/mgr_Menu_AddItem";
import mgr_get_MenuByCategory_Router from "./manager/Menu/EditMenuItemse/mgr_get_MenuByCategory";
import mgr_get_MenuEdit_Router from "./manager/Menu/EditMenuItemse/mgr_get_MenuEdit_Item";
import mgr_update_EditMenuItem_Router from "./manager/Menu/EditMenuItemse/mgr_update_EditMenuItem";
import mgr_delete_EditMenuItem from "./manager/Menu/EditMenuItemse/mgr_delete_EditMenuItem";
import mgr_Create_Table_Router from "./manager/Tables/createTable/mgr_Create_Table";
import mgr_get_TableList_Router from "./manager/Tables/EditTables/mgr_get_TableList";
import mgr_edit_Table_Router from "./manager/Tables/EditTables/mgr_edit_Table";
import mgr_delete_Table_Router from "./manager/Tables/EditTables/mgr_delete_Table";
import mgr_search_TableList_Router from "./manager/Tables/EditTables/mgr_search_TableList";
import mgr_Create_Bill_Router from "./manager/Billing/CreateBill/mgr_Create_Bill";
import mgr_Get_Bill_Router from "./manager/Billing/EditBill/mgr_Get_Bill";
import mgr_Edit_Bill_Router from "./manager/Billing/EditBill/mgr_Edit_Bill";
import mgr_Delete_Bill_Router from "./manager/Billing/EditBill/mgr_Delete_Bill";
import mgr_get_ManagerProfile_Router from "./manager/settings/profile/mgr_get_profile";
import mgr_edit_ManagerProfile_Router from "./manager/settings/profile/mgr_edit_profile";
import mgr_upload_Hotelinfo_Router from "./manager/settings/hotelInfo/mgr_upload_Hotelinfo";
import mgr_get_Hotelinfo_Router from "./manager/settings/hotelInfo/mgr_get_Hotelinfo";
import mgr_Logout_Router from "./manager/settings/account/mgr_Logout";
import mgr_Request_deleteAccount_Router from "./manager/settings/account/mgr_Request_deleteAccount";
import mgr_Otpverify_deleteAccount_Router from "./manager/settings/account/mgr_Otpverify_deleteAccount";
import mgr_Create_staff_account_Router from "./manager/settings/staffAccount/mgr_Create_staff_account";
import mgr_reset_staff_password_Router from "./manager/settings/staffAccount/mgr_reset_staff_Password";
import mgr_Get_staff_account_Router from "./manager/settings/staffAccount/mgr_Get_staff_account";
import mgr_check_pwd_staff_delAc_Router from "./manager/settings/staffAccount/deleteStaffAccount/mgr_check_pwd_staff_delAc";
import mgr_verify_otp_staff_delAc_Router from "./manager/settings/staffAccount/deleteStaffAccount/mgr_verify_otp_staff_delAc";

//common

//Staff
import staff_Login_Router from "./controllers/Staff/login/staff_Login";

//Quic Order

//cart
import get_category_food_list_Router from "./QuickOrder/confirmCart/get_category_food_list";
import get_food_byId_Router from "./QuickOrder/confirmCart/get_food_byID";
import get_user_Id_Router from "./controllers/getUserID/get_user_Id";
import get_Table_List_Router from "./controllers/GetTableList/get_Table_List";
import post_Confirm_Cart_Orders_Router from "./QuickOrder/confirmCart//post_Confirm_Cart_Orders";

//OrderTable
import put_Edit_Orders_Router from "./QuickOrder/ordersTable/put_Edit_Orders";
import del_Remove_Order_Items_Router from "./QuickOrder/ordersTable/del_Remove_Order_Items";
import post_Reject_Order_Router from "./QuickOrder/ordersTable/post_Reject_Order";
import post_confirm_Order_Router from "./QuickOrder/ordersTable/post_confirm_Order";

//pendingTable
import post_confirm_pending_Order from "./QuickOrder/pendingTable/post_confirm_pending_Order";

//stockTable
import get_FetchMenuItems_Stock_Table_Router from "./QuickOrder/stockTable/get_FetchMenuItems_Stock_Table";
import post_UpdateStatus_Stock_Table_Router from "./QuickOrder/stockTable/post_UpdateStatus_Stock_Table";

//notification

import post_Update_Notification_Status_Router from "./QuickOrder/notification/post_Update_Notification_Status";



// Load environment variables from .env
dotenv.config();

// Create Express app instance
const app: Application = express();

// Extend Express Request type to include safeFilePath
declare global {
  namespace Express {
    interface Request {
      safeFilePath?: string;
    }
  }
}

// ✅ File handling routes middleware
app.use("/", fileManagerRoutes);

// Define server port with fallback
const PORT: number = Number(process.env.PORT) || 5000;

// ✅ CORS configuration for allowed frontends
const corsOptions: CorsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://dine-qr-website.vercel.app",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true, // Enable cookies/auth headers
};

/**
 * --------------------------
 * Middleware Setup
 * --------------------------
 */
app.use(express.json()); // Parse JSON requests
app.use(cors(corsOptions)); // Enable CORS
app.use(cookieParser()); // Parse cookies
app.use(helmet());

// ✅ Apply compression middleware
app.use(
  compression({
    level: 6, // 0-9 (default: system decides)
    threshold: 1024, // Only compress responses > 1KB
  })
);

// Apply custom security headers middleware
app.use(securityHeaders);

// Helmet frameguard for additional clickjacking protection
app.use(
  helmet.frameguard({
    action: "deny", // Deny all framing attempts
  })
);

/**
 * --------------------------
 * API Routes
 * --------------------------
 */
app.use(mgr_Signup_Router); // Manager signup routes
app.use(emailCheckRouter); // Email existence check routes
app.use(mgr_Login_Router); // Manager login routes
app.use(Mgr_OtpVerification_Router); // OTP verification routes

app.use(mgr_checkEmail_Resetpwd_Router); // Forgot password email check
app.use(mgr_newPassword_Resetpwd_Router); // Set new password
app.use(mgr_verifyOtp_Resetpwd_Router); // OTP verification for password reset
app.use(mgr_Menu_AddItem_Roter); //Menu item adding items
app.use(mgr_get_MenuByCategory_Router); //Menu item List items fetching
app.use(mgr_get_MenuEdit_Router); //Menu edit items
app.use(mgr_update_EditMenuItem_Router);
app.use(mgr_delete_EditMenuItem);
app.use(mgr_Create_Table_Router);
app.use(mgr_get_TableList_Router);
app.use(mgr_edit_Table_Router);
app.use(mgr_delete_Table_Router);
app.use(mgr_search_TableList_Router);
app.use(mgr_Create_Bill_Router);
app.use(mgr_Get_Bill_Router);
app.use(mgr_Edit_Bill_Router);
app.use(mgr_Delete_Bill_Router);
app.use(mgr_get_ManagerProfile_Router);
app.use(mgr_edit_ManagerProfile_Router);
app.use(mgr_upload_Hotelinfo_Router);
app.use(mgr_get_Hotelinfo_Router);
app.use(mgr_Logout_Router);
app.use(mgr_Request_deleteAccount_Router);
app.use(mgr_Otpverify_deleteAccount_Router);
app.use(mgr_Create_staff_account_Router);
app.use(mgr_reset_staff_password_Router);
app.use(mgr_Get_staff_account_Router);
app.use(mgr_check_pwd_staff_delAc_Router);
app.use(mgr_verify_otp_staff_delAc_Router);
app.use(get_category_food_list_Router);
app.use(get_food_byId_Router);
app.use(get_user_Id_Router);
app.use(staff_Login_Router);
app.use(get_Table_List_Router);
app.use(post_Confirm_Cart_Orders_Router);
app.use(put_Edit_Orders_Router);
app.use(del_Remove_Order_Items_Router);
app.use(post_Reject_Order_Router);
app.use(post_confirm_Order_Router);
app.use(post_confirm_pending_Order);
app.use(get_FetchMenuItems_Stock_Table_Router);
app.use(post_UpdateStatus_Stock_Table_Router);
app.use(post_Update_Notification_Status_Router);





/**
 * --------------------------
 * Start Server
 * --------------------------
 * Connects to MongoDB and starts Express server
 */
const startServer = async (): Promise<void> => {
  try {
    await connectDB(); // Initialize MongoDB connection

    const httpServer = createServer(app);

    // ✅ Initialize Socket.IO from separate file
    const io = initSocket(httpServer);

    // ✅ Make io accessible to routes
    app.set("io", io);

    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running with WebSocket at port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exitCode = 1; // Exit process if DB connection fails
  }
};

// Launch server
startServer();
