import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react";
import { supabase } from "../config/supabase_client";
import { redirect, useRouter } from "next/navigation";
import useUser from "../hooks/useUser";


export default function Header() {
    const [user] = useUser()
    const router = useRouter()
    if (user == "no user") router.replace("/signin")
    const signOut = async () => {
        await supabase.auth.signOut()
        router.replace("/signin")
    }

    return <div className=" fixed top-0 w-full border-b border-white/5 py-4 px-4 items-center justify-between
    flex z-50
    ">
        {/* logo */}
        <Link href="/dashboard" prefetch className="text-white">
            Log <b className="font-mono opacity-90">Blog.</b>
        </Link>
        <DropdownMenu>
            <DropdownMenuTrigger>
                {user !== "no user" && <div div className="flex space-x-2 items-center justify-center">
                    <img className="rounded-full h-6 w-6 self-center"
                        src={user?.user_metadata.avatar_url} />
                    <p className="label text-md">{user?.user_metadata.name}</p>
                </div>}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-black text-white border border-white/10">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <Link href={"/dashboard"} >
                    <DropdownMenuItem className="dropdown_item">Profile</DropdownMenuItem>
                </Link>
                <Link href={"/usage"} >
                    <DropdownMenuItem className="dropdown_item">usage</DropdownMenuItem>
                </Link>
                <Link href={"/plans"} >
                    <DropdownMenuItem className="dropdown_item">plans</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={signOut} className="dropdown_item">Log Out</DropdownMenuItem>

            </DropdownMenuContent>
        </DropdownMenu>

    </div >
}