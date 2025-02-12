import Link from "next/link"
import { Avatar as ShadcnAvatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import type { articleType } from "../content"

const Avatar = ({ article }: { article: articleType }) => {
  const initials = article.author.name
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Link
      href={`/blog/author/${article.author.slug}`}
      title={`Posts by ${article.author.name}`}
      className="inline-flex items-center gap-2 group"
      rel="author"
    >
      <ShadcnAvatar className="w-8 h-8">
        <AvatarImage src={article.author.avatar} alt={`Avatar of ${article.author.name}`} />
        <AvatarFallback>{initials}</AvatarFallback>
      </ShadcnAvatar>
      <span className="group-hover:underline text-sm font-medium">{article.author.name}</span>
    </Link>
  )
}

export default Avatar

