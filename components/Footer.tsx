// components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-red-900 py-8 mt-auto">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          
          {/* Column 1: Business Info */}
          <div>
            <h3 className="text-amber-200 font-semibold mb-3 text-lg">About Us</h3>
            <p className="text-amber-200/80 text-sm leading-relaxed">
              Him-Kash online cashmere & marino wool clothing store<br />
              Quality & Luxury fashion delivered to your door
            </p>
          </div>

          {/* Column 2: Legal Links */}
          <div>
            <h3 className="text-amber-200 font-semibold mb-3 text-lg">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-amber-200/80 hover:text-amber-100 transition">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-amber-200/80 hover:text-amber-100 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-amber-200/80 hover:text-amber-100 transition">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-amber-200/80 hover:text-amber-100 transition">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Complaints */}
          <div>
            <h3 className="text-amber-200 font-semibold mb-3 text-lg">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-amber-200/80 hover:text-amber-100 transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <a
                  href="https://www.livroreclamacoes.pt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-200/80 hover:text-amber-100 transition"
                >
                  Electronic Complaints Book
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-amber-700/50 my-6"></div>

        {/* Bottom Bar - Business Identification & RAL */}
        <div className="text-center text-amber-200/60 text-xs space-y-2">
          <p>Anjana Bhatta</p>
          <p>NIF: 290131146</p>
          <p>Email: himkash.info@gmail.com</p>
          
          {/* ✅ TRADEMARK NOTICE - ADD THIS LINE */}
          <p className="text-amber-200/50 text-xs">
            HIMKASH™ - Trademark application pending with INPI
          </p>
          
          <p>
            In case of a dispute, the consumer may resort to an Alternative Dispute Resolution entity.
            More information at{' '}
            <a
              href="https://www.consumidor.gov.pt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 hover:text-amber-200 underline"
            >
              www.consumidor.gov.pt
            </a>
          </p>
          <p className="pt-2">© {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}