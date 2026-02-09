import Link from 'next/link';

export default function AccessibilityStatementPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-ocean dark:text-sky mb-8">
          Accessibility Statement
        </h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl text-storm-light dark:text-dark-text-secondary mb-8">
            Deluge is committed to ensuring digital accessibility for people of all abilities. We
            are continually improving the user experience for everyone and applying the relevant
            accessibility standards.
          </p>

          <h2 className="text-2xl font-bold text-storm dark:text-dark-text mt-8 mb-4">
            Our Commitment
          </h2>
          <p className="text-storm-light dark:text-dark-text-secondary mb-4">
            We strive to meet{' '}
            <strong>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong> standards.
            These guidelines explain how to make web content more accessible for people with
            disabilities.
          </p>

          <h2 className="text-2xl font-bold text-storm dark:text-dark-text mt-8 mb-4">
            Accessibility Features
          </h2>
          <ul className="text-storm-light dark:text-dark-text-secondary space-y-2 mb-6">
            <li>
              <strong>Keyboard Navigation:</strong> All interactive elements can be accessed using
              a keyboard
            </li>
            <li>
              <strong>Screen Reader Support:</strong> Content is structured with proper headings,
              landmarks, and ARIA labels
            </li>
            <li>
              <strong>Color Contrast:</strong> Text meets minimum contrast ratios for readability
            </li>
            <li>
              <strong>Text Scaling:</strong> Content can be zoomed to 200% without loss of
              functionality
            </li>
            <li>
              <strong>Motion Preferences:</strong> Animations respect system motion preferences
            </li>
            <li>
              <strong>Focus Indicators:</strong> Clear visual focus indicators for keyboard users
            </li>
            <li>
              <strong>Alt Text:</strong> Images include descriptive alternative text
            </li>
            <li>
              <strong>Form Labels:</strong> All form inputs have associated labels
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-storm dark:text-dark-text mt-8 mb-4">
            Personalization Options
          </h2>
          <p className="text-storm-light dark:text-dark-text-secondary mb-4">
            Registered users can customize their experience through our{' '}
            <Link href="/account/accessibility" className="text-ocean hover:underline">
              Accessibility Settings
            </Link>
            :
          </p>
          <ul className="text-storm-light dark:text-dark-text-secondary space-y-2 mb-6">
            <li>Text size adjustment (small, medium, large, extra large)</li>
            <li>Font style options including dyslexia-friendly fonts</li>
            <li>Line spacing control</li>
            <li>High contrast mode</li>
            <li>Reduced motion mode</li>
            <li>Screen reader optimizations</li>
          </ul>

          <h2 className="text-2xl font-bold text-storm dark:text-dark-text mt-8 mb-4">
            Known Limitations
          </h2>
          <p className="text-storm-light dark:text-dark-text-secondary mb-4">
            We are working to address the following accessibility issues:
          </p>
          <ul className="text-storm-light dark:text-dark-text-secondary space-y-2 mb-6">
            <li>Some older PDF documents may not be fully accessible</li>
            <li>
              Third-party content (such as embedded videos) may have varying accessibility
              support
            </li>
            <li>Some complex data visualizations may require alternative text descriptions</li>
          </ul>

          <h2 className="text-2xl font-bold text-storm dark:text-dark-text mt-8 mb-4">
            Feedback and Support
          </h2>
          <p className="text-storm-light dark:text-dark-text-secondary mb-4">
            We welcome your feedback on the accessibility of Deluge. Please let us know if you
            encounter accessibility barriers:
          </p>
          <ul className="text-storm-light dark:text-dark-text-secondary space-y-2 mb-6">
            <li>
              <strong>Email:</strong>{' '}
              <a href="mailto:accessibility@deluge.fund" className="text-ocean hover:underline">
                accessibility@deluge.fund
              </a>
            </li>
            <li>
              <strong>Response Time:</strong> We aim to respond within 5 business days
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-storm dark:text-dark-text mt-8 mb-4">
            Technical Specifications
          </h2>
          <p className="text-storm-light dark:text-dark-text-secondary mb-4">
            Deluge is designed to be compatible with the following assistive technologies:
          </p>
          <ul className="text-storm-light dark:text-dark-text-secondary space-y-2 mb-6">
            <li>Screen readers (NVDA, JAWS, VoiceOver, TalkBack)</li>
            <li>Screen magnification software</li>
            <li>Speech recognition software</li>
            <li>Keyboard-only navigation</li>
          </ul>

          <h2 className="text-2xl font-bold text-storm dark:text-dark-text mt-8 mb-4">
            Assessment Methods
          </h2>
          <p className="text-storm-light dark:text-dark-text-secondary mb-4">
            Deluge assesses accessibility through:
          </p>
          <ul className="text-storm-light dark:text-dark-text-secondary space-y-2 mb-6">
            <li>Automated accessibility testing tools (axe-core)</li>
            <li>Manual testing with keyboard and screen readers</li>
            <li>User feedback and testing sessions</li>
            <li>Regular accessibility audits</li>
          </ul>

          <div className="bg-gray-50 rounded-lg p-6 mt-8">
            <p className="text-sm text-storm-light dark:text-dark-text-secondary">
              <strong>Last Updated:</strong> February 2026
            </p>
            <p className="text-sm text-storm-light dark:text-dark-text-secondary">
              This statement was created with reference to W3C&apos;s Accessibility Statement
              Generator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
