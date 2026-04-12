export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center text-red-900">Cookie Policy</h1>
      
      <div className="bg-white/80 rounded-lg shadow-lg p-8 border border-amber-200 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-red-900 mb-3">1. What Are Cookies?</h2>
          <p className="text-gray-700">Cookies are small text files placed on your device to help websites function properly and provide information to website owners.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-red-900 mb-3">2. Cookies We Use</h2>
          
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-amber-700">Strictly Necessary Cookies</h3>
              <p className="text-gray-600 text-sm">Essential for website functions like shopping cart and checkout. Consent not required.</p>
            </div>
            <div>
              <h3 className="font-semibold text-amber-700">Analytical Cookies</h3>
              <p className="text-gray-600 text-sm">Help us understand how visitors use our site. Consent required.</p>
            </div>
            <div>
              <h3 className="font-semibold text-amber-700">Functional Cookies</h3>
              <p className="text-gray-600 text-sm">Remember your preferences. Consent required.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-red-900 mb-3">3. Managing Cookies</h2>
          <p className="text-gray-700">You can manage cookies through your browser settings. You can also use our cookie banner to accept or decline non-essential cookies.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-red-900 mb-3">4. Contact</h2>
          <p className="text-gray-700">Questions? Email us at <strong className="text-amber-700">himkash.info@gmail.com</strong></p>
        </section>

        <section className="pt-4 border-t border-amber-200">
          <p className="text-sm text-gray-500">Last updated: April 12, 2026</p>
        </section>
      </div>
    </div>
  );
}