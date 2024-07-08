import { NextResponse } from "next/server";
import Replicate from "replicate";
import { ReplicateStream, StreamingTextResponse } from 'ai';


const replicate = new Replicate({
    auth: process.env.REPLICATE_KEY
});

export async function POST(req) {
    const { title, keywords, business_desc } = await req.json()
    let prompt = ` no explanation please. in one line, I need only one blog post title for business
    described as ${business_desc} 
    ${title && title.trim() !== "" && "very important to form the title from this example" +
        title}, ${keywords && keywords.trim() !== "" && "very important to form the title from these keywords" +
        keywords}
    `
    const input = {
        top_k: 0,
        top_p: 0.9,
        prompt,
        temperature: 0.6,
        length_penalty: 1,
        presence_penalty: 1.15,
    };

    try {
        const response = await replicate.predictions.create({
            version: "5a6809ca6288247d06daf6365557e5e429063f32a21146b2a807c682652136b8", //llama3-8b-instruct
            input,
            stream: true
        })
        const stream = await ReplicateStream(response)
        return new StreamingTextResponse(stream)
    } catch (error) {
        if (error.name === "AbortError") {
            return NextResponse.json({ error: "Request Timed out" }, { status: 400 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}