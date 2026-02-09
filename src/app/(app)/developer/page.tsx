import { Metadata } from 'next';
import Link from 'next/link';
import { Key, Webhook, Code, BookOpen, ArrowRight, Zap, Shield, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Developer Portal | Deluge',
  description: 'Build integrations with the Deluge API',
};

const FEATURES = [
  {
    icon: Key,
    title: 'API Keys',
    description: 'Create and manage API keys to authenticate your requests',
    href: '/developer/keys',
    color: 'bg-ocean/10 text-ocean',
  },
  {
    icon: Webhook,
    title: 'Webhooks',
    description: 'Receive real-time notifications when events occur',
    href: '/developer/webhooks',
    color: 'bg-teal/10 text-teal',
  },
  {
    icon: Code,
    title: 'Embed Widgets',
    description: 'Add donate buttons and project cards to your site',
    href: '/developer/embeds',
    color: 'bg-gold/10 text-gold',
  },
  {
    icon: BookOpen,
    title: 'API Documentation',
    description: 'Explore our REST API with interactive examples',
    href: '/developer/docs',
    color: 'bg-sky/10 text-sky',
  },
];

const BENEFITS = [
  {
    icon: Zap,
    title: 'Real-time Data',
    description: 'Access live project data, funding status, and community metrics',
  },
  {
    icon: Shield,
    title: 'Secure by Default',
    description: 'HMAC-signed webhooks and scoped API keys for security',
  },
  {
    icon: Globe,
    title: 'Easy Integration',
    description: 'Simple REST API with comprehensive documentation',
  },
];

export default function DeveloperPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-ocean via-ocean/90 to-teal text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">Developer Portal</h1>
            <p className="text-xl text-white/80 mb-8">
              Build powerful integrations with the Deluge API. Access project data,
              receive real-time webhooks, and embed giving widgets on your site.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/developer/keys"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-ocean rounded-lg font-medium hover:bg-foam transition-colors"
              >
                Get API Key
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/developer/docs"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
              >
                View Documentation
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {FEATURES.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="group block p-6 bg-white dark:bg-dark-border/50 border border-gray-200 rounded-xl hover:shadow-lg transition-all"
            >
              <div className={`inline-flex p-3 rounded-lg ${feature.color} mb-4`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold mb-2 group-hover:text-ocean transition-colors">
                {feature.title}
              </h2>
              <p className="text-storm/60">{feature.description}</p>
              <div className="mt-4 flex items-center text-ocean font-medium">
                Get started
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Benefits */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Why Build with Deluge?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {BENEFITS.map((benefit) => (
              <div key={benefit.title} className="text-center">
                <div className="inline-flex p-3 bg-ocean/10 rounded-xl mb-4">
                  <benefit.icon className="w-6 h-6 text-ocean" />
                </div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-storm/60 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Start */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Quick Start</h2>
          <div className="bg-gray-50 rounded-xl p-6">
            <p className="text-sm text-storm/60 mb-4">
              Make your first API request:
            </p>
            <pre className="bg-storm text-foam p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://deluge.fund/api/v1/projects`}</code>
            </pre>
            <div className="mt-4 flex gap-4">
              <Link
                href="/developer/keys"
                className="text-ocean font-medium hover:underline"
              >
                Create an API key →
              </Link>
              <Link
                href="/developer/docs"
                className="text-storm/60 hover:text-storm"
              >
                Read the docs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
