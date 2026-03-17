const Footer = () => {
  return (
    <footer className="bg-navy-dark border-t border-accent/20 px-6 py-12 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="/LOGO.png" 
                alt="LexVeda Logo" 
                className="h-12 w-auto object-contain"
              />
              <div className="flex flex-col items-center leading-none">
                <span className="font-serif text-2xl font-bold text-primary-foreground tracking-wider">
                  Lex<span className="text-accent">Veda</span>
                </span>
                <div className="h-px w-full max-w-[60px] bg-linear-to-r from-transparent via-accent to-transparent my-1.5" />
                <span className="text-xs font-sans text-accent/80 tracking-wide text-center">
                  Legal Services and Consultation
                </span>
              </div>
            </div>
            <p className="font-sans text-sm text-primary-foreground/60 leading-relaxed max-w-xs">
              Professional legal notice drafting and reply services handled exclusively by practising advocates.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-sans font-semibold text-primary-foreground text-sm tracking-wider uppercase mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 font-sans text-sm text-primary-foreground/60">
              <li><a href="#" className="hover:text-accent transition-colors">About LexVeda</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Legal Disclaimer</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-accent/10 text-center">
          <p className="font-sans text-xs text-primary-foreground/40">
            © {new Date().getFullYear()} LexVeda. All rights reserved. Prepared by Practising Advocates – Not AI.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
