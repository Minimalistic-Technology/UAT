import type { Metadata } from "next";
import LegalPageLayout from "../_components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Cookie Policy | DDTEC",
  description: "How DDTEC uses cookies and similar technologies on this website.",
};

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout title="Cookie Policy" lastUpdated="27 September 2026">
      <p>
        This Cookie Policy explains how <strong>DDTEC</strong> uses cookies and similar technologies to
        recognize you when you visit our website, and how you can control them.
      </p>

      <h2>1. What Are Cookies?</h2>
      <p>
        Cookies are small text files placed on your device when you visit a website. They are widely used to
        make websites work, work more efficiently, and provide reporting information, as well as to
        remember your preferences.
      </p>

      <h2>2. Types of Cookies We Use</h2>
      <ul>
        <li>
          <strong>Strictly necessary cookies:</strong> required for core site functionality such as keeping
          you logged in, maintaining your shopping cart, and remembering your theme (light/dark) preference.
          These cannot be disabled without affecting how the site works.
        </li>
        <li>
          <strong>Functional cookies:</strong> remember choices you make (such as your delivery pincode) to
          provide a more personalized experience.
        </li>
        <li>
          <strong>Analytics cookies:</strong> help us understand how visitors use our website (e.g. via
          Google Analytics) so we can measure and improve performance. These collect information in an
          anonymous or aggregated form.
        </li>
        <li>
          <strong>Local storage:</strong> in addition to cookies, we use your browser&apos;s local storage
          for things like keeping items in your cart between visits.
        </li>
      </ul>

      <h2>3. Third-Party Cookies</h2>
      <p>
        Some cookies are placed by third-party services that appear on our pages, such as analytics
        providers. We do not control these third-party cookies directly; please refer to the respective
        third party&apos;s privacy/cookie policy for more information.
      </p>

      <h2>4. Managing Cookies</h2>
      <p>
        Most web browsers allow you to control cookies through their settings, including blocking or
        deleting them. Please note that disabling strictly necessary cookies may prevent parts of our
        website (such as login or checkout) from working correctly.
      </p>
      <ul>
        <li>Chrome: Settings → Privacy and security → Cookies and other site data</li>
        <li>Firefox: Settings → Privacy &amp; Security → Cookies and Site Data</li>
        <li>Safari: Preferences → Privacy → Manage Website Data</li>
        <li>Edge: Settings → Cookies and site permissions</li>
      </ul>

      <h2>5. Changes to This Policy</h2>
      <p>
        We may update this Cookie Policy from time to time to reflect changes in the cookies we use or for
        other operational, legal, or regulatory reasons. Please revisit this page periodically.
      </p>

      <h2>6. Contact Us</h2>
      <p>
        If you have any questions about our use of cookies, please reach out via our{" "}
        <a href="/contact">Contact page</a>. See also our <a href="/privacy-policy">Privacy Policy</a> for
        how we handle personal information more broadly.
      </p>
    </LegalPageLayout>
  );
}
