// app/returns/page.tsx

export default function ReturnsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-red-900">Return & Refund Policy</h1>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8 border border-amber-200 space-y-6">
          
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
            <p className="text-amber-800 font-medium">
              ⚖️ Summary of Your Rights: As a consumer in Portugal, you have the right to withdraw from this purchase 
              within 14 days without giving any reason.
            </p>
          </div>

          <section>
            <h2 className="text-xl font-semibold text-red-900 mb-3">1. Right of Withdrawal (Direito de Arrependimento)</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Under Portuguese consumer law (Lei n.º 24/2014, transposing EU Directive 2011/83/EU), you have the right to 
              withdraw from this contract within <strong>14 calendar days without giving any reason</strong>.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>The withdrawal period expires 14 days after the day on which you acquire, or a third party other than 
              the carrier and indicated by you acquires, physical possession of the goods.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-red-900 mb-3">2. How to Exercise Your Right of Withdrawal</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              To exercise your right of withdrawal, you must inform us of your decision by an unequivocal statement. 
              You can do this by:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Sending an email to: <strong>himkash.info@gmail.com</strong></li>
              <li>Using the model withdrawal form below</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              We will respond to confirm receipt of your withdrawal request within 2 business days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-red-900 mb-3">3. Model Withdrawal Form</h2>
            <div className="bg-gray-50 p-4 rounded border border-gray-200 font-mono text-sm">
              <p className="font-bold">To: [Your Name], himkash.info@gmail.com, +351 920 817 350</p>
              <p className="mt-2">I hereby give notice that I withdraw from my contract of sale of the following goods:</p>
              <p className="mt-2">- Ordered on: _______________</p>
              <p className="mt-2">- Received on: _______________</p>
              <p className="mt-2">- Order number: _______________</p>
              <p className="mt-2">- Name of consumer: _______________</p>
              <p className="mt-2">- Address of consumer: _______________</p>
              <p className="mt-2">- Signature (only if this form is notified on paper): _______________</p>
              <p className="mt-2">- Date: _______________</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-red-900 mb-3">4. Return Conditions</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              To be eligible for a full refund, the returned item must meet the following conditions:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Be returned within 14 days of notifying us of your withdrawal</li>
              <li>Be in <strong>original condition</strong> (unworn, unwashed, unused)</li>
              <li>Have all <strong>original tags attached</strong></li>
              <li>Be in <strong>original packaging</strong></li>
              <li>Include all accessories and documents</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              <strong>We cannot accept returns for:</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Items that show signs of wear, washing, or alteration</li>
              <li>Items without original tags</li>
              <li>Underwear, swimwear, or earrings (for hygiene reasons)</li>
              <li>Items damaged by the customer</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-red-900 mb-3">5. Return Shipping</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>You are responsible for the direct costs of returning the goods</strong>. We recommend using a 
              tracked shipping service, as we cannot be responsible for items lost in transit.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Return address: [Your Return Address - to be provided]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-red-900 mb-3">6. Refunds</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              If you withdraw from this contract, we will reimburse all payments received from you, including delivery 
              costs (except for any supplementary costs arising from your choice of a delivery method other than the 
              cheapest standard delivery method we offer).
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">
              We will make the refund using the same payment method you used for the original transaction, unless you 
              expressly agree otherwise. You will not incur any fees as a result of the refund.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>We may withhold the refund until we have received the goods back, or until you have supplied 
              evidence of having sent back the goods, whichever is earliest.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-red-900 mb-3">7. Defective or Incorrect Items</h2>
            <p className="text-gray-700 leading-relaxed">
              If you receive a defective or incorrect item, please contact us immediately at himkash.info@gmail.com. 
              We will cover the return shipping costs and provide a replacement or full refund as quickly as possible.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-red-900 mb-3">8. Timeline Summary</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-amber-50">
                    <th className="border border-amber-200 p-3 text-left text-red-900">Action</th>
                    <th className="border border-amber-200 p-3 text-left text-red-900">Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-amber-200 p-3">Notify us of withdrawal</td>
                    <td className="border border-amber-200 p-3">Within 14 days of receiving the item</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-amber-200 p-3">Return the item to us</td>
                    <td className="border border-amber-200 p-3">Within 14 days of notifying us</td>
                  </tr>
                  <tr>
                    <td className="border border-amber-200 p-3">We issue your refund</td>
                    <td className="border border-amber-200 p-3">Within 14 days of receiving the return or proof of return</td>
                  </tr>
                </tbody>
              </table>
            </div>
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