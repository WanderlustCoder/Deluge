import { Metadata } from 'next';
import { BookOpen, Code, Key, Webhook, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'API Documentation | Deluge',
  description: 'Deluge API reference and documentation',
};

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/v1/projects',
    description: 'List all active projects',
    params: [
      { name: 'status', type: 'string', description: 'Filter by status (active, funded, completed)' },
      { name: 'category', type: 'string', description: 'Filter by category' },
      { name: 'limit', type: 'number', description: 'Number of results (max 100, default 20)' },
      { name: 'offset', type: 'number', description: 'Pagination offset' },
    ],
  },
  {
    method: 'GET',
    path: '/api/v1/projects/:id',
    description: 'Get project details',
    params: [],
  },
  {
    method: 'GET',
    path: '/api/v1/communities',
    description: 'List all communities',
    params: [
      { name: 'type', type: 'string', description: 'Filter by type' },
      { name: 'limit', type: 'number', description: 'Number of results (max 100, default 20)' },
      { name: 'offset', type: 'number', description: 'Pagination offset' },
    ],
  },
  {
    method: 'GET',
    path: '/api/v1/stats',
    description: 'Get platform statistics',
    params: [],
  },
];

const WEBHOOK_EVENTS = [
  { event: 'project.created', description: 'When a new project is created' },
  { event: 'project.funded', description: 'When a project reaches its funding goal' },
  { event: 'project.completed', description: 'When a project is marked complete' },
  { event: 'loan.created', description: 'When a new loan application is submitted' },
  { event: 'loan.funded', description: 'When a loan is fully funded' },
  { event: 'loan.repaid', description: 'When a loan payment is made' },
  { event: 'contribution.received', description: 'When a contribution is made' },
  { event: 'community.milestone', description: 'When a community reaches a milestone' },
];

export default function DocsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            API Documentation
          </h1>
          <p className="text-storm/60 mt-1">
            Reference documentation for the Deluge API
          </p>
        </div>

        {/* Authentication */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Key className="w-5 h-5" />
            Authentication
          </h2>
          <div className="bg-foam dark:bg-storm/20 border border-storm/10 rounded-xl p-6">
            <p className="mb-4">
              All API requests require authentication via an API key. Include your key
              in the Authorization header:
            </p>
            <pre className="bg-storm text-foam p-4 rounded-lg overflow-x-auto text-sm">
              <code>Authorization: Bearer YOUR_API_KEY</code>
            </pre>
            <p className="mt-4 text-sm text-storm/60">
              API keys can be created in the{' '}
              <a href="/developer/keys" className="text-ocean hover:underline">
                Developer Portal
              </a>
              .
            </p>
          </div>
        </section>

        {/* Rate Limiting */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Rate Limiting</h2>
          <div className="bg-foam dark:bg-storm/20 border border-storm/10 rounded-xl p-6">
            <p className="mb-4">
              API requests are rate limited based on your API key configuration.
              Rate limit information is included in response headers:
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <code className="bg-storm/10 px-2 py-0.5 rounded">X-RateLimit-Limit</code> -
                Maximum requests per hour
              </li>
              <li>
                <code className="bg-storm/10 px-2 py-0.5 rounded">X-RateLimit-Remaining</code> -
                Requests remaining in current window
              </li>
              <li>
                <code className="bg-storm/10 px-2 py-0.5 rounded">X-RateLimit-Reset</code> -
                Unix timestamp when the window resets
              </li>
            </ul>
          </div>
        </section>

        {/* Endpoints */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Code className="w-5 h-5" />
            Endpoints
          </h2>
          <div className="space-y-4">
            {ENDPOINTS.map((endpoint) => (
              <div
                key={endpoint.path}
                className="bg-foam dark:bg-storm/20 border border-storm/10 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-0.5 text-xs font-bold bg-teal/10 text-teal rounded">
                    {endpoint.method}
                  </span>
                  <code className="font-mono">{endpoint.path}</code>
                </div>
                <p className="text-storm/60 mb-4">{endpoint.description}</p>

                {endpoint.params.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Parameters</h4>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left border-b border-storm/10">
                          <th className="pb-2">Name</th>
                          <th className="pb-2">Type</th>
                          <th className="pb-2">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {endpoint.params.map((param) => (
                          <tr key={param.name} className="border-b border-storm/5">
                            <td className="py-2 font-mono text-ocean">{param.name}</td>
                            <td className="py-2 text-storm/60">{param.type}</td>
                            <td className="py-2">{param.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Webhooks */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Webhook className="w-5 h-5" />
            Webhooks
          </h2>
          <div className="bg-foam dark:bg-storm/20 border border-storm/10 rounded-xl p-6">
            <p className="mb-4">
              Webhooks allow you to receive real-time notifications when events occur.
              All webhook payloads are signed with HMAC-SHA256 using your webhook secret.
            </p>

            <h4 className="font-medium mb-2">Verifying Signatures</h4>
            <pre className="bg-storm text-foam p-4 rounded-lg overflow-x-auto text-sm mb-6">
              <code>{`const signature = request.headers['x-webhook-signature'];
const timestamp = request.headers['x-webhook-timestamp'];
const payload = JSON.stringify(request.body);

const expected = 'sha256=' + crypto
  .createHmac('sha256', webhookSecret)
  .update(payload)
  .digest('hex');

const isValid = crypto.timingSafeEqual(
  Buffer.from(signature),
  Buffer.from(expected)
);`}</code>
            </pre>

            <h4 className="font-medium mb-2">Available Events</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-storm/10">
                  <th className="pb-2">Event</th>
                  <th className="pb-2">Description</th>
                </tr>
              </thead>
              <tbody>
                {WEBHOOK_EVENTS.map((event) => (
                  <tr key={event.event} className="border-b border-storm/5">
                    <td className="py-2 font-mono text-ocean">{event.event}</td>
                    <td className="py-2">{event.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Response Format */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Response Format</h2>
          <div className="bg-foam dark:bg-storm/20 border border-storm/10 rounded-xl p-6">
            <p className="mb-4">All API responses follow a consistent format:</p>
            <pre className="bg-storm text-foam p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`{
  "success": true,
  "data": {
    // Response data
  },
  "timestamp": "2024-01-15T12:00:00.000Z"
}`}</code>
            </pre>

            <p className="mt-4 mb-2">Error responses:</p>
            <pre className="bg-storm text-foam p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERR_400"
  },
  "timestamp": "2024-01-15T12:00:00.000Z"
}`}</code>
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
