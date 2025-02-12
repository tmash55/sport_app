import Image from "next/image"

interface DeviceFrameProps {
  src: string
  alt: string
}

export function DeviceFrame({ src, alt }: DeviceFrameProps) {
  return (
    <div className="relative w-full max-w-[1400px] mx-auto px-2 sm:px-4 lg:px-6">
      {/* Device Frame */}
      <div className="relative rounded-2xl sm:rounded-[2rem] border-2 sm:border-[8px] border-[#11274F] bg-[#11274F] dark:border-zinc-800 dark:bg-zinc-800 shadow-lg sm:shadow-xl p-0.5 sm:p-1.5">
        {/* Screen */}
        <div className="rounded-xl sm:rounded-[1.75rem] overflow-hidden bg-white dark:bg-zinc-900 relative">
          <Image
            src={src || "/icon.png"}
            alt={alt}
            width={1400}
            height={800}
            className="w-full h-auto object-cover"
            priority
          />
          {/* Fade overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-[33%] bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Bottom Bar */}
        <div className="absolute bottom-0.5 sm:bottom-1 left-1/2 -translate-x-1/2 w-[20%] sm:w-[22%] h-[2px] sm:h-[4px] bg-zinc-300 dark:bg-zinc-600 rounded-full" />
      </div>

      {/* Shadow Effect */}
      <div className="absolute -bottom-2 sm:-bottom-4 left-1/2 -translate-x-1/2 w-[98%] h-[10px] sm:h-[20px] bg-black/20 dark:bg-white/10 blur-lg rounded-full" />
    </div>
  )
}

