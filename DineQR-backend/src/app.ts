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
import compression from "compression";
import { createServer } from "http";

// Custom imports
import { securityHeaders } from "./middleware/WebsiteSecurity/securityHeaders";
import fileManagerRoutes from "./middleware/WebsiteSecurity/fileRoutes";
import { initSocket } from "./config/socket/socket";
import connectDB from "./config/mongoDb";

// --------------------------
// Route Imports
// --------------------------

// Manager routes
import emailCheckRouter from "./controllers/Manager/checkEmail/check_Email";
import mgr_Signup_Router from "./controllers/Manager/signup/mgr_Signup";
import mgr_Login_Router from "./controllers/Manager/login/mgr_Login";
import Mgr_OtpVerification_Router from "./controllers/Manager/otpVerification/Mgr_OtpVerification";
import mgr_checkEmail_Resetpwd_Router from "./controllers/Manager/forgotPassword/mgr_checkEmail_Resetpwd";
import mgr_newPassword_Resetpwd_Router from "./controllers/Manager/forgotPassword/mgr_newPassword_Resetpwd";
import mgr_verifyOtp_Resetpwd_Router from "./controllers/Manager/forgotPassword/mgr_verifyOtp_Resetpwd";

// Menu routes
import mgr_Menu_AddItem_Roter from "./manager/Menu/AddMenuItemse/mgr_Menu_AddItem";
import mgr_get_MenuByCategory_Router from "./manager/Menu/EditMenuItemse/mgr_get_MenuByCategory";
import mgr_get_MenuEdit_Router from "./manager/Menu/EditMenuItemse/mgr_get_MenuEdit_Item";
import mgr_update_EditMenuItem_Router from "./manager/Menu/EditMenuItemse/mgr_update_EditMenuItem";
import mgr_delete_EditMenuItem from "./manager/Menu/EditMenuItemse/mgr_delete_EditMenuItem";

// Table routes
import mgr_Create_Table_Router from "./manager/Tables/createTable/mgr_Create_Table";
import mgr_get_TableList_Router from "./manager/Tables/EditTables/mgr_get_TableList";
import mgr_edit_Table_Router from "./manager/Tables/EditTables/mgr_edit_Table";
import mgr_delete_Table_Router from "./manager/Tables/EditTables/mgr_delete_Table";
import mgr_search_TableList_Router from "./manager/Tables/EditTables/mgr_search_TableList";
import mgr_refresh_Table_Router from "./manager/Tables/EditTables/mgr_refresh_Table";

// Billing routes
import mgr_Create_Bill_Router from "./manager/Billing/CreateBill/mgr_Create_Bill";
import mgr_Get_Bill_Router from "./manager/Billing/EditBill/mgr_Get_Bill";
import mgr_Edit_Bill_Router from "./manager/Billing/EditBill/mgr_Edit_Bill";
import mgr_Delete_Bill_Router from "./manager/Billing/EditBill/mgr_Delete_Bill";

// Manager profile & settings
import mgr_get_ManagerProfile_Router from "./manager/settings/profile/mgr_get_profile";
import mgr_edit_ManagerProfile_Router from "./manager/settings/profile/mgr_edit_profile";
import mgr_upload_Hotelinfo_Router from "./manager/settings/hotelInfo/mgr_upload_Hotelinfo";
import mgr_get_Hotelinfo_Router from "./manager/settings/hotelInfo/mgr_get_Hotelinfo";
import mgr_Logout_Router from "./manager/settings/account/mgr_Logout";
import mgr_Request_deleteAccount_Router from "./manager/settings/account/mgr_Request_deleteAccount";
import mgr_Otpverify_deleteAccount_Router from "./manager/settings/account/mgr_Otpverify_deleteAccount";

// Staff account management
import mgr_Create_staff_account_Router from "./manager/settings/staffAccount/mgr_Create_staff_account";
import mgr_reset_staff_password_Router from "./manager/settings/staffAccount/mgr_reset_staff_Password";
import mgr_Get_staff_account_Router from "./manager/settings/staffAccount/mgr_Get_staff_account";
import mgr_check_pwd_staff_delAc_Router from "./manager/settings/staffAccount/deleteStaffAccount/mgr_check_pwd_staff_delAc";
import mgr_verify_otp_staff_delAc_Router from "./manager/settings/staffAccount/deleteStaffAccount/mgr_verify_otp_staff_delAc";

// Staff routes
import staff_Login_Router from "./controllers/Staff/login/staff_Login";

// QuickOrder routes
import get_category_food_list_Router from "./QuickOrder/confirmCart/get_category_food_list";
import get_food_byId_Router from "./QuickOrder/confirmCart/get_food_byID";
import get_user_Id_Router from "./controllers/getUserID/get_user_Id";
import get_Table_List_Router from "./controllers/GetTableList/get_Table_List";
import post_Confirm_Cart_Orders_Router from "./QuickOrder/confirmCart/post_Confirm_Cart_Orders";

// Orders Table
import put_Edit_Orders_Router from "./QuickOrder/ordersTable/put_Edit_Orders";
import del_Remove_Order_Items_Router from "./QuickOrder/ordersTable/del_Remove_Order_Items";
import post_Reject_Order_Router from "./QuickOrder/ordersTable/post_Reject_Order";
import post_confirm_Order_Router from "./QuickOrder/ordersTable/post_confirm_Order";

// Pending Table
import post_confirm_pending_Order from "./QuickOrder/pendingTable/post_confirm_pending_Order";

// Stock Table
import get_FetchMenuItems_Stock_Table_Router from "./QuickOrder/stockTable/get_FetchMenuItems_Stock_Table";
import post_UpdateStatus_Stock_Table_Router from "./QuickOrder/stockTable/post_UpdateStatus_Stock_Table";

// Notification routes
import post_Update_Notification_Status_Router from "./QuickOrder/notification/post_Update_Notification_Status";

// History routes
import get_Order_History_Router from "./QuickOrder/historyTable/get_Order_History";

// Token validation & Logout
import check_TokenValidation_Router from "./controllers/checkTokenExiste/check-auth";
import logout_Router from "./controllers/Logout/logout";

//guest routes
import guest_SendOtp_Router from "./controllers/Guest/login/guest_SendOtp";
import guest_Verify_Otp_Router from "./controllers/Guest/login/guest_Verify_Otp";
import guest_del_Orders_Router from "./guest/orders/guest_del_Orders";
import guest_date_OrderHistory_Router from "./guest/history/guest_date_OrderHistory";
import guest_getOrder_History_Router from "./guest/history/guest_getOrder_History";

//RazoPay
import razorPay_CreateOrder_Router from "./controllers/Razorpay/payment";
import razorPay_Verify_payment_Router from "./controllers/Razorpay/verifyPayment";
import mark_Paid_Router from "./QuickOrder/markPayment/mark_Payment";
// --------------------------
// Environment & App Setup
// --------------------------
dotenv.config(); // Load .env variables
const app: Application = express(); // Initialize Express app

// Extend Express Request to include safeFilePath
declare global {
  namespace Express {
    interface Request {
      safeFilePath?: string;
    }
  }
}

// --------------------------
// Middleware Setup
// --------------------------
app.use("/", fileManagerRoutes); // File handling routes
app.use(express.json()); // Parse JSON requests

// CORS configuration
const corsOptions: CorsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://dine-qr-website-vbdf.vercel.app",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true, // Enable cookies/auth headers
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(helmet());

// Apply compression for responses > 1KB
app.use(
  compression({
    level: 6,
    threshold: 1024,
  })
);

// Apply custom security headers
app.use(securityHeaders);
app.use(
  helmet.frameguard({
    action: "deny", // Deny all framing attempts
  })
);

// --------------------------
// API Routes Registration
// --------------------------

// Manager & Auth
app.use(mgr_Signup_Router);
app.use(emailCheckRouter);
app.use(mgr_Login_Router);
app.use(Mgr_OtpVerification_Router);

// Password Reset
app.use(mgr_checkEmail_Resetpwd_Router);
app.use(mgr_newPassword_Resetpwd_Router);
app.use(mgr_verifyOtp_Resetpwd_Router);

// Menu Management
app.use(mgr_Menu_AddItem_Roter);
app.use(mgr_get_MenuByCategory_Router);
app.use(mgr_get_MenuEdit_Router);
app.use(mgr_update_EditMenuItem_Router);
app.use(mgr_delete_EditMenuItem);

// Table Management
app.use(mgr_Create_Table_Router);
app.use(mgr_get_TableList_Router);
app.use(mgr_edit_Table_Router);
app.use(mgr_delete_Table_Router);
app.use(mgr_search_TableList_Router);
app.use(mgr_refresh_Table_Router);

// Billing
app.use(mgr_Create_Bill_Router);
app.use(mgr_Get_Bill_Router);
app.use(mgr_Edit_Bill_Router);
app.use(mgr_Delete_Bill_Router);

// Manager Profile & Settings
app.use(mgr_get_ManagerProfile_Router);
app.use(mgr_edit_ManagerProfile_Router);
app.use(mgr_upload_Hotelinfo_Router);
app.use(mgr_get_Hotelinfo_Router);
app.use(mgr_Logout_Router);
app.use(mgr_Request_deleteAccount_Router);
app.use(mgr_Otpverify_deleteAccount_Router);

// Staff Account
app.use(mgr_Create_staff_account_Router);
app.use(mgr_reset_staff_password_Router);
app.use(mgr_Get_staff_account_Router);
app.use(mgr_check_pwd_staff_delAc_Router);
app.use(mgr_verify_otp_staff_delAc_Router);

// QuickOrder & Cart
app.use(get_category_food_list_Router);
app.use(get_food_byId_Router);
app.use(get_user_Id_Router);
app.use(staff_Login_Router);
app.use(get_Table_List_Router);
app.use(post_Confirm_Cart_Orders_Router);

// Orders Table
app.use(put_Edit_Orders_Router);
app.use(del_Remove_Order_Items_Router);
app.use(post_Reject_Order_Router);
app.use(post_confirm_Order_Router);

// Pending Orders
app.use(post_confirm_pending_Order);

// Stock Table
app.use(get_FetchMenuItems_Stock_Table_Router);
app.use(post_UpdateStatus_Stock_Table_Router);

// Notifications & History
app.use(post_Update_Notification_Status_Router);
app.use(get_Order_History_Router);

// Token & Logout
app.use(check_TokenValidation_Router);
app.use(logout_Router);

//guest login
app.use(guest_SendOtp_Router);
app.use(guest_Verify_Otp_Router);
app.use(guest_date_OrderHistory_Router);
app.use(guest_del_Orders_Router);
app.use(guest_getOrder_History_Router);

//RazoPay
app.use(razorPay_CreateOrder_Router);
app.use(razorPay_Verify_payment_Router);
app.use(mark_Paid_Router);

// --------------------------
// Server Initialization
// --------------------------
const PORT: number = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB(); // Initialize MongoDB connection

    const httpServer = createServer(app);

    // Initialize Socket.IO
    const io = initSocket(httpServer);
    app.set("io", io); // Make io accessible in routes

    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running with WebSocket at port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exitCode = 1; // Exit if DB connection fails
  }
};

// Launch server
startServer();
