import { z } from 'zod';

// Schema for validating render job payload
export const renderJobSchema = z.object({
  videoUrl: z.string().url().min(1, 'Video URL is required'),
  targetPlatform: z.enum(['tiktok', 'instagram', 'youtube']),
  antiShadowban: z.object({
    enabled: z.boolean(),
    intensity: z.enum(['low', 'medium', 'high']),
    shuffleFrames: z.boolean(),
    metadataScrub: z.boolean(),
  }),
  autoCommentSniper: z.object({
    enabled: z.boolean(),
    keywords: z.string().optional(),
    delaySeconds: z.number().min(30).max(300).optional(),
  }),
  linkCloaking: z.object({
    enabled: z.boolean(),
    targetUrl: z.string().url().optional(),
    slug: z.string().optional(),
  }),
  landingPage: z.object({
    enabled: z.boolean(),
    productUrl: z.string().url().optional(),
    socialProof: z.string().optional(),
    urgencyTimer: z.boolean().optional(),
  }),
  userId: z.string().min(1),
});

export type RenderJobPayload = z.infer<typeof renderJobSchema>;

// Function to construct render job payload from form data
export function constructRenderJobPayload(
  formData: Record<string, any>,
  userId: string
): RenderJobPayload {
  return {
    videoUrl: formData.videoUrl,
    targetPlatform: formData.targetPlatform,
    antiShadowban: {
      enabled: formData.antiShadowban?.enabled || false,
      intensity: formData.antiShadowban?.intensity || 'medium',
      shuffleFrames: formData.antiShadowban?.shuffleFrames || false,
      metadataScrub: formData.antiShadowban?.metadataScrub || false,
    },
    autoCommentSniper: {
      enabled: formData.autoCommentSniper?.enabled || false,
      keywords: formData.autoCommentSniper?.keywords || undefined,
      delaySeconds: formData.autoCommentSniper?.delaySeconds || undefined,
    },
    linkCloaking: {
      enabled: formData.linkCloaking?.enabled || false,
      targetUrl: formData.linkCloaking?.targetUrl || undefined,
      slug: formData.linkCloaking?.slug || undefined,
    },
    landingPage: {
      enabled: formData.landingPage?.enabled || false,
      productUrl: formData.landingPage?.productUrl || undefined,
      socialProof: formData.landingPage?.socialProof || undefined,
      urgencyTimer: formData.landingPage?.urgencyTimer || undefined,
    },
    userId,
  };
}

// Function to validate render job payload
export function validateRenderJobPayload(
  payload: Record<string, any>
): { valid: boolean; error?: string } {
  try {
    renderJobSchema.parse(payload);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof z.ZodError ? error.errors[0].message : 'Invalid payload',
    };
  }
}