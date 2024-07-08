"use client"
import Header from "@/app/comps/Header";
import { supabase } from "@/app/config/supabase_client";
import useUser from "@/app/hooks/useUser";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid"
import { marked } from "marked"


export default function BlogPage() {

    const [openDialog, setOpenDialog] = useState(false)
    const [postData, setPostData] = useState({
        title: "",
        keywords: ""
    })
    const [user] = useUser()
    const { blogId } = useParams()
    const [blogData, setBlogData] = useState("")
    const [streamedText, setStreamedText] = useState("")
    const [posts, setPosts] = useState([])
    const fetchBlogData = async () => {
        const { data: businessData, error } = await supabase.from("blogs").select()
            .eq("blog_id", blogId).eq("user_id", user?.id)
        setBlogData(businessData[0])
    }
    const fetchPosts = async () => {
        const { data: blogPosts, error } = await supabase.from("blog_posts")
            .select().eq("blog_id", blogId).eq("user_id", user?.id)
        setPosts(blogPosts)
    }
    useEffect(() => {
        if (!supabase || !user || !blogId) return;
        fetchBlogData()
        fetchPosts()
    }, [supabase, user, blogId])
    const createBlogPostIdea = async () => {
        const payload = {
            title: postData.title, keywords: postData.keywords,
            business_desc: blogData.blog_description
        }
        const response = await fetch("/api/idea", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (response.status == 500) {
            return
            setOpenDialog(false)
            setPostData({ title: "", keywords: "" })
            alert("sorry there is a problem, please try again.")
        }
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
        let postId = uuidv4()
        await supabase.from("blog_posts").insert([{
            blog_id: blogId, user_id: user?.id, title: result, state: "draft", post_id: postId
        }]).select()
        setTimeout(() => {
            setOpenDialog(false)
            fetchPosts()
            setPostData({ title: "", keywords: "" })
            setStreamedText("")
        }, 2000)

    }


    return (
        <div className="wrap">
            <Header />
            <div className="w-full items-center justify-end flex py-4 px-8 mb-10 mt-6">
                <Dialog className="bg-black text-white" open={openDialog}>
                    <DialogTrigger className="button" onClick={() => setOpenDialog(true)}>
                        new post idea
                    </DialogTrigger>
                    <DialogContent className="bg-[#080808] text-white border border-white/10 "
                        onInteractOutside={() => setOpenDialog(false)} >
                        <DialogHeader>
                            <DialogTitle>tell us more bout your business</DialogTitle>
                            <DialogDescription>
                                <div className="py-6 px-4 items-center justify-center 
                                flex flex-col space-y-10 mb-6">
                                    <input className="input" placeholder="title"
                                        value={postData.title}
                                        onChange={(e) => setPostData(curr => ({ ...curr, title: e.target.value }))}
                                    />
                                    <textarea className="input" placeholder="keywords"
                                        value={postData.keywords}
                                        onChange={(e) => setPostData(curr => ({ ...curr, keywords: e.target.value }))}
                                    />
                                    <button className="button w-full" onClick={createBlogPostIdea}>create</button>
                                </div>
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="items-center justify-center flex flex-col
            overflow-y-scroll mb-12 pb-12 pt-6 w-3/4
            bg-[#070707] border border-white/10 space-y-8
            ">
                {/* draft */}
                <div className="w-full items-center justify-center flex flex-col">
                    <h1 className="post_state">
                        Draft
                    </h1>
                    {streamedText && <span className="post_title">
                        {streamedText}
                    </span>}
                    <div className="space-y-4 w-full">
                        {posts?.filter(post => post.state == "draft").map(post => (
                            <Link key={post.post_id} href={`/post/${post.post_id}`} >
                                <div className="post_title"
                                    dangerouslySetInnerHTML={{ __html: marked(post.title) }}
                                />
                            </Link>
                        ))}
                    </div>
                </div>
                {/* in review */}
                <div className="w-full items-center justify-center flex flex-col">
                    <h1 className="post_state">
                        In Review
                    </h1>
                    <div className="space-y-4 w-full">
                        {posts?.filter(post => post.state == "inReview").map(post => (
                            <Link key={post.post_id} href={`/post/${post.post_id}`} >
                                <div className="post_title"
                                    dangerouslySetInnerHTML={{ __html: marked(post.title) }}
                                />
                            </Link>
                        ))}
                    </div>
                </div>
                {/* published */}
                <div className="w-full items-center justify-center flex flex-col">
                    <h1 className="post_state">
                        Published
                    </h1>
                    <div className="space-y-4 w-full">
                        {posts?.filter(post => post.state == "published").map(post => (
                            <Link key={post.post_id} href={`/post/${post.post_id}`} >
                                <div className="post_title"
                                    dangerouslySetInnerHTML={{ __html: marked(post.title) }}
                                />
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </div>)
}