export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-8">
          Privacy Policy
        </h1>

        <div className="prose prose-lg max-w-none text-[var(--foreground)]">
          <p className="text-gray-600 mb-6">
            Last updated: February 2, 2026
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              KDK Ventilation (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you visit our website and use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
            <p className="text-gray-700 mb-4">
              We may collect information about you in a variety of ways, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>
                <strong>Personal Data:</strong> Name, email address, phone number, and mailing address
                that you voluntarily provide when contacting us or making inquiries.
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you access and use our website,
                including your IP address, browser type, pages visited, and time spent on pages.
              </li>
              <li>
                <strong>Device Data:</strong> Information about your device, including device type,
                operating system, and unique device identifiers.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">
              We use the information we collect for various purposes, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>To provide, maintain, and improve our services</li>
              <li>To respond to your inquiries and fulfill your requests</li>
              <li>To send you technical notices and support messages</li>
              <li>To analyze usage patterns and optimize user experience</li>
              <li>To detect, prevent, and address technical issues</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Information Sharing</h2>
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties
              without your consent, except in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>To comply with legal obligations</li>
              <li>To protect and defend our rights and property</li>
              <li>To prevent or investigate possible wrongdoing</li>
              <li>With service providers who assist in our operations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational security measures to protect
              your personal information against unauthorized access, alteration, disclosure, or
              destruction. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Cookies</h2>
            <p className="text-gray-700 mb-4">
              Our website may use cookies to enhance your browsing experience. You can choose to
              disable cookies through your browser settings, but this may affect the functionality
              of certain features on our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Your Rights</h2>
            <p className="text-gray-700 mb-4">
              Depending on your location, you may have certain rights regarding your personal data, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>The right to access your personal data</li>
              <li>The right to correct inaccurate data</li>
              <li>The right to request deletion of your data</li>
              <li>The right to object to data processing</li>
              <li>The right to data portability</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>KDK Ventilation</strong><br />
                Email: privacy@kdkventilation.com<br />
                Phone: +1 (800) 555-0123<br />
                Address: 123 Industrial Avenue, Singapore 123456
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
