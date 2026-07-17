// components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  // Update these URLs when you create your accounts
  const socialLinks = {
    facebook: 'https://www.facebook.com/profile.php?id=61563221459507',
    instagram: 'https://www.instagram.com/himkash.official/',    
    tiktok: '#',       // Replace with your TikTok URL when ready
    youtube: 'https://www.youtube.com/@Clothing-brand-cashmere',
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

          {/* Column 4: Social Media - UPDATED with larger, more visible icons */}
          <div>
            <h3 className="text-amber-200 font-semibold mb-4 text-lg">Follow Us</h3>
            <div className="flex justify-center md:justify-start space-x-4">
              
              {/* Facebook - Larger with background */}
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-12 h-12 flex items-center justify-center rounded-full bg-amber-200/10 hover:bg-amber-200/20 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-amber-200/20"
                aria-label="Facebook"
              >
                <svg className="w-7 h-7 text-amber-200 group-hover:text-amber-100 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="absolute -bottom-7 text-[10px] text-amber-200/60 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  Facebook
                </span>
              </a>

              {/* Instagram - Larger with background */}
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-12 h-12 flex items-center justify-center rounded-full bg-amber-200/10 hover:bg-amber-200/20 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-amber-200/20"
                aria-label="Instagram"
              >
                <svg className="w-7 h-7 text-amber-200 group-hover:text-amber-100 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                <span className="absolute -bottom-7 text-[10px] text-amber-200/60 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  Instagram
                </span>
              </a>

              {/* TikTok - Larger with background */}
              <a
                href={socialLinks.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-12 h-12 flex items-center justify-center rounded-full bg-amber-200/10 hover:bg-amber-200/20 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-amber-200/20"
                aria-label="TikTok"
              >
                <svg className="w-7 h-7 text-amber-200 group-hover:text-amber-100 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.49v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
                <span className="absolute -bottom-7 text-[10px] text-amber-200/60 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  TikTok
                </span>
              </a>

              {/* YouTube - Larger with background */}
              <a
                href={socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-12 h-12 flex items-center justify-center rounded-full bg-amber-200/10 hover:bg-amber-200/20 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-amber-200/20"
                aria-label="YouTube"
              >
                <svg className="w-7 h-7 text-amber-200 group-hover:text-amber-100 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.42 4.814a2.504 2.504 0 01-1.768 1.768c-1.56.419-7.812.419-7.812.419s-6.252 0-7.812-.419a2.505 2.505 0 01-1.768-1.768C2 15.255 2 12 2 12s0-3.255.42-4.814a2.505 2.505 0 011.768-1.768C5.748 5 12 5 12 5s6.252 0 7.812.418zM10 15l5-3-5-3v6z"/>
                </svg>
                <span className="absolute -bottom-7 text-[10px] text-amber-200/60 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  YouTube
                </span>
              </a>

              {/* LinkedIn - Larger with background */}
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-12 h-12 flex items-center justify-center rounded-full bg-amber-200/10 hover:bg-amber-200/20 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-amber-200/20"
                aria-label="LinkedIn"
              >
                <svg className="w-7 h-7 text-amber-200 group-hover:text-amber-100 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C0.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.204 0 22.225 0z"/>
                </svg>
                <span className="absolute -bottom-7 text-[10px] text-amber-200/60 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  LinkedIn
                </span>
              </a>
            </div>
            
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
            HIMKASH™ - Trademark application pending with  INPI
          </p>
          
          <p>
            In case of a dispute, the consumer may resort to an Alternative Dispute Resolution entity.
            More information at{' '}
            <a
              href="https://www.consumidor.gov.pt"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-amber-200/80 transition"
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