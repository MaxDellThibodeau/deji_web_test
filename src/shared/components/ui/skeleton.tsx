import type React from "react"
import { cn } from "@/shared/utils/utils"

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-zinc-800/50", className)} {...props} />
}

export { Skeleton }
