import { neon } from '@netlify/neon';

export default async (req, context) => {
    // 1. Initialize Connection
    // Netlify automatically provides the connection string in the environment
    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    // 2. Parse Query Parameters (e.g. ?id=1)
    const url = new URL(req.url);
    const postId = url.searchParams.get('id');

    try {
        // 3. Execute Query
        let data;
        
        if (postId) {
            // Fetch single post
            // The syntax `[post]` pulls the first item from the array
            const [post] = await sql`SELECT * FROM posts WHERE id = ${postId}`;
            data = post;
        } else {
            // Fetch all posts (limit 10 for safety)
            data = await sql`SELECT * FROM posts LIMIT 10`;
        }

        // 4. Return JSON to your Frontend
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }
};