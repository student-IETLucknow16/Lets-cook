import React from 'react';
import { Link } from 'react-router-dom';

const FOOTER_LINKS = [
  { label: 'About Us',         to: '/about'   },
  { label: 'Terms & Conditions', to: '/terms' },
  { label: 'Privacy Policy',   to: '/privacy' },
  { label: 'Contact Us',       to: '/contact' },
  { label: 'Cookie Policy',    to: '/cookies' },
];

const Footer = () => {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer-inner">
        <nav className="footer-links" aria-label="Footer navigation">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="footer-link"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="footer-copyright">
          © 2026 Let's Cook. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
