import { supabase } from "@/app/config/supabase_client";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid"

export const runtime = "edge"
export const maxDuration = 60;

export async function GET(req) {
    const response = await update()
    return new NextResponse(JSON.stringify(response), {
        status: 200,
    })
}

async function update() {
    // 3. publish ? manually
    const { data: fetchedBlogs, error } = await supabase.from("blogs").select()
    for (const blog of fetchedBlogs) {
        const { user_id, blog_id, blog_description } = blog;
        let generatedTitle = ""
        let blogPostId = ""
        // 1.generate blog article idea/title
        const createPostTitle = async () => {
            let payload = {
                business_desc: blog_description
            }
            const response = await fetch("https://logblog-yt.vercel.app/api/idea", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })
            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let result = '';
            while (true) {
                const { done, value } = await reader.read()
                if (done) break;
                const chunk = decoder.decode(value, { stream: true })
                // Clean the streamed chunk
                const cleanedChunk = chunk
                    .replace(/0:"/g, '') // Remove the 0:"
                    .replace(/\\n/g, '\n') // Replace \n with an actual newline
                    .replace(/\\n\d+/g, '\n') // Replace \n followed by digits with a newline
                    .replace(/""/g, '') // Remove any double quotes
                    .replace(/"/g, '') // Remove any single/double quotes
                    .replace(/\\+/g, '') // Remove any backslashes
                    .replace(/"\*\*(.*?)\*\*"/g, '**$1**'); // Format text within **...**
                result += cleanedChunk
            }
            blogPostId = uuidv4()
            await supabase.from("blog_posts").insert([{
                blog_id, user_id, title: result, state: "draft", post_id: blogPostId
            }]).select()
            generatedTitle = result
        }
        // 2. generate the blog post content
        const generatePost = async () => {
            let payload = {
                title: generatedTitle,
                business_description: blog_description
            }
            const response = await fetch("https://logblog-yt.vercel.app/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })
            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let result = '';
            while (true) {
                const { done, value } = await reader.read()
                if (done) break;
                const chunk = decoder.decode(value, { stream: true })
                // Clean the streamed chunk
                const cleanedChunk = chunk
                    .replace(/0:"/g, '') // Remove the 0:"
                    .replace(/\\n/g, '\n') // Replace \n with an actual newline
                    .replace(/\\n\d+/g, '\n') // Replace \n followed by digits with a newline
                    .replace(/""/g, '') // Remove any double quotes
                    .replace(/"/g, '') // Remove any single/double quotes
                    .replace(/\\+/g, '') // Remove any backslashes
                    .replace(/"\*\*(.*?)\*\*"/g, '**$1**'); // Format text within **...**
                result += cleanedChunk
            }
            await supabase.from("blog_posts").update({ "content": result })
                .eq("post_id", blogPostId).select()
        }
        await createPostTitle();
        await generatePost();
    }
    return { message: "success" }
}