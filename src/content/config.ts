import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title:    z.string(),
    date:     z.string(),
    excerpt:  z.string(),
    category: z.string().default('Rankings'),
    tags:     z.array(z.string()).default([]),
    type:     z.enum(['rankings', 'review', 'guide', 'spotlight']).default('rankings'),
    image:    z.string().optional(),
    draft:    z.boolean().default(false),
    dateModified:   z.string().optional(),
    linksVerified:  z.array(z.object({ url: z.string(), ok: z.boolean(), checkedAt: z.string() })).optional(),
  }),
});

export const collections = { posts };
