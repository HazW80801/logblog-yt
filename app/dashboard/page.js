"use client"

import { useEffect, useState } from "react"
import Header from "../comps/Header"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { supabase } from "../config/supabase_client"
import { v4 as uuidv4 } from "uuid"
import useUser from "../hooks/useUser"
import Link from "next/link"


export default function DashboardPage() {
    const [openDialog, setOpenDialog] = useState(false)
    const [blogData, setBlogData] = useState({
        name: "",
        description: ""
    })
    const [blogs, setBlogs] = useState([])
    const [user] = useUser()
    const createBlog = async () => {
        if (blogData.name.trim() == "" || blogData.description.trim() == "") return;
        // const { data: { user } } = await supabase.auth.getUser()
        let blogId = uuidv4()
        await supabase.from("blogs").insert([
            {
                blog_id: blogId, blog_name: blogData.name,
                blog_description: blogData.description, user_id: user.id,
            }
        ])
        setOpenDialog(false)
        fetchBlogs()
    }

    const fetchBlogs = async () => {
        const { data: fetchedBlogs, error } = await supabase.from("blogs")
            .select().eq("user_id", user.id)
        setBlogs(fetchedBlogs)
    }
    useEffect(() => {
        if (!supabase || !user) return;
        fetchBlogs()
    }, [supabase, user])


    return (
        <div className="bg-[#050505] min-h-screen w-full items-center justify-centerrelative">
            {/* header */}
            <Header />
            {/* body */}
            <div className="w-full items-end justify-center flex flex-col p-6">
                <Dialog className="bg-black text-white" open={openDialog}>
                    <DialogTrigger className="button" onClick={() => setOpenDialog(true)}>
                        create blog
                    </DialogTrigger>
                    <DialogContent className="bg-[#080808] text-white border border-white/10 "
                        onInteractOutside={() => setOpenDialog(false)} >
                        <DialogHeader>
                            <DialogTitle>tell us more bout your business</DialogTitle>
                            <DialogDescription>
                                <div className="py-6 px-4 items-center justify-center 
                                flex flex-col space-y-10 mb-6">
                                    <input className="input" placeholder="name"
                                        value={blogData.name}
                                        onChange={(e) => setBlogData(curr => ({ ...curr, name: e.target.value }))}
                                    />
                                    <textarea className="input" placeholder="description"
                                        value={blogData.description}
                                        onChange={(e) => setBlogData(curr => ({ ...curr, description: e.target.value }))}
                                    />
                                    <button className="button w-full" onClick={createBlog}>create</button>
                                </div>
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
                {user && blogs?.length == 0 ?
                    <div className="items-center justify-center space-y-10
                flex flex-col w-full py-12 px-6 text-white
                ">
                        <h1> No Blogs Yet, create your first now.</h1>
                    </div> :
                    <div className="py-12 px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full ">
                        {blogs?.map(blogItem => (
                            <Link key={blogItem.blog_id} href={`/blog/${blogItem.blog_id}`}>
                                <div className="text-white border border-white/20 bg-[#090909] hover:border-white/50
                                rounded-lg py-12 w-full px-6 smooth cursor-pointer
                                ">
                                    <p>{blogItem.blog_name}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                }
            </div>
        </div>
    )
}