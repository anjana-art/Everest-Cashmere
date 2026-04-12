// app/privacy/page.tsx

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-red-900">Privacy Policy</h1>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8 border border-amber-200 space-y-6">
          
          <section>
            <h2 className="text-xl font-semibold text-red-900 mb-3">1. Data Controller</h2>
            <p className="text-gray-700 leading-relaxed">
              [Your Name] (Sole Proprietor)<br />
              NIF: [Your NIF]<br />
              Email: himkash.info@gmail.com<br />
              Phone: +351 920 817 350
            </p>
            <p className="text-gray-700 leading-relaxed mt-2">
              This privacy policy explains how we collect, use, and protect your personal data when you use our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-red-900 mb-3">2. What Data We Collect</h2>
            <p className="text-gray-700 leading-relaxed mb-2">We may collect the following personal data:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Full name</li>
              <li>Billing and shipping address</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Payment information (processed securely by third-party payment providers)</li>
              <li>Order history</li>
              <li>IP address and browsing data (via cookies)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-red-900 mb-3">3. How We Use Your Data</h2>
            <p className="text-gray-700 leading-relaxed mb-2">We use your personal data for the following purposes:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>To process and fulfill your orders</li>
              <li>To communicate with you about your orders</li>
              <li>To provide customer support</li>
              <li>To comply with legal obligations (e.g., tax and accounting records)</li>
              <li>To improve our website and services</li>
              <li>To send marketing communications (only with your explicit consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-red-900 mb-3">4. Legal Basis for Processing</h2>
            <p className="text-gray-700 leading-relaxed">
              Under the General Data Protection Regulation (GDPR), we process your personal data based on the following legal grounds:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mt-2">
              <li><strong>Contract performance:</strong> To fulfill your orders and provide our services</li>
              <li><strong>Legal obligation:</strong> To comply with tax and accounting laws</li>
              <li><strong>Legitimate interests:</strong> To improve our services and prevent fraud</li>
              <li><strong>Consent:</strong> For marketing communications (you can withdraw at any time)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-red-900 mb-3">5. Data Sharing & Third Parties</h2>
            <p className="text-gray-700 leading-relaxed">
              We do not sell your personal data. We may share your data with trusted third parties who assist us in operating 
              our website and conducting our business, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mt-2">
              <li>Payment processors</li>
              <li>Shipping carriers</li>
              <li>IT service providers</li>
              <li>Legal and accounting advisors (as required by law)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-red-900 mb-3">6. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal data for as long as necessary to fulfill the purposes outlined in this policy, 
              including to comply with legal obligations (e.g., tax records must be kept for 10 years under Portuguese law), 
              resolve disputes, and enforce our agreements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-red-900 mb-3">7. Your Rights (GDPR)</h2>
            <p className="text-gray-700 leading-relaxed mb-2">Under the GDPR, you have the following rights:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li><strong>Right to access</strong> - Request a copy of your personal data</li>
              <li><strong>Right to rectification</strong> - Correct inaccurate or incomplete data</li>
              <li><strong>Right to erasure ("Right to be forgotten")</strong> - Request deletion of your data</li>
              <li><strong>Right to restrict processing</strong> - Limit how we use your data</li>
              <li><strong>Right to data portability</strong> - Receive your data in a structured format</li>
              <li><strong>Right to object</strong> - Object to processing based on legitimate interests</li>
              <li><strong>Right to withdraw consent</strong> - For marketing communications</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              To exercise any of these rights, please contact us at himkash.info@gmail.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-red-900 mb-3">8. Cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              Our website uses cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
              You can control cookie preferences through your browser settings. For more information, please see our Cookie Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-red-900 mb-3">9. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this privacy policy from time to time. Any changes will be posted on this page with an updated 
              "Last updated" date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-red-900 mb-3">10. Complaints</h2>
            <p className="text-gray-700 leading-relaxed">
              If you believe that your data protection rights have been violated, you have the right to lodge a complaint 
              with the Portuguese supervisory authority: <strong>Comissão Nacional de Proteção de Dados (CNPD)</strong> - 
              www.cnpd.pt.
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