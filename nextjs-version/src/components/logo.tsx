"use client"

import * as React from "react"

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: number
  monochrome?: boolean
}

export function Logo({ size = 24, className, monochrome = false, ...props }: LogoProps) {
  const [mounted, setMounted] = React.useState(false)
  const [resolvedTheme, setResolvedTheme] = React.useState<"dark" | "light">("dark")

  React.useEffect(() => {
    setMounted(true)

    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark")
      setResolvedTheme(isDark ? "dark" : "light")
    }

    checkTheme()

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          checkTheme()
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [])

  if (!mounted) {
    return <div style={{ width: size, height: size }} className={className} />
  }

  // Base logo source based on theme
  const logoSrc = resolvedTheme === "dark"
    ? "/logo-dark.png"
    : "/logo-light.png"

  if (monochrome) {
    return (
      <div
        style={{
          width: size,
          height: size,
          maskImage: `url(${logoSrc})`,
          WebkitMaskImage: `url(${logoSrc})`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
          backgroundColor: 'currentColor'
        }}
        className={className}
        {...(props as any)}
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${logoSrc}?t=${Date.now()}`}
      alt="Stadion Logo"
      width={size}
      height={size}
      className={`${className} ${resolvedTheme === 'dark' ? 'brightness-150 contrast-125' : ''}`}
      key={logoSrc}
      {...props}
    />
  )
}
