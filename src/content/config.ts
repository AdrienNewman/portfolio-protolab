import { defineCollection, z } from 'astro:content';

const docsCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        category: z.enum([
            'active-directory',
            'paloalto',
            'monitoring',
            'proxmox',
            'linux',
            'windows',
            'docker',
            'backup',
            'network',
            'security'
        ]),
        date: z.date().optional(),
        tags: z.array(z.string()).optional(),
        author: z.string().default('Adrien Mercadier'),
    }),
});

const projectsCollection = defineCollection({
    type: 'data',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        stack: z.array(z.string()),
        featured: z.boolean().default(false),
        status: z.string(),
        icon: z.string().optional(),
        iconColor: z.string().optional(),
        glowColor: z.string().optional(),
        stats: z.array(z.object({
            label: z.string(),
            value: z.string(),
        })).optional(),
        link: z.string().optional(),
        github: z.string().optional(),
    }),
});

export const collections = {
    'docs': docsCollection,
    'projects': projectsCollection,
};
