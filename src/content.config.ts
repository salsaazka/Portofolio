import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    order: z.number(),
    title: z.string(),
    kind: z.string(),
    year: z.string(),
    role: z.string(),
    team: z.string(),
    tools: z.array(z.string()),
    summary: z.string(),
    /** true while the content is still placeholder text */
    sample: z.boolean().default(false),
    /** lines for the terminal visual: [type, text] — type: cmd | ok | sum | l */
    terminal: z.array(z.tuple([z.enum(['cmd', 'ok', 'sum', 'l']), z.string()])),
  }),
});

const experience = defineCollection({
  loader: file('src/content/experience.json'),
  schema: z.object({
    order: z.number(),
    year: z.string(),
    role: z.string(),
    company: z.string(),
    period: z.string(),
    place: z.string(),
    track: z.enum(['dev', 'qa']),
    current: z.boolean().default(false),
  }),
});

export const collections = { projects, experience };
