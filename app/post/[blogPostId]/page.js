"use client"
import Header from "@/app/comps/Header";
import Tiptap from "@/app/comps/Tiptap";
import { supabase } from "@/app/config/supabase_client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BlogPostPage() {
    const { blogPostId } = useParams()
    const router = useRouter()
    const [postData, setPostData] = useState()
    const [streamedText, setStreamedText] = useState("")
    const [loading, setLoading] = useState(false)
    const [slug, setSlug] = useState("")

    const fetchPostData = async () => {
        const { data, error } = await supabase.from("blog_posts").select()
            .eq("post_id", blogPostId)
        if (data.length == 0) router.replace("/dashboard")
        setPostData(data[0])
    }
    useEffect(() => {
        if (!supabase || !blogPostId) return;
        fetchPostData()
    }, [supabase, blogPostId])

    const generateContent = async () => {
        setLoading(true)
        const { data: blogData } = await supabase.from("blogs").select()
            .eq("blog_id", postData.blog_id)
        let business_description = blogData[0].blog_description
        let payload = {
            title: postData.title,
            business_description: business_description
        }
        const response = await fetch("/api/generate", {
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
            setStreamedText(result)
        }
        await supabase.from("blog_posts").update({ "content": result })
            .eq("post_id", blogPostId)
        fetchPostData()
        setLoading(false)
    }
    const slugDuplicate = (data, slugText) => {
        if (data.filter(item => item.slug == slugText).length > 0) { return true } else { return false }
    }

    const publishPost = async () => {
        if (slug.trim() == "") return;
        const { data } = await supabase.from("blog_posts").select("*")
        if (slugDuplicate(data, slug)) {
            window.alert(`this slug is used before, make sure your slug is unique.,${slug}`)
            return;
        }
        await supabase.from("blog_posts").update({
            state: "published", slug: slug.trim()
        }).eq("post_id", blogPostId).select()
        fetchPostData()
    }

    return (
        <div className="wrap">
            <Header />
            <Link href={postData?.slug ? `/p/${postData?.slug}` :
                `/post/${postData?.post_id}`}
                className="text-white py-6 mb-6 text-left border-b border-white/10
                 text-xl w-3/4 flex items-center justify-between group"
            >
                <h1>{postData?.title}</h1>
                {postData?.state == "published" &&
                    <ArrowUpRightIcon className="h8 w-8 stroke-white smooth group-hover:translate-x-1
                     group-hover:-translate-y-1 " />}
            </Link>
            <div className="bg-white text-black py-12 px-6 min-h-screen w-3/4 mb-12">
                <div className="text-black">
                    {(!postData?.content || loading) ?
                        streamedText :
                        <div>
                            <Tiptap content={postData?.content} />
                        </div>
                    }
                </div>
            </div>
            <footer className="footer">
                <button className="button"
                    onClick={generateContent}>
                    {postData?.content ? "Regenerate" : "Generate"}</button>
                {postData?.content &&
                    <>
                        {postData?.state !== "published" &&
                            <Popover>
                                <PopoverTrigger className="button">
                                    publish
                                </PopoverTrigger>
                                <PopoverContent className="bg-black text-white border border-white/10 rounded-lg
                                space-y-6 pt-6
                                ">
                                    <input type="text" className="input" placeholder="slug"
                                        value={slug.replaceAll(" ", "-")}
                                        onChange={(e) => setSlug(e.target.value)}
                                    />
                                    <button className="button"
                                        onClick={slug.trim() !== "" ? publishPost : null}
                                    >
                                        publish
                                    </button>
                                </PopoverContent>
                            </Popover>
                        }
                    </>
                }


            </footer>
        </div >
    )
}