import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';

export const GET: APIRoute = async ({ params }) => {
    const { slug } = params;

    if (!slug) {
        return new Response(JSON.stringify({ error: 'Slug is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // Get the specific doc entry
        const doc = await getEntry('docs', slug);

        if (!doc) {
            return new Response(JSON.stringify({ error: 'Document not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Return the document data
        return new Response(JSON.stringify({
            slug: doc.slug,
            title: doc.data.title,
            description: doc.data.description,
            category: doc.data.category,
            date: doc.data.date.toISOString(),
            tags: doc.data.tags || [],
            author: doc.data.author,
            difficulty: doc.data.difficulty,
            featured: doc.data.featured,
            content: doc.body  // Raw markdown content
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=3600'
            }
        });

    } catch (error) {
        console.error('Error fetching doc:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

// Pre-render all doc routes at build time
export async function getStaticPaths() {
    const docs = await getCollection('docs');
    return docs.map(doc => ({
        params: { slug: doc.slug }
    }));
}
