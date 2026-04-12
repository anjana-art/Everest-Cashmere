// app/terms/page.tsx

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-red-900">Terms & Conditions</h1>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8 border border-amber-200 space-y-6">
          
          <section>
            <h2 className="text-xl font-semibold text-red-900 mb-3">1. General Information</h2>
            <p className="text-gray-700 leading-relaxed">
              This website is operated by [Your Name], acting as a sole proprietor ("Empresário em Nome Individual"), 
              with NIF: [Your NIF]. Throughout the site, the terms "we", "us" and "our" refer to this online store. 
              By using this site, you agree to be bound by the following terms and conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-red-900 mb-3">2. Products & Pricing</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              All product descriptions, images, and prices displayed on this website are for informational purposes only. 
              We strive to display accurate colors and details, but please note that your screen settings may affect how 
              products appear.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Prices are shown in Euros (€) and include VAT (IVA) at the applicable Portuguese rate. We reserve the right 
              to modify prices at any time without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-red-900 mb-3">3. Orders & Contract Formation</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              When you place an order, you will receive an order confirmation email acknowledging the details of your purchase. 
              This confirmation does not constitute acceptance of your order. A binding contract is formed only when we send 
              a shipping confirmation email.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to refuse or cancel any order for reasons including but not limited to: product availability, 
              errors in pricing or product description, or suspected fraudulent activity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-red-900 mb-3">4. Payment</h2>
            <p className="text-gray-700 leading-relaxed">
              We accept the following payment methods: [list your payment methods - e.g., Credit Card, MB Way, PayPal]. 
              All payments are processed through secure payment gateways. We do not store your payment information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-red-900 mb-3">5. Shipping & Delivery</h2>
            <p className="text-gray-700 leading-relaxed">
              We ship to addresses within Portugal. Delivery times are estimates and not guaranteed. Shipping costs will be 
              displayed at checkout before you complete your purchase. Risk of loss and title for products pass to you upon 
              delivery to the shipping carrier.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-red-900 mb-3">6. Right of Withdrawal (Direito de Arrependimento)</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              As a consumer in Portugal, you have the right to withdraw from this contract within 14 days without giving any reason.
            </p>
            <p className="text-gray-700 leading-relaxed mb-2">
              <strong>The withdrawal period expires 14 days after the day on which you acquire, or a third party other than 
              the carrier and indicated by you acquires, physical possession of the goods.</strong>
            </p>
            <p className="text-gray-700 leading-relaxed">
              To exercise the right of withdrawal, you must inform us of your decision by an unequivocal statement (e.g., email 
              to himkash.info@gmail.com). Please refer to our full Return Policy for detailed instructions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-red-900 mb-3">7. Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, or consequential 
              damages arising from the use of our products or website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-red-900 mb-3">8. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These terms are governed by and construed in accordance with the laws of Portugal. Any disputes arising from 
              these terms or your use of the site shall be submitted to the exclusive jurisdiction of the courts of Portugal.
            </p>
          </section>

          <section className="pt-4 border-t border-amber-200">
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </section>
        </div>
      </main>

     
    </div>
  );
}