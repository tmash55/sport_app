import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Quote } from 'lucide-react'

const testimonials = [
  {
    quote: "DraftPlay's March Madness Draft Contest took my love for college basketball to a whole new level!",
    author: "Sarah K.",
    avatar: "/placeholder.svg?height=40&width=40"
  },
  {
    quote: "The unique format kept me engaged throughout the entire tournament. Can't wait for next year!",
    author: "Mike R.",
    avatar: "/placeholder.svg?height=40&width=40"
  },
  {
    quote: "I've never had so much fun watching March Madness. The draft format is genius!",
    author: "Chris L.",
    avatar: "/placeholder.svg?height=40&width=40"
  }
]

export function Testimonials() {
  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">See What Players Are Saying</h2>
        <p className="text-center text-muted-foreground mb-12">Join over 10,000 players who competed on DraftPlay!</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <Quote className="w-8 h-8 text-primary mb-4" />
                <p className="mb-4 italic">{testimonial.quote}</p>
                <div className="flex items-center">
                  <Avatar className="mr-2">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                    <AvatarFallback>{testimonial.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold">{testimonial.author}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

