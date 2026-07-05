"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { PostImage } from "@/lib/types"
import { cn } from "@/lib/utils"

export function ImageGallery({ images }: { images: PostImage[] }) {
  const [active, setActive] = useState(0)

  if (!images?.length) return null

  const go = (dir: number) => {
    setActive((prev) => (prev + dir + images.length) % images.length)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[active].image_url || "/placeholder.svg"}
          alt={`写真 ${active + 1}`}
          className="size-full object-cover"
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="前の写真"
              className="absolute left-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur transition hover:bg-background"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="次の写真"
              className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur transition hover:bg-background"
            >
              <ChevronRight className="size-5" />
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-background/70 px-2 py-1 backdrop-blur">
              {images.map((img, i) => (
                <span
                  key={img.id}
                  className={cn("size-1.5 rounded-full bg-foreground/30", i === active && "bg-primary")}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`写真 ${i + 1} を表示`}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition",
                i === active ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.image_url || "/placeholder.svg"} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
