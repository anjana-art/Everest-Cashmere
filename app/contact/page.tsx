// app/contact/page.tsx

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      {/* Main Contact Section */}
      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-red-900">Contact Us</h1>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8 border border-amber-200">
          <div className="space-y-6">
            {/* Email Section */}
            <div className="flex items-start space-x-4">
              <svg className="w-6 h-6 text-red-900 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <h3 className="font-semibold text-red-900">Email</h3>
                <a href="mailto:himkash.info@gmail.com" className="text-amber-600 hover:text-amber-700">
                  himkash.info@gmail.com
                </a>
              </div>
            </div>

            {/* Phone Section */}
            <div className="flex items-start space-x-4">
              <svg className="w-6 h-6 text-red-900 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <h3 className="font-semibold text-red-900">Phone</h3>
                <a href="tel:+351920817350" className="text-amber-600 hover:text-amber-700">
                  +351 920 817 350
                </a>
              </div>
            </div>
          </div>

          {/* Response Time Message */}
          <div className="mt-8 pt-6 border-t border-amber-200">
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
              <h3 className="font-semibold text-red-900 mb-2">📬 Response Time</h3>
              <p className="text-amber-800">
                We will get back to you within <strong>3 to 5 business days</strong>.
              </p>
              <p className="text-amber-600 text-sm mt-2">
                Thank you for your understanding and patience.
              </p>
            </div>
          </div>
        </div>
      </main>

    
    </div>
  );
}