export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-8">
          Terms of Service
        </h1>

        <div className="prose prose-lg max-w-none text-[var(--foreground)]">
          <p className="text-gray-600 mb-6">
            Last updated: February 2, 2026
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using the KDK Ventilation website and services, you accept and agree
              to be bound by the terms and provisions of this agreement. If you do not agree to
              abide by these terms, please do not use this website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Use License</h2>
            <p className="text-gray-700 mb-4">
              Permission is granted to temporarily access the materials on KDK Ventilation&apos;s website
              for personal, non-commercial transitory viewing only. This is the grant of a license,
              not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to decompile or reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or mirror the materials on any other server</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Product Information</h2>
            <p className="text-gray-700 mb-4">
              We strive to provide accurate product information, including specifications, features,
              and pricing. However, we do not warrant that product descriptions or other content on
              this site is accurate, complete, reliable, current, or error-free. Product specifications
              are subject to change without notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Disclaimer</h2>
            <p className="text-gray-700 mb-4">
              The materials on KDK Ventilation&apos;s website are provided on an &apos;as is&apos; basis. KDK Ventilation
              makes no warranties, expressed or implied, and hereby disclaims and negates all other
              warranties including, without limitation, implied warranties or conditions of merchantability,
              fitness for a particular purpose, or non-infringement of intellectual property.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Limitations</h2>
            <p className="text-gray-700 mb-4">
              In no event shall KDK Ventilation or its suppliers be liable for any damages (including,
              without limitation, damages for loss of data or profit, or due to business interruption)
              arising out of the use or inability to use the materials on KDK Ventilation&apos;s website,
              even if KDK Ventilation has been notified of the possibility of such damage.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              All content on this website, including but not limited to text, graphics, logos, images,
              audio clips, digital downloads, and software, is the property of KDK Ventilation or its
              content suppliers and is protected by international copyright laws. The compilation of
              all content on this site is the exclusive property of KDK Ventilation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Links to Third-Party Sites</h2>
            <p className="text-gray-700 mb-4">
              Our website may contain links to third-party websites that are not owned or controlled
              by KDK Ventilation. We have no control over, and assume no responsibility for, the content,
              privacy policies, or practices of any third-party websites. You acknowledge and agree that
              KDK Ventilation shall not be responsible or liable for any damage or loss caused by the use
              of any such content or services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Governing Law</h2>
            <p className="text-gray-700 mb-4">
              These terms and conditions are governed by and construed in accordance with the laws of
              Singapore, and you irrevocably submit to the exclusive jurisdiction of the courts in that
              location.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              KDK Ventilation reserves the right to revise these terms of service at any time without
              notice. By using this website, you are agreeing to be bound by the then-current version
              of these terms of service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>KDK Ventilation</strong><br />
                Email: legal@kdkventilation.com<br />
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
