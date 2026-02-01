export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-4">
          Support Center
        </h1>
        <p className="text-gray-600 mb-12 text-lg">
          We&apos;re here to help. Find answers to common questions or get in touch with our team.
        </p>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Phone Support</h3>
            <p className="text-gray-600 mb-4">Speak directly with our support team</p>
            <p className="text-[var(--primary)] font-medium">+1 (800) 555-0123</p>
            <p className="text-sm text-gray-500 mt-1">Mon-Fri: 9AM - 6PM (SGT)</p>
          </div>

          <div className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Email Support</h3>
            <p className="text-gray-600 mb-4">Get a response within 24 hours</p>
            <p className="text-[var(--primary)] font-medium">support@kdkventilation.com</p>
            <p className="text-sm text-gray-500 mt-1">We reply within 1 business day</p>
          </div>

          <div className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Visit Us</h3>
            <p className="text-gray-600 mb-4">Come to our headquarters</p>
            <p className="text-[var(--primary)] font-medium">123 Industrial Avenue</p>
            <p className="text-sm text-gray-500 mt-1">Singapore 123456</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <div className="bg-white border border-[var(--border)] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                How do I find the right ventilation product for my space?
              </h3>
              <p className="text-gray-600">
                Use our product finder tool on the Products page. You can filter by room type,
                airflow capacity, noise level, and other specifications. Our comparison feature
                also helps you evaluate multiple products side by side.
              </p>
            </div>

            <div className="bg-white border border-[var(--border)] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                Where can I purchase KDK products?
              </h3>
              <p className="text-gray-600">
                Visit our &quot;Where to Buy&quot; page to find authorized retailers and distributors
                near you. You can search by location and filter by store type. We have partners
                across multiple countries in the Asia-Pacific region.
              </p>
            </div>

            <div className="bg-white border border-[var(--border)] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                What warranty do KDK products come with?
              </h3>
              <p className="text-gray-600">
                Most KDK ventilation products come with a standard 2-year manufacturer warranty
                covering defects in materials and workmanship. Extended warranty options may be
                available through authorized dealers. Please refer to your product documentation
                for specific warranty terms.
              </p>
            </div>

            <div className="bg-white border border-[var(--border)] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                How do I install a KDK ventilation fan?
              </h3>
              <p className="text-gray-600">
                Each product comes with detailed installation instructions. For ceiling and wall
                mounted fans, we recommend professional installation to ensure proper electrical
                connections and ventilation duct alignment. You can find installation guides and
                videos on individual product pages.
              </p>
            </div>

            <div className="bg-white border border-[var(--border)] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                How do I maintain my ventilation fan?
              </h3>
              <p className="text-gray-600">
                Regular maintenance includes cleaning the grille and fan blades every 3-6 months,
                checking for dust accumulation, and ensuring the motor runs smoothly. Always
                disconnect power before cleaning. Refer to your product manual for specific
                maintenance instructions.
              </p>
            </div>

            <div className="bg-white border border-[var(--border)] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                What should I do if my fan is making unusual noises?
              </h3>
              <p className="text-gray-600">
                Unusual noises may indicate dust buildup, loose components, or motor issues.
                First, turn off the fan and clean all accessible parts. Check that all screws
                and mounting hardware are secure. If the noise persists, contact our support
                team or an authorized service center for diagnosis.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white border border-[var(--border)] rounded-xl p-8">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">
            Send Us a Message
          </h2>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              >
                <option value="">Select a topic</option>
                <option value="product-inquiry">Product Inquiry</option>
                <option value="technical-support">Technical Support</option>
                <option value="warranty">Warranty Claim</option>
                <option value="installation">Installation Help</option>
                <option value="feedback">Feedback</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none"
                placeholder="Describe your inquiry in detail..."
              />
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-8 py-3 bg-[var(--primary)] text-white font-medium rounded-lg hover:bg-[var(--primary-dark)] transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
