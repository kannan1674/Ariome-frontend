import { z } from 'zod';

export const getForgotPasswordSchema = () =>
  z.object({
    email: z.string().trim().email('Please enter a valid email address.'),
  });

export type ForgotPasswordSchemaType = z.infer<ReturnType<typeof getForgotPasswordSchema>>;
