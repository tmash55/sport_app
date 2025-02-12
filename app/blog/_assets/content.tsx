import type { JSX } from "react"
import type { StaticImageData } from "next/image"
import Image from "next/image"
import googleMarchImg from "@/public/blog/introducing-dryft/google-march.png"

export type categoryType = {
  slug: string
  title: string
  titleShort: string
  description: string
  descriptionShort: string
}

export type authorType = {
  slug: string
  name: string
  job: string
  description: string
  avatar: string
  socials: { platform: string; url: string; name: string; icon: string}[]
}

export type articleType = {
  slug: string
  title: string
  description: string
  categories: categoryType[]
  author: authorType
  publishedAt: string
  image: {
    src: StaticImageData | string
    urlRelative: string
    alt: string
  }
  content: JSX.Element
}

const categorySlugs: { [key: string]: string } = {
  feature: "feature",
  tutorial: "tutorial",
  announcement: "announcement",
}

export const categories: categoryType[] = [
  {
    slug: categorySlugs.announcement,
    title: "Dryft Announcements",
    titleShort: "Announcements",
    description:
      "Stay up-to-date with the latest news and features from Dryft, revolutionizing your sports pool experience.",
    descriptionShort: "Latest news and updates from Dryft.",
  },
]

const authorSlugs: {
  [key: string]: string
} = {
  tyler: "tyler-maschoff",
}

export const authors: authorType[] = [
  {
    slug: authorSlugs.tyler,
    name: "Tyler Maschoff",
    job: "Founder of Dryft Sports",
    description:
      "Passionate about sports and technology, creating innovative ways for fans to engage with their favorite games.",
    avatar: "",
    socials: [],
  },
]

export const articles: articleType[] = [
  {
    slug: "why-i-built-dryft",
    title: "Why I Built Dryft: A New Way to Experience March Madness",
    description:
      "Discover how Dryft is revolutionizing sports pools, starting with March Madness, and why I decided to create this innovative platform.",
    categories: [categories.find((category) => category.slug === categorySlugs.announcement)],
    author: authors.find((author) => author.slug === authorSlugs.tyler),
    publishedAt: "2025-02-12",
    image: {
      src: googleMarchImg,
      urlRelative: "/blog/introducing-dryft/google-march.png",
      alt: "Google Sheets used for March Madness pools",
    },
    content: (
      <>
        <Image
          src={googleMarchImg || "/placeholder.svg"}
          alt="Google Sheets used for March Madness pools"
          width={700}
          height={500}
          priority={true}
          className="rounded-lg"
          placeholder="blur"
        />
        <section className="mt-8">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">The Birth of Dryft</h2>
          <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
            A few years ago, my friend Robert Swanson had a fantastic idea: combine the excitement of March Madness with
            the strategic fun of fantasy sports. While filling out a traditional bracket is enjoyable, we wanted
            something that made every game even more engaging. That&apos;s when we started running our own March Madness
            draft-style pools, and I quickly realized just how much fun this format could be.
          </p>
        </section>

        <section className="mt-8">
          <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">From Manual to Automated</h3>
          <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
            For the last couple of years, I managed these pools using a Google Sheet. It was a completely manual
            process—I had one tab functioning as a draft board, similar to what you&apos;d see on ESPN Fantasy Football, and
            another tab for the leaderboard, where I manually updated every participant&apos;s picks and scores after each
            game. While it was fun, it was also a ton of work. Manually entering scores, calculating standings, and
            ensuring everything was accurate became overwhelming, not to mention the potential for errors in my
            calculations.
          </p>
        </section>

        <section className="mt-8">
          <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Scaling Challenges</h3>
          <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
            As I shared this pool with friends and coworkers, many wanted to join, but I ran into a major limitation:
            March Madness has only 64 teams (not including the play-in games), meaning that leagues had to be capped at
            a certain number of participants. I didn&apos;t have an easy way to manage multiple pools or allow others to set
            up their own without me manually overseeing everything.
          </p>
        </section>

        <section className="mt-8">
          <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">The Tech Solution</h3>
          <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
            With my background in IT, I knew there had to be a better way. That&apos;s how Dryft was born—a platform designed
            to automate and streamline the March Madness draft pool experience. Now, anyone can create and host their
            own pool without the manual effort. Dryft handles drafting, scoring, and leaderboards, making the experience
            seamless and more accessible to basketball and fantasy sports fans alike.
          </p>
        </section>

        <section className="mt-8">
          <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Beyond March Madness</h3>
          <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
            But Dryft isn&apos;t stopping at March Madness pools. I plan to continue developing new and exciting ways to
            enjoy sports pools, from staples like Survivor Pools and Pick&apos;ems to innovative new formats that bring even
            more strategy and engagement to the games we love.
          </p>
        </section>

        <section className="mt-8">
          <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">The Journey Ahead</h3>
          <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
            This is just the beginning, and I&apos;m thrilled for the journey ahead. Dryft is set to revolutionize how fans
            interact with sports, bringing more excitement, strategy, and community to every game. Whether you&apos;re a
            casual fan or a die-hard sports enthusiast, Dryft offers a new way to experience the thrill of competition.
          </p>
          <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
            Join us as we redefine sports engagement. Let&apos;s go!
          </p>
        </section>
      </>
    ),
  },
]

