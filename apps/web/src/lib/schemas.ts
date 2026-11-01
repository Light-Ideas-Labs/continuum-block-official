import * as z from "zod";
import { parsePhoneNumberWithError } from "libphonenumber-js";

export const bootcampSchema = z.object({
  hostedBy: z.object({
    type: z.enum(["Individual", "Organization"]),
    name: z.string().min(1, "Hosted by name is required"),
    id: z.string().min(1, "Hosted by ID is required"),
  }),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  startDate: z.date(),
  duration: z.string().min(1, "Duration is required"),
  type: z.boolean(),
  liveClasses: z.object({
    count: z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val) && val >= 0, "Must be a non-negative number"),
    description: z.string().min(1, "Description is required"),
  }),
  practicalCaseStudy: z.string().min(1, "Practical case study is required"),
  weeklyFeedback: z.string().min(1, "Weekly feedback is required"),
  certification: z.string().min(1, "Certification is required"),
  enrollmentStatus: z.boolean(),
  image: z.union([z.string(), z.instanceof(File)]).optional(),
  status: z.boolean(),
  courses: z.array(z.object({ courseId: z.string(), title: z.string() })).optional(),
  members: z.array(z.object({ memberId: z.string(), fullName: z.string(), progress: z.number() })).optional(),
  testimonials: z.array(z.object({ testimonialId: z.string(), name: z.string(), content: z.string() })).optional(),
  price: z.object({
    amount: z.number().min(0, "Price must be greater than 0"),
    currency: z.string().min(1, "Currency is required"),
  }),
  paymentPlans: z.array(z.object({
    amount: z.number().min(0, "Price must be greater than 0"),
    currency: z.string().min(1, "Currency is required"),
    duration: z.string().min(1, "Duration is required"),
  })).optional(),
  categories: z.array(z.string()).optional(),
  averageRating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().min(0).optional(),
  prerequisites: z.string().optional(),
  leaderboard: z.array(z.object({
    memberId: z.string().uuid(),
    fullName: z.string().min(1, "Full name is required"),
    progress: z.number().min(0).max(100),
  })).optional(),  
});

export type BootcampFormData = z.infer<typeof bootcampSchema>;

export const memberSchema = z.object({
  memberId: z.string().uuid(),
  fullName: z.string().min(1, "Full name is required"),
  progress: z.number().min(0).max(100),
});

export type MemberFormData = z.infer<typeof memberSchema>;

export const courseBootCampSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  title: z.string().min(1, "Title is required"),
});

export type CourseBootcampFormData = z.infer<typeof courseBootCampSchema>;

// Course Editor Schemas
export const courseSchema = z.object({
  courseTitle: z.string().min(1, "Title is required"),
  courseDescription: z.string().min(1, "Description is required"),
  courseLevel: z.enum(["Beginner", "Intermediate", "Advanced"]),
  courseCategory: z.string().min(1, "Category is required"),
  coursePrice: z.string(),
  courseStatus: z.boolean(),
  courseImage: z.union([z.string(), z.instanceof(File)]).optional(),
});

export type CourseFormData = z.infer<typeof courseSchema>;

// Chapter Schemas
export const chapterSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  video: z.union([z.string(), z.instanceof(File)]).optional(),
});

export type ChapterFormData = z.infer<typeof chapterSchema>;

// Section Schemas
export const sectionSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export type SectionFormData = z.infer<typeof sectionSchema>;

export const paymentSchema = z.object({
  phone: z
    .string()
    .refine((phone) => {
      try {
        const phoneNumber = parsePhoneNumberWithError(phone,{ defaultCountry: 'US'});
        return phoneNumber.isValid();
      } catch (error) {
        return false;
      }
    }, "Invalid Kenyan phone number format. Use +2547XXXXXXXX")
});


// Guest Checkout Schema
export const guestSchema = z.object({
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .refine((phone) => {
      try {
        const phoneNumber = parsePhoneNumberWithError(phone,{ defaultCountry: 'US'});
        return phoneNumber.isValid();
      } catch (error) {
        return false;
      }
    }, "Invalid Kenyan phone number format. Use +2547XXXXXXXX")
});

export const validatePhoneNumber = (phone: string): boolean => {
  try {
    const phoneNumber = parsePhoneNumberWithError(phone,{ defaultCountry: 'US'});
    return phoneNumber.isValid();
  } catch (error) {
    return false;
  }
};

export type GuestFormData = z.infer<typeof guestSchema>;

// Notification Settings Schema
export const notificationSettingsSchema = z.object({
  courseNotifications: z.boolean(),
  emailAlerts: z.boolean(),
  smsAlerts: z.boolean(),
  notificationFrequency: z.enum(["immediate", "daily", "weekly"]),
});

export type NotificationSettingsFormData = z.infer<
  typeof notificationSettingsSchema
>;

// Auth Schemas
export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignInFormData = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the Terms of Service and Privacy Policy",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const verifyCodeSchema = z.object({
  code: z.string().length(6, "Enter the 6-digit code"),
});

export type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
