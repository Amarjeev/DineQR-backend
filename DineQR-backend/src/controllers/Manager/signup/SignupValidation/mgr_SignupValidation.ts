import { z } from 'zod';

export const mgr_SignupValidation_Schema = z
  .object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters')
      .max(50, 'Name cannot exceed 50 characters')
      .regex(/^[A-Za-z\s]+$/, 'Name can only contain letters and spaces'),

    email: z
      .string()
      .email('Invalid email address')
      .max(254, 'Email cannot exceed 254 characters'),

    mobileNumber: z
      .string()
      .regex(/^\d{10}$/, 'Mobile number must be 10 digits'),

    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(15, 'Password cannot exceed 15 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,15}$/,
        'Password must contain at least 1 lowercase, 1 uppercase, 1 number, 1 special character (@, $, !, %, *, ?, &) and be 6–15 characters long'
      ),

    rePassword: z.string().min(1, 'Please re-enter your password'),
  })
  .refine((data) => data.password === data.rePassword, {
    message: 'Passwords do not match',
    path: ['rePassword'],
  });
