'use client'

import { useEffect, useRef } from "react"
import { motion, useAnimation, useInView } from "framer-motion"

export const TextGenerateEffect = ({ words, className = "" }: { words: string, className?: string }) => {
  const ctrls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })

  useEffect(() => {
    if (isInView) {
      ctrls.start("visible")
    }
  }, [ctrls, isInView])

  const wordArray = words.split(" ")
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  }

  const child = {
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      x: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  }

  return (
    <motion.div
      className={`overflow-hidden ${className}`}
      variants={container}
      initial="hidden"
      animate={ctrls}
      ref={ref}
    >
      {wordArray.map((word, index) => (
        <motion.span
          variants={child}
          style={{ display: "inline-block", marginRight: "3px" }}
          key={index}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  )
}