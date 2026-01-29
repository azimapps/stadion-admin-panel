import { SignupForm1 } from "./components/signup-form-1"
import { Logo } from "@/components/logo"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex flex-col items-center gap-6 self-center font-medium">
          <div className="flex size-48 items-center justify-center bg-transparent transition-transform duration-500 hover:scale-105">
            <Logo size={220} className="object-contain" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-5xl font-black italic tracking-tightest uppercase text-foreground drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">STADION</span>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            <span className="text-[12px] font-bold uppercase tracking-[0.5em] text-muted-foreground/60">Monitoring System</span>
          </div>
        </Link>
        <SignupForm1 />
      </div>
    </div>
  )
}
