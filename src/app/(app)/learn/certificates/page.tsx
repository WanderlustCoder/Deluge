'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Award, Download, Check } from 'lucide-react';
import { formatDate } from '@/lib/i18n/formatting';
import { Spinner } from "@/components/ui/spinner";

interface Certificate {
  id: string;
  topic: string;
  issuedAt: string;
  certificateUrl: string | null;
}

interface Topic {
  id: string;
  title: string;
  description: string;
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [available, setAvailable] = useState<Topic[]>([]);
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const res = await fetch('/api/learn/certificates');
      const data = await res.json();
      setCertificates(data.certificates || []);
      setAvailable(data.available || []);
      setAllTopics(data.topics || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestCertificate = async (topicId: string) => {
    setRequesting(topicId);
    try {
      const res = await fetch('/api/learn/certificates/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicId }),
      });

      if (res.ok) {
        fetchCertificates();
      }
    } catch (error) {
      console.error('Error requesting certificate:', error);
    } finally {
      setRequesting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/20 flex items-center justify-center dark:bg-dark-bg">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-ocean to-teal text-white py-12">
        <div className="container mx-auto px-4">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Learning Hub
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <Award className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Certificates</h1>
          </div>
          <p className="text-white/80 max-w-xl">
            Optional recognition for your learning journey.
            Certificates are available upon request - no tests, no prerequisites.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Your Certificates */}
          {certificates.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Your Certificates</h2>
              <div className="space-y-4">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-white dark:bg-dark-border/50 border border-gray-200 rounded-xl p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gold/10 rounded-lg">
                          <Award className="w-6 h-6 text-gold" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{cert.topic}</h3>
                          <p className="text-sm text-storm/60 mt-1">
                            Issued {formatDate(cert.issuedAt)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          // Download PDF logic would go here
                          alert('PDF download coming soon');
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Certificates */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Available Certificates</h2>

            {available.length === 0 ? (
              <div className="text-center py-8 bg-white dark:bg-dark-border/50 border border-gray-200 rounded-xl">
                <Check className="w-12 h-12 text-teal mx-auto mb-4" />
                <p className="text-storm/60">You&apos;ve collected all available certificates!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {available.map((topic) => (
                  <div
                    key={topic.id}
                    className="bg-white dark:bg-dark-border/50 border border-gray-200 rounded-xl p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{topic.title}</h3>
                        <p className="text-sm text-storm/60 mt-1">
                          {topic.description}
                        </p>
                      </div>
                      <button
                        onClick={() => requestCertificate(topic.id)}
                        disabled={requesting === topic.id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90 disabled:opacity-50 text-sm"
                      >
                        {requesting === topic.id ? (
                          'Requesting...'
                        ) : (
                          <>
                            <Award className="w-4 h-4" />
                            Request Certificate
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Philosophy Note */}
          <div className="mt-8 p-6 bg-sky/10 rounded-xl">
            <h3 className="font-semibold mb-2">About Certificates</h3>
            <ul className="space-y-2 text-sm text-storm/70">
              <li>• Certificates are optional and available upon request</li>
              <li>• There are no tests or prerequisites to earn a certificate</li>
              <li>• Certificates don&apos;t expire - learning has no deadline</li>
              <li>• All certificates are equally valid - there are no &quot;levels&quot;</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
