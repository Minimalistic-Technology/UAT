import Link from "next/link";
import { BookOpen, MapPin, Mail } from "lucide-react";

const FacebookIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const TwitterIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const LinkedinIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

export const Footer = () => {
  return (
    <div className="w-full bg-[#f4f6f8] flex justify-center mt-auto">
      {/* Container simulating the white "card" footer from the design */}
      <div className="w-full bg-white p-8 md:p-10 lg:p-12 shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-6 text-left">
          {/* Column 1: Brand & Info */}
          <div className="lg:col-span-3 flex flex-col items-start">
            <Link href="/" className="flex items-center gap-2.5 mb-6 group">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-[#1877F2]">
                <BookOpen size={20} />
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tight">
                Minimalistic<span className="text-[#1877F2]">Learning</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-[240px]">
              Empowering curious minds with high-quality, distraction-free
              educational resources since 2024.
            </p>
            <div className="flex items-center gap-5 text-gray-400">
              <Link
                href="#"
                className="hover:text-[#1877F2] active:scale-95 transition-all text-gray-800"
              >
                <FacebookIcon size={18} />
              </Link>
              <Link
                href="#"
                className="hover:text-[#1877F2] active:scale-95 transition-all text-gray-800"
              >
                <TwitterIcon size={18} />
              </Link>
              <Link
                href="#"
                className="hover:text-[#1877F2] active:scale-95 transition-all text-gray-800"
              >
                <LinkedinIcon size={18} />
              </Link>
              <Link
                href="#"
                className="hover:text-[#1877F2] active:scale-95 transition-all text-gray-800"
              >
                <InstagramIcon size={18} />
              </Link>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-2 flex flex-col lg:pl-4">
            <h4 className="text-gray-900 font-bold mb-6 text-[15px]">
              Quick Links
            </h4>
            <div className="flex flex-col gap-4">
              <Link
                href="#"
                className="text-gray-500 hover:text-[#1877F2] text-sm font-medium transition-colors w-fit"
              >
                About Us
              </Link>
              <Link
                href="#"
                className="text-gray-500 hover:text-[#1877F2] text-sm font-medium transition-colors w-fit"
              >
                Our Services
              </Link>
              <Link
                href="#"
                className="text-gray-500 hover:text-[#1877F2] text-sm font-medium transition-colors w-fit"
              >
                Testimonials
              </Link>
              <Link
                href="#"
                className="text-gray-500 hover:text-[#1877F2] text-sm font-medium transition-colors w-fit"
              >
                Our Team
              </Link>
              <Link
                href="#"
                className="text-gray-500 hover:text-[#1877F2] text-sm font-medium transition-colors w-fit"
              >
                Careers
              </Link>
            </div>
          </div>

          {/* Column 3: Categories */}
          <div className="lg:col-span-2 flex flex-col">
            <h4 className="text-gray-900 font-bold mb-6 text-[15px]">
              Categories
            </h4>
            <div className="flex flex-col gap-4 text-left">
              <Link
                href="#"
                className="text-gray-500 hover:text-[#1877F2] text-sm font-medium transition-colors w-fit"
              >
                Technology
              </Link>
              <Link
                href="#"
                className="text-gray-500 hover:text-[#1877F2] text-sm font-medium transition-colors w-fit"
              >
                Software Dev
              </Link>
              <Link
                href="#"
                className="text-gray-500 hover:text-[#1877F2] text-sm font-medium transition-colors w-fit"
              >
                Machine Learning
              </Link>
              <Link
                href="#"
                className="text-gray-500 hover:text-[#1877F2] text-sm font-medium transition-colors w-fit"
              >
                Design
              </Link>
              <Link
                href="#"
                className="text-gray-500 hover:text-[#1877F2] text-sm font-medium transition-colors w-fit"
              >
                Productivity
              </Link>
            </div>
          </div>

          {/* Column 4: Contact Us */}
          <div className="lg:col-span-2 flex flex-col items-start lg:pl-2">
            <h4 className="text-gray-900 font-bold mb-6 text-[15px]">
              Contact Us
            </h4>
            <div className="flex flex-col gap-5">
              <div className="flex items-start gap-4">
                <MapPin
                  size={20}
                  className="text-[#1877F2] mt-0.5 shrink-0"
                  strokeWidth={2.5}
                />
                <span className="text-gray-500 text-sm font-medium leading-relaxed">
                  123 Learning Avenue
                  <br />
                  Mumbai, MH 400001
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Mail
                  size={20}
                  className="text-[#1877F2] shrink-0"
                  strokeWidth={2.5}
                />
                <span className="text-gray-500 text-sm font-medium">
                  info@minimalistic.edu
                </span>
              </div>
            </div>
          </div>

          {/* Column 5: Stay Updated (Subscription) */}
          <div className="lg:col-span-3 flex flex-col items-start lg:pl-16">
            <h4 className="text-gray-900 font-bold mb-6 text-[15px]">
              Stay Updated
            </h4>
            <div className="w-full lg:max-w-[280px] flex items-center bg-gray-50/50 border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#1877F2] focus-within:bg-white transition-all mb-4">
              <input
                type="email"
                placeholder="Email..."
                className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-gray-900 text-sm font-medium min-w-0 placeholder:text-gray-400"
              />
              <button className="bg-[#1877F2] hover:bg-[#1565C0] p-3 text-white transition-all active:scale-95 shrink-0 flex items-center justify-center">
                <BookOpen size={18} strokeWidth={2.5} />
              </button>
            </div>
            <p className="text-gray-600 text-[13px] font-medium leading-relaxed max-w-[220px]">
              Subscribe for the latest educational resources.
            </p>
          </div>
        </div>

        {/* Bottom Divider & Copyright */}
        <div className="pt-6 border-t border-gray-100 flex flex-col lg:flex-row justify-between items-center gap-6">
          <p className="text-gray-400 text-sm font-medium shrink-0">
            © {new Date().getFullYear()} Minimalistic Learning. All rights
            reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-x-8 gap-y-3">
            <Link
              href="#"
              className="text-gray-400 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-gray-400 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-gray-400 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              Cookie Policy
            </Link>
            <Link
              href="#"
              className="text-gray-400 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
