"use client"
import { useEffect, useState } from "react";
import { supabase } from "../config/supabase_client";

export default function useUser() {
    const [userSession, setUser] = useState()

    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user ?? "no user")
    }

    useEffect(() => {
        if (!supabase) return;
        fetchUser()
    }, [supabase])

    return [userSession]
}