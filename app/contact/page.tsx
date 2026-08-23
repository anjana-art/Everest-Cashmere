// app/contact/page.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-rose-50/30 to-red-50/50">
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 bg-amber-100 text-amber-800 text-xs uppercase tracking-widest rounded-full mb-4">
            ✨ We're Just Getting Started
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-red-900 mb-3">
            Let's Connect
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            As a startup, every conversation matters to us. Whether you have a question, 
            a suggestion, or just want to say hello — we'd love to hear from you.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-amber-100/50 overflow-hidden">
          
          {/* Personal Message */}
          <div className="p-6 sm:p-8 md:p-10 border-b border-amber-100/50 bg-gradient-to-r from-amber-50/80 to-rose-50/80">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-2xl flex-shrink-0">
                👋
              </div>
              <div>
                <p className="text-stone-700 text-base sm:text-lg leading-relaxed">
                  <span className="font-medium text-red-900">Hi, I'm Anjana</span> — founder of Himkash. 
                  We're a small team with a big heart, and we're here to help. 
                  Whether you need assistance with an order, have a suggestion, 
                  or just want to learn more about our journey — don't hesitate to reach out.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Options */}
          <div className="p-6 sm:p-8 md:p-10 space-y-8">
            
            {/* WhatsApp - Primary CTA */}
            <div className="bg-green-50/50 rounded-2xl p-6 border border-green-100/50 hover:border-green-200 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl flex-shrink-0">
                    💬
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800 text-lg">WhatsApp</h3>
                    <p className="text-gray-600 text-sm">
                      Fastest way to reach us. We try to respond within a few hours.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Available Monday–Friday, 9 AM – 6 PM (Portugal time)
                    </p>
                  </div>
                </div>
                <a
                  href="https://wa.me/351920817350"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Message on WhatsApp
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100/50 hover:border-amber-200 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-2xl flex-shrink-0">
                    ✉️
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-800 text-lg">Email</h3>
                    <p className="text-gray-600 text-sm">
                      For detailed inquiries, orders, or anything else.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      We respond within 3–5 business days
                    </p>
                  </div>
                </div>
                <a
                  href="mailto:himkash.info@gmail.com"
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Email
                </a>
              </div>
            </div>

            {/* Phone (Optional) */}
            <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                    📞
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 text-lg">Phone</h3>
                    <p className="text-gray-600 text-sm">
                      For urgent matters, feel free to call.
                    </p>
                  </div>
                </div>
                <a
                  href="tel:+351920817350"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +351 920 817 350
                </a>
              </div>
            </div>
          </div>

          {/* Footer Message */}
          <div className="p-6 sm:p-8 md:p-10 bg-gradient-to-br from-amber-50/50 to-rose-50/50 border-t border-amber-100/50">
            <div className="text-center max-w-2xl mx-auto">
              <div className="text-3xl mb-3">🌱</div>
              <h3 className="font-serif font-semibold text-red-900 text-lg mb-2">
                We're Building Something Beautiful
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                As a startup, every piece of feedback, suggestion, and conversation 
                helps us grow. Thank you for being part of our journey — we can't 
                wait to hear from you.
              </p>
              <div className="flex items-center justify-center gap-3 mt-4 text-xs text-gray-400">
                <span>❤️ Made with love in Portugal</span>
                <span>•</span>
                <span>🧶 Handcrafted in Nepal</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}