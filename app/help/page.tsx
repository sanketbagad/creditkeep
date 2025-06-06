"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MessageCircle,
  Book,
  CreditCard,
  Store,
  Users,
  HelpCircle,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const faqs = [
  {
    category: "Getting Started",
    icon: Book,
    questions: [
      {
        question: "How do I create an account?",
        answer:
          "Click on 'Sign Up' from the login page, enter your name, email, mobile number, and create a password. You'll be able to start using the app immediately.",
      },
      {
        question: "How do I add my first shop?",
        answer:
          "Go to the 'Shops' tab, click the '+' button, and enter your shop details including name, address, and mobile number. You can add multiple shops to your account.",
      },
      {
        question: "Is my data secure?",
        answer:
          "Yes! We use industry-standard encryption to protect your data. All transactions are securely stored and your personal information is never shared with third parties.",
      },
    ],
  },
  {
    category: "Transactions",
    icon: CreditCard,
    questions: [
      {
        question: "How do I record a transaction?",
        answer:
          "Use the floating '+' button on the dashboard, select 'Add Transaction', choose the transaction type (borrow/payment), select your shop, enter the amount and customer details.",
      },
      {
        question: "Can I edit or delete transactions?",
        answer:
          "Currently, transactions cannot be edited or deleted to maintain data integrity. If you made an error, you can add a correction transaction with notes.",
      },
      {
        question: "How do I track payments?",
        answer:
          "All payments are automatically tracked. You can view outstanding balances in the 'My Customers' section and mark payments as received when customers pay you back.",
      },
    ],
  },
  {
    category: "Lending & Borrowing",
    icon: Users,
    questions: [
      {
        question: "How does the lending feature work?",
        answer:
          "Go to the 'Lending' tab to lend money to individuals. Enter their details and amount. They can then check their borrowing status using the 'Borrow' tab with their mobile number.",
      },
      {
        question: "How can customers check what they owe?",
        answer:
          "Customers can use the 'Borrow' tab to see all their borrowing details. They just need to visit the page and their information will be displayed automatically.",
      },
      {
        question: "Can I send payment reminders?",
        answer:
          "Yes! In the 'My Borrowers' section, click 'Remind' next to any borrower with outstanding balance. Choose from different reminder templates or write a custom message.",
      },
    ],
  },
  {
    category: "Shop Management",
    icon: Store,
    questions: [
      {
        question: "Can I manage multiple shops?",
        answer:
          "Yes! You can add multiple shops to your account. Each shop can have its own transactions and customer records.",
      },
      {
        question: "How do I view customers for my shop?",
        answer:
          "Use the 'My Customers' feature from the dashboard to see all customers who have borrowed from any of your shops, with outstanding balances and payment history.",
      },
      {
        question: "Can I edit shop details?",
        answer:
          "Yes! Go to the 'Shops' tab, select your shop, and click 'Edit' to update shop information including name, address, and mobile number.",
      },
    ],
  },
]

const contactOptions = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get help via email",
    contact: "hello@botbyte.in",
    action: "Send Email",
    color: "bg-blue-500",
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Call us for immediate help",
    contact: "+91 9644377621",
    action: "Call Now",
    color: "bg-green-500",
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Chat with our support team",
    contact: "Available 9 AM - 6 PM",
    action: "Start Chat",
    color: "bg-purple-500",
  },
]

const guides = [
  {
    title: "Quick Start Guide",
    description: "Learn the basics of using the app",
    steps: ["Create account", "Add your shop", "Record first transaction", "Invite customers"],
    color: "bg-gradient-to-r from-blue-500 to-blue-600",
  },
  {
    title: "Managing Customers",
    description: "How to track and manage customer borrowings",
    steps: ["View customer list", "Check outstanding balances", "Send reminders", "Mark payments"],
    color: "bg-gradient-to-r from-green-500 to-green-600",
  },
  {
    title: "Lending Money",
    description: "Personal lending between individuals",
    steps: ["Go to Lending tab", "Enter borrower details", "Send confirmation", "Track repayments"],
    color: "bg-gradient-to-r from-purple-500 to-purple-600",
  },
]

export default function HelpPage() {
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id)
  }

  const filteredFaqs = selectedCategory ? faqs.filter((category) => category.category === selectedCategory) : faqs

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Help & Support</h1>
              <p className="text-sm text-gray-600">Get help and find answers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Quick Guides */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Guides</h2>
          <div className="space-y-3">
            {guides.map((guide, index) => (
              <Card key={index} className="overflow-hidden">
                <div className={`h-2 ${guide.color}`} />
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{guide.title}</CardTitle>
                  <CardDescription>{guide.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {guide.steps.map((step, stepIndex) => (
                      <Badge key={stepIndex} variant="secondary" className="text-xs">
                        {stepIndex + 1}. {step}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Support */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Support</h2>
          <div className="space-y-3">
            {contactOptions.map((option, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${option.color} text-white`}>
                      <option.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{option.title}</h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{option.contact}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      {option.action}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Categories */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {faqs.map((category) => (
              <Button
                key={category.category}
                variant={selectedCategory === category.category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.category)}
                className="flex items-center gap-2"
              >
                <category.icon className="h-4 w-4" />
                {category.category}
              </Button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFaqs.map((category) => (
              <div key={category.category}>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <category.icon className="h-5 w-5 text-gray-600" />
                  {category.category}
                </h3>
                <div className="space-y-2">
                  {category.questions.map((faq, index) => {
                    const faqId = `${category.category}-${index}`
                    const isExpanded = expandedFaq === faqId

                    return (
                      <Card key={faqId} className="overflow-hidden">
                        <CardContent className="p-0">
                          <button
                            onClick={() => toggleFaq(faqId)}
                            className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                          {isExpanded && (
                            <div className="px-4 pb-4">
                              <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* App Info */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                App Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Version</span>
                <span className="font-medium">2.5.1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-medium">June 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Support Hours</span>
                <span className="font-medium">9 AM - 6 PM</span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Still Need Help */}
        <section>
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">Still Need Help?</h3>
              <p className="text-blue-100 mb-4">
                Can't find what you're looking for? Our support team is here to help!
              </p>
              <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
