"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"

interface Crumb {
    label: string
    href?: string
}

interface PageHeaderProps {
    eyebrow?: string
    title: ReactNode
    highlight?: string
    description?: string
    crumbs?: Crumb[]
    actions?: ReactNode
}

export function PageHeader({
    eyebrow,
    title,
    highlight,
    description,
    crumbs,
    actions,
}: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 px-4 lg:px-6">
            {crumbs && crumbs.length > 0 && (
                <nav className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                    {crumbs.map((c, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5">
                            {c.href ? (
                                <Link href={c.href} className="hover:text-foreground transition-colors inline-flex items-center gap-1">
                                    {i === 0 && <ArrowLeft className="size-3" />}
                                    {c.label}
                                </Link>
                            ) : (
                                <span className="text-foreground">{c.label}</span>
                            )}
                            {i < crumbs.length - 1 && <ChevronRight className="size-3" />}
                        </span>
                    ))}
                </nav>
            )}

            <header className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/30">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-24 -right-16 size-80 rounded-full bg-primary opacity-[0.08] blur-3xl" />
                </div>
                <div className="relative grid gap-4 px-6 py-7 sm:px-8 sm:py-9 sm:grid-cols-[1.4fr_1fr] sm:items-center">
                    <div className="flex flex-col gap-3">
                        {eyebrow && (
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                                {eyebrow}
                            </div>
                        )}
                        <h1 className="font-black italic uppercase tracking-tighter text-4xl sm:text-5xl leading-[0.9]">
                            {title}
                            {highlight && (
                                <>
                                    <br />
                                    <span className="text-primary">{highlight}</span>
                                </>
                            )}
                        </h1>
                        {description && <p className="text-sm text-muted-foreground italic max-w-xl">{description}</p>}
                    </div>
                    {actions && (
                        <div className="flex flex-wrap items-center justify-end gap-2">{actions}</div>
                    )}
                </div>
            </header>
        </div>
    )
}
