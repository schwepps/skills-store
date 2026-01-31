import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Clock, Target, MessageCircle, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JsonLd } from '@/components/shared/json-ld';
import { SITE_URL } from '@/lib/config/urls';
import { TelegramQRCode } from '@/components/custom/telegram-qr';
import { SuggestSkillLink } from '@/components/custom/suggest-skill-link';
import type { ServiceSchema } from '@/lib/schema';

const TELEGRAM_URL = 'https://t.me/fschuers';
const TELEGRAM_HANDLE = '@fschuers';

export const metadata: Metadata = {
  title: 'Custom Skill Development',
  description:
    'Get a tailored Claude AI skill built for your exact workflow. Guaranteed delivery, direct support, and unlimited revisions.',
  openGraph: {
    title: 'Custom Skill Development - Skills Store',
    description:
      'Get a tailored Claude AI skill built for your exact workflow. Guaranteed delivery and direct support.',
    url: `${SITE_URL}/custom`,
    type: 'website',
    siteName: 'Skills Store',
  },
  alternates: {
    canonical: `${SITE_URL}/custom`,
  },
};

// Service schema for GEO
const serviceSchema: ServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Custom Claude Skill Development',
  description:
    'Professional development service for creating tailored Claude AI skills. Guaranteed delivery, direct support, and unlimited revisions.',
  provider: {
    '@type': 'Organization',
    name: 'Skills Store',
    url: SITE_URL,
  },
  serviceType: 'Software Development',
  areaServed: 'Worldwide',
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceUrl: TELEGRAM_URL,
    serviceType: 'Telegram',
  },
};

const benefits = [
  {
    icon: Clock,
    title: 'Guaranteed Delivery',
    description: 'Your skill delivered within a few days. No waiting in a community backlog.',
  },
  {
    icon: Target,
    title: 'Tailored to Your Workflow',
    description: 'Built specifically for your use case, not a generic one-size-fits-all solution.',
  },
  {
    icon: MessageCircle,
    title: 'Direct Support & Iterations',
    description: 'Work directly with me. Unlimited revisions until you are satisfied.',
  },
];

const steps = [
  {
    number: 1,
    title: 'Describe Your Use Case',
    description: 'Tell me what you want Claude to do. The more detail, the better.',
  },
  {
    number: 2,
    title: 'We Scope & Quote',
    description: 'I will review your requirements and provide a timeline and quote.',
  },
  {
    number: 3,
    title: 'You Get a Working Skill',
    description: 'Receive your custom skill, ready to install and use immediately.',
  },
];

const faqs = [
  {
    question: "What's included in custom development?",
    answer:
      'Everything you need: skill design, development, testing, documentation, and installation support. Plus unlimited revisions until you are happy.',
  },
  {
    question: 'How long does it take?',
    answer:
      'Most skills are delivered within a few days. Complex skills may take longer - I will give you an accurate timeline after reviewing your requirements.',
  },
  {
    question: 'Can I request revisions?',
    answer:
      'Yes! Unlimited revisions are included. I want you to be completely satisfied with the final result.',
  },
  {
    question: "What if I'm not satisfied?",
    answer: "We'll work together until you are. Your satisfaction is my priority.",
  },
];

export default function CustomPage() {
  return (
    <div className="container-narrow py-8 sm:py-12">
      {/* JSON-LD for GEO */}
      <JsonLd schema={serviceSchema} />

      {/* Back link */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to store
        </Link>
      </Button>

      {/* Hero Section */}
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Custom Skill Development
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg sm:text-xl">
          Get a tailored Claude AI skill built for your exact workflow.
          <br />
          Guaranteed delivery, direct support, and unlimited revisions.
        </p>
      </div>

      {/* Benefits Section */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-2xl font-semibold">Why Custom Development?</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="text-center">
              <CardHeader>
                <benefit.icon className="text-primary mx-auto mb-2 h-10 w-10" />
                <CardTitle className="text-lg">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-2xl font-semibold">How It Works</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="bg-primary text-primary-foreground mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold">
                {step.number}
              </div>
              <h3 className="mb-2 font-semibold">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mb-16">
        <Card className="bg-muted/50">
          <CardContent className="py-8 text-center">
            <h2 className="mb-4 text-2xl font-semibold">Ready to Get Started?</h2>
            <p className="text-muted-foreground mx-auto mb-6 max-w-lg">
              Contact me on Telegram to discuss your skill idea. I typically respond within a few
              hours.
            </p>
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
              {/* Telegram Button */}
              <Button size="lg" asChild>
                <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer">
                  <Send className="mr-2 h-5 w-5" />
                  Contact on Telegram
                </a>
              </Button>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-2">
                <TelegramQRCode url={TELEGRAM_URL} />
                <p className="text-muted-foreground text-xs">Scan to chat</p>
                <p className="text-muted-foreground text-sm font-medium">{TELEGRAM_HANDLE}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FAQ Section */}
      <section className="mb-8">
        <h2 className="mb-8 text-center text-2xl font-semibold">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.question}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-start gap-2 text-base">
                  <CheckCircle className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                  {faq.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground ml-7 text-sm">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Free Alternative Note */}
      <div className="text-muted-foreground text-center text-sm">
        <p>
          Not ready for custom development?{' '}
          <Link href="/" className="text-primary hover:underline">
            Browse free skills
          </Link>{' '}
          or <SuggestSkillLink /> for the community backlog.
        </p>
      </div>
    </div>
  );
}
