import { z } from 'zod';

export const getSigninSchema = () => {
  return z.object({
    Username: z
      .string()
      .min(1, { message: 'Username is required.' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long.' })
      .min(1, { message: 'Password is required.' }),
    MobileNumberCcId: z.string().optional(),
    MobileNumberCc: z.string().optional(),
    fingerprint: z.string().optional(),
    Nonce: z.string().optional(),
    Timestamp: z.string().optional(),
    Signature: z.string().optional(),
  });
};

export type SigninSchemaType = z.infer<ReturnType<typeof getSigninSchema>>;
