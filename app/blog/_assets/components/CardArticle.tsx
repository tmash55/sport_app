import type { JSX } from "react"
import Link from "next/link"
import Image from "next/image"
import BadgeCategory from "./BadgeCategory"
import Avatar from "./Avatar"
import type { articleType } from "../content"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon } from "lucide-react"

const CardArticle = ({
  article,
  tag = "h2",
  showCategory = true,
  isImagePriority = false,
}: {
  article: articleType
  tag?: keyof JSX.IntrinsicElements
  showCategory?: boolean
  isImagePriority?: boolean
}) => {
  const TitleTag = tag

  return (
    <Card className="overflow-hidden">
      {article.image?.src && (
        <Link href={`/blog/${article.slug}`} className="block overflow-hidden" title={article.title} rel="bookmark">
          <Image
            src={article.image.src || "/placeholder.svg"}
            alt={article.image.alt}
            width={600}
            height={338}
            priority={isImagePriority}
            placeholder="blur"
            className="w-full aspect-video object-cover object-center transition-transform duration-300 ease-in-out hover:scale-105"
          />
        </Link>
      )}
      <CardHeader>
        {showCategory && (
          <div className="flex flex-wrap gap-2 mb-2">
            {article.categories.map((category) => (
              <BadgeCategory category={category} key={category.slug} />
            ))}
          </div>
        )}
        <CardTitle className="mb-2">
          <Link
            href={`/blog/${article.slug}`}
            className="hover:text-primary transition-colors duration-200"
            title={article.title}
            rel="bookmark"
          >
            {article.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{article.description}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <Avatar article={article} />
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarIcon className="mr-1 h-4 w-4" />
          <time dateTime={article.publishedAt}>
            {new Date(article.publishedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        </div>
      </CardFooter>
    </Card>
  )
}

export default CardArticle

