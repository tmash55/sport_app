"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "How does the draft work?",
    answer:
      "The draft is a snake-style draft where each manager takes turns selecting teams. The draft order is randomized, and in even-numbered rounds, the order is reversed.",
  },
  {
    question: "How is scoring calculated?",
    answer:
      "Teams earn points for each win in the tournament. The points increase each round: 1 point for Round 1, 2 for Round 2, 4 for Sweet 16, 8 for Elite 8, 16 for Final Four, and 32 for the Championship.",
  },
  {
    question: "Can I change my team after the draft?",
    answer:
      "No, once the draft is complete, you cannot change your team. Your drafted teams are locked in for the entire tournament.",
  },
  {
    question: "When does the tournament start?",
    answer:
      "The NCAA March Madness tournament typically starts in mid-March. Check the official NCAA website or our league page for exact dates.",
  },
  {
    question: "How do I invite friends to my league?",
    answer:
      "As a league commissioner, you can invite friends by going to your league page and using the 'Invite Members' feature. You can send invitations via email.",
  },
]

export default function FAQSection() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

