import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-900/50 border-t border-gray-800 mt-auto backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center">
        <div className="text-sm text-muted-foreground mb-4 sm:mb-0 flex flex-col sm:flex-row sm:items-center gap-2">
          <span>
            {new Date().getFullYear()} Advantage Integration, LLC. All rights
            reserved.
          </span>
          <span className="hidden sm:inline mx-1">•</span>
          <Link
            className="text-primary hover:text-primary/80 transition-colors"
            href="/terms"
          >
            Terms & Disclaimer
          </Link>
        </div>
        <div className="text-sm text-muted-foreground">
          Questions or feedback? Contact us:{" "}
          <a
            aria-label="Contact email"
            className="text-primary hover:text-primary/80 transition-colors"
            href="mailto:info@advantageintegrationai.com"
          >
            info@advantageintegrationai.com
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
