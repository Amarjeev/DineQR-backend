// import { Router, Request, Response } from "express";
// import GuestProfileSchema from "../../../models/guest/guest_ProfileSchemaModel";
// import { generateToken } from "../../../utils/generate_jwtToken";

// const guest_Login_Router = Router();

// guest_Login_Router.post(
//   "/api/v1/auth/login/guest",
//   async (req: Request, res: Response) => {
//     try {




 

//     //   // Step 9: Generate JWT token with staff information
//     //   const token = generateToken({
//     //     hotelKey: userData?.hotelKey,
//     //     userId: userData?.staffId,
//     //     name: userData?.name,
//     //     role:"staff"
//     //   });

//     //   // Step 10: Verify token generation was successful
//     //   if (!token) {
//     //     return res.status(500).json({
//     //       success: false,
//     //       message: "Server error: Could not generate authentication token",
//     //     });
//     //   }

//     //   // Step 11: Set secure HTTP-only cookie with JWT token
//     //   res.cookie("staff_Token", token, {
//     //     httpOnly: true,    // Prevents XSS attacks
//     //     secure: true,      // Only sent over HTTPS
//     //     sameSite: "strict", // CSRF protection
//     //     maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days expiration
//     //   });

//     //   // Step 12: Return successful login response
//     //   return res.status(200).json({
//     //     success: true,
//     //     message: "Login successful",
//     //     data: userData?.name, // Return staff name for frontend display
//     //   });

//     } catch (error) {
//       console.error("❌ Login error:", error);
//       return res.status(500).json({
//         success: false,
//         message: "Server error, please try again later",
//       });
//     }
//   }
// );

// export default guest_Login_Router;