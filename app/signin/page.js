"use client"
import { supabase } from "../config/supabase_client"

export default function SignInPage() {
    const signIn = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google'
        })
    }
    return <div className="min-h-screen bg-[#050505] items-center justify-center w-full
    flex flex-col relative
    ">
        <button onClick={signIn}
            className="button">SignIn with google</button>
    </div>
}