"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CheckCircle as CircleCheck, Info as CircleInfo, AlertTriangle, XCircle as CircleX, Loader2 } from "lucide-react"

const Toaster = ({ theme = "system", ...props }: ToasterProps) => {

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheck strokeWidth={2} className="size-4" />
        ),
        info: (
          <CircleInfo strokeWidth={2} className="size-4" />
        ),
        warning: (
          <AlertTriangle strokeWidth={2} className="size-4" />
        ),
        error: (
          <CircleX strokeWidth={2} className="size-4" />
        ),
        loading: (
          <Loader2 strokeWidth={2} className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
