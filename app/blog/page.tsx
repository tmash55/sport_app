import { categories, articles } from "./_assets/content"
import CardArticle from "./_assets/components/CardArticle"
import CardCategory from "./_assets/components/CardCategory"
import config from "@/config"
import { getSEOTags } from "@/libs/seo"

export const metadata = getSEOTags({
  title: `${config.appName} Blog | Sports Pools and Fantasy Drafts`,
  description:
    "Stay updated on the latest sports pool strategies, fantasy draft tips, and upcoming events in March Madness, NFL Draft, and more.",
  canonicalUrlRelative: "/blog",
})

export default async function Blog() {
  const articlesToDisplay = articles
    .sort((a, b) => new Date(b.publishedAt).valueOf() - new Date(a.publishedAt).valueOf())
    .slice(0, 6)

  return (
    <>
      <section className="text-center max-w-xl mx-auto mt-12 mb-24 md:mb-32">
        <h1 className="font-extrabold text-3xl lg:text-5xl tracking-tight mb-6">The {config.appName} Blog</h1>
        <p className="text-lg opacity-80 leading-relaxed">
          Dive into the world of sports pools and fantasy drafts. Get expert insights, strategies, and the latest
          updates on March Madness, NFL Draft, and other exciting events. Learn how to maximize your enjoyment and
          success in our innovative sports pool formats.
        </p>
      </section>

      <section className="grid lg:grid-cols-2 mb-24 md:mb-32 gap-8">
        {articlesToDisplay.map((article, i) => (
          <CardArticle article={article} key={article.slug} isImagePriority={i <= 2} />
        ))}
      </section>

      <section>
        <p className="font-bold text-2xl lg:text-4xl tracking-tight text-center mb-8 md:mb-12">
          Explore Our Sports Categories
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <CardCategory key={category.slug} category={category} tag="div" />
          ))}
        </div>
      </section>

      <section className="mt-24 md:mt-32 text-center">
        <h2 className="font-bold text-2xl lg:text-4xl tracking-tight mb-8">Upcoming Events</h2>
        <p className="text-lg opacity-80 leading-relaxed max-w-2xl mx-auto">
          Get ready for our exciting lineup of sports pools! Join us for March Madness, NFL Draft contests, and more.
          Create your pools, draft your teams, and experience the thrill of fantasy sports like never before.
        </p>
        {/* You can add more specific upcoming events here */}
      </section>
    </>
  )
}

