"use client"

import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, ChevronRight } from "lucide-react"

interface Crumb {
  label: string
  to?: string
}

interface PageShellProps {
  eyebrow?: string
  title: string
  highlight?: string
  description?: string
  crumbs?: Crumb[]
  actions?: ReactNode
  children: ReactNode
}

export function PageShell({
  eyebrow,
  title,
  highlight,
  description,
  crumbs,
  actions,
  children,
}: PageShellProps) {
  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      {crumbs && crumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {crumbs.map((c, i) => (
            <span key={i} className="inline-flex items-center gap-1.5">
              {c.to ? (
                <Link
                  to={c.to}
                  className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  {i === 0 && <ArrowLeft className="size-3" />}
                  {c.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{c.label}</span>
              )}
              {i < crumbs.length - 1 && <ChevronRight className="size-3" />}
            </span>
          ))}
        </nav>
      )}

      <header className="relative overflow-hidden rounded-2xl border bg-card">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-16 size-80 rounded-full bg-[var(--mkt-accent)] opacity-[0.10] blur-3xl" />
          <div className="absolute inset-0 mkt-grid-bg opacity-[0.3]" />
        </div>
        <div className="relative grid gap-4 px-6 py-7 sm:px-8 sm:py-9 sm:grid-cols-[1.4fr_1fr] sm:items-center">
          <div className="flex flex-col gap-3">
            {eyebrow && (
              <div className="mkt-eyebrow mkt-accent">{eyebrow}</div>
            )}
            <h1 className="mkt-display text-4xl sm:text-5xl">
              {title}
              {highlight && (
                <>
                  <br />
                  <span className="mkt-accent">{highlight}</span>
                </>
              )}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground max-w-xl">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {actions}
            </div>
          )}
        </div>
      </header>

      {children}
    </div>
  )
}
