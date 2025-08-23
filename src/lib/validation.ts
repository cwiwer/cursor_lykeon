import { z } from 'zod';

// Authentication validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required').max(320, 'Email too long'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128, 'Password too long'),
});

export const signUpSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required').max(320, 'Email too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters').regex(/^[a-zA-Z\s\u00C0-\u017F]+$/, 'Name can only contain letters and spaces'),
});

// Student registration validation
export const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters').regex(/^[a-zA-Z\s\u00C0-\u017F]+$/, 'Name can only contain letters and spaces'),
  age: z.number().min(3, 'Age must be at least 3').max(18, 'Age must be less than 18'),
  grade: z.string().min(1, 'Grade is required').max(20, 'Grade name too long'),
});

// Message validation
export const messageSchema = z.object({
  body: z.string().min(1, 'Message cannot be empty').max(1000, 'Message must be less than 1000 characters'),
  subject: z.string().optional().refine((val) => !val || val.length <= 100, 'Subject must be less than 100 characters'),
});

// Support ticket validation
export const supportTicketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(100, 'Subject must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be less than 2000 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
});

// Profile validation
export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long').regex(/^[a-zA-Z\s\u00C0-\u017F]+$/, 'Name can only contain letters and spaces').optional(),
  role: z.enum(['parent', 'student']).optional(),
  language: z.enum(['pt', 'en', 'fr']).optional(),
});

// Notification preferences validation
export const notificationPrefsSchema = z.object({
  type_key: z.string().min(1, 'Type key is required').max(50, 'Type key too long'),
  in_app: z.boolean(),
  email: z.boolean(),
  push: z.boolean(),
  sms: z.boolean(),
  quiet_start: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  quiet_end: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
});

// Gamification validation
export const missionProgressSchema = z.object({
  mission_id: z.string().uuid('Invalid mission ID'),
  progress: z.number().min(0, 'Progress cannot be negative').max(1000, 'Progress value too high'),
});

// Generic ID validation
export const uuidSchema = z.string().uuid('Invalid ID format');

// Sanitization helpers
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[^\w\s\u00C0-\u017F.,!?()-]/g, '') // Keep only safe characters
    .substring(0, 1000); // Limit length
};

export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase().substring(0, 320);
};

// Rate limiting validation
export const rateLimitSchema = z.object({
  action: z.string().min(1).max(50),
  maxAttempts: z.number().min(1).max(100),
  windowMinutes: z.number().min(1).max(1440), // Max 24 hours
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type StudentFormData = z.infer<typeof studentSchema>;
export type MessageFormData = z.infer<typeof messageSchema>;
export type SupportTicketFormData = z.infer<typeof supportTicketSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
export type NotificationPrefsData = z.infer<typeof notificationPrefsSchema>;
export type MissionProgressData = z.infer<typeof missionProgressSchema>;