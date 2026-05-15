// components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  // Update these URLs when you create your accounts
  const socialLinks = {
    facebook: 'https://www.facebook.com/profile.php?id=61563221459507',
    instagram: 'https://www.instagram.com/himkash.official/',    
    tiktok: '#',       // Replace with your TikTok URL when ready
    youtube: 'https://www.youtube.com/@Caxemeri',
    linkedin: '#',     // Replace with your LinkedIn URL when ready
  };

  return (
    <footer className="bg-red-900 py-8 mt-auto">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          
          {/* Column 1: Business Info */}
          <div>
            <h3 className="text-amber-200 font-semibold mb-3 text-lg">About Us</h3>
            <p className="text-amber-200/80 text-sm leading-relaxed">
              Himkash Cashmere & Marino wool clothing Brand<br /> Online base<br/>
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

          {/* Column 4: Social Media */}
          <div>
            <h3 className="text-amber-200 font-semibold mb-3 text-lg">Follow Us</h3>
            <div className="flex justify-center md:justify-start space-x-5">
              
              {/* Facebook */}
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-200/80 hover:text-amber-100 transition-transform hover:scale-110"
                aria-label="Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-200/80 hover:text-amber-100 transition-transform hover:scale-110"
                aria-label="Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.772 1.153 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>

              {/* TikTok */}
              <a
                href={socialLinks.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-200/80 hover:text-amber-100 transition-transform hover:scale-110"
                aria-label="TikTok"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.49v-3.4a4.85 4.85 0 01-1-.1z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href={socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-200/80 hover:text-amber-100 transition-transform hover:scale-110"
                aria-label="YouTube"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.42 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.812.419-7.812.419s-6.252 0-7.812-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.42-4.814a2.505 2.505 0 0 1 1.768-1.768C5.748 5 12 5 12 5s6.252 0 7.812.418zM10 15l5-3-5-3v6z" clipRule="evenodd" />
                </svg>
              </a>

              {/* LinkedIn - NEW */}
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-200/80 hover:text-amber-100 transition-transform hover:scale-110"
                aria-label="LinkedIn"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C0.792 0 0 0.774 0 1.729v20.542C0 23.227 0.792 24 1.771 24h20.451c0.979 0 1.771-0.773 1.771-1.729V1.729C24 0.774 23.204 0 22.225 0z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            <p className="text-amber-200/50 text-xs mt-3">
              Follow us for updates and exclusive offers
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-amber-700/50 my-6"></div>

        {/* Bottom Bar - Business Identification & RAL */}
        <div className="text-center text-amber-200/60 text-xs space-y-2">
          <p>Anjana Bhatta</p>
          <p>NIF: 290131146</p>
          <p>Email: himkash.info@gmail.com</p>
          
          {/* TRADEMARK NOTICE */}
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
              className="underline"
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