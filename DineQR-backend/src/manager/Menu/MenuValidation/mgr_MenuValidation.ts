import { z } from 'zod'
import { dishTimes } from '../../../controllers/CategoriesList/DishTime'
import { foodCategories } from '../../../controllers/CategoriesList/FoodCategory'

export const AddItemSchema = z
  .object({
    productName: z
      .string()
      .nonempty('Product name is required')
      .min(2, 'Product name must be at least 2 characters')
      .max(50, 'Product name must be at most 50 characters'),

    sizes: z
      .object({
        quarter: z.boolean(),
        half: z.boolean(),
        full: z.boolean(),
      })
      .refine((sizes) => sizes.quarter || sizes.half || sizes.full, {
        message: 'At least one size must be selected',
        path: ['sizes'],
      }),

    prices: z.object({
      quarter: z
        .string()
        .max(6, { message: 'Quarter price cannot exceed 6 digits' })
        .refine(
          (val) => val === '' || (!isNaN(Number(val)) && Number(val) > 0),
          { message: 'Please enter a valid quarter price', path: ['quarter'] }
        ),
      half: z
        .string()
        .max(6, { message: 'Half price cannot exceed 6 digits' })
        .refine(
          (val) => val === '' || (!isNaN(Number(val)) && Number(val) > 0),
          { message: 'Please enter a valid half price', path: ['half'] }
        ),
      full: z
        .string()
        .max(6, { message: 'Full price cannot exceed 6 digits' })
        .refine(
          (val) => val === '' || (!isNaN(Number(val)) && Number(val) > 0),
          { message: 'Please enter a valid full price', path: ['full'] }
        ),
    }),

    foodType: z.string().superRefine((val, ctx) => {
      if (val.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Food type is required',
        })
        return
      }
      if (!['veg', 'non-veg'].includes(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid food type',
        })
      }
    }),

    dishTime: z.string().superRefine((val, ctx) => {
      if (val.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Dish time is required',
        })
        return
      }
      if (
        !dishTimes
          .map((t) => t.toLowerCase().replace(/\s+/g, '-'))
          .includes(val)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid dish time',
        })
      }
    }),

    foodCategory: z.string().superRefine((val, ctx) => {
      if (val.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Food category is required',
        })
        return
      }
      if (
        !foodCategories
          .map((c) => c.toLowerCase().replace(/\s+/g, '-'))
          .includes(val)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid food category',
        })
      }
    }),

    availability: z.string().superRefine((val, ctx) => {
      if (val.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Availability status is required',
        })
        return
      }
      if (!['Available', 'SoldOut', 'ComingSoon'].includes(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid availability option',
        })
      }
    }),
  })

  // ✅ This superRefine applies to the whole object (not availability only)
  .superRefine((data, ctx) => {
    if (data.sizes.quarter && (!data.prices.quarter || Number(data.prices.quarter) <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please enter a valid quarter price',
        path: ['prices', 'quarter'],
      })
    }

    if (data.sizes.half && (!data.prices.half || Number(data.prices.half) <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please enter a valid half price',
        path: ['prices', 'half'],
      })
    }

    if (data.sizes.full && (!data.prices.full || Number(data.prices.full) <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please enter a valid full price',
        path: ['prices', 'full'],
      })
    }
  })
