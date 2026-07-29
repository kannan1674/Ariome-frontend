import { z } from 'zod';
import { isStrongPassword } from '@/lib/auth/passwordStrength';

const PASSWORD_POLICY_MESSAGE =
  'Password must be 8–128 characters and include uppercase, lowercase, a number, and a special character.';

export const getSignupSchema = () =>
  z
    .object({
      firstName: z
        .string()
        .min(1, { message: 'First name is required.' })
        .max(80, { message: 'First name is too long.' })
        .trim(),
      lastName: z
        .string()
        .min(1, { message: 'Last name is required.' })
        .max(80, { message: 'Last name is too long.' })
        .trim(),
      email: z
        .string()
        .min(1, { message: 'Email is required.' })
        .email({ message: 'Please enter a valid email address.' })
        .trim(),
      mobile: z
        .string()
        .min(1, { message: 'Mobile number is required.' })
        .regex(/^\d{10}$/, { message: 'Enter a valid 10-digit mobile number.' }),
      mobileCountryCodeId: z.string().min(1, { message: 'Country code is required.' }),
      password: z
        .string()
        .min(8, { message: PASSWORD_POLICY_MESSAGE })
        .max(128, { message: 'Password is too long.' })
        .refine(isStrongPassword, { message: PASSWORD_POLICY_MESSAGE }),
      passwordConfirmation: z.string().min(1, { message: 'Please confirm your password.' }),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: 'Passwords do not match.',
      path: ['passwordConfirmation'],
    });

export type SignupSchemaType = z.infer<ReturnType<typeof getSignupSchema>>;
