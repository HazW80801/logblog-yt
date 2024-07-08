import { NextResponse } from "next/server";
import Replicate from "replicate";
import { ReplicateStream, StreamingTextResponse } from 'ai';


const replicate = new Replicate({
    auth: process.env.REPLICATE_KEY
});

export async function POST(req) {
    const { title, business_description } = await req.json();
    let prompt = `without any explanation, write a human-styled SEO-friendly
     blog post about this ${title}, 
     for a business that can be described as ${business_description}. 
     add markdown is important.
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
            version: "fbfb20b472b2f3bdd101412a9f70a0ed4fc0ced78a77ff00970ee7a2383c575d", //llama3-70B
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