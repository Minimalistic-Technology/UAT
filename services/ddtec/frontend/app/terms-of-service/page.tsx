import type { Metadata } from "next";
import LegalPageLayout from "../_components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Terms of Service | DDTEC",
  description: "The terms and conditions governing your use of the DDTEC website and services.",
};

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="27 September 2026">
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of the <strong>DDTEC</strong>{" "}
        website and services. By creating an account, placing an order, or otherwise using our services, you
        agree to be bound by these Terms.
      </p>

      <h2>1. Accounts</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account credentials and for all
        activity under your account. You must provide accurate and complete information when registering.
      </p>

      <h2>2. Orders &amp; Pricing</h2>
      <ul>
        <li>All product prices are listed in Indian Rupees (₹) and are inclusive/exclusive of applicable taxes (CGST/SGST) as shown at checkout.</li>
        <li>We reserve the right to correct pricing errors and to cancel or refuse any order at our discretion, including in cases of suspected fraud or unavailability of stock.</li>
        <li>Cash on Delivery (COD), where available, is subject to the payment method restrictions shown on the product page.</li>
      </ul>

      <h2>3. Shipping &amp; Delivery</h2>
      <p>
        Delivery timelines and serviceability depend on your pincode and are handled through our courier
        partners (Blue Dart, DTDC). Estimated delivery dates are indicative and not guaranteed.
      </p>

      <h2>4. Returns, Refunds &amp; Warranty</h2>
      <p>
        Returnability, warranty terms, and delivery/return policies vary by product and are shown on the
        relevant product page. Please review these before purchasing. Refunds, where applicable, are
        processed back to the original payment method within a reasonable timeframe.
      </p>

      <h2>5. Reviews &amp; User Content</h2>
      <p>
        If you submit a product review or other content, you confirm it is honest, based on genuine
        experience, and does not contain unlawful, defamatory, or infringing material. We may remove content
        that violates these Terms.
      </p>

      <h2>6. Prohibited Use</h2>
      <ul>
        <li>Using the site for any unlawful purpose or in violation of these Terms.</li>
        <li>Attempting to gain unauthorized access to our systems or other users&apos; accounts.</li>
        <li>Interfering with the normal operation of the website.</li>
      </ul>

      <h2>7. Intellectual Property</h2>
      <p>
        All content on this website, including logos, product descriptions, and images, is owned by or
        licensed to DDTEC and may not be used without prior written permission.
      </p>

      <h2>8. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, DDTEC shall not be liable for any indirect, incidental, or
        consequential damages arising from your use of our services.
      </p>

      <h2>9. Governing Law</h2>
      <p>
        These Terms are governed by the laws of India, and any disputes shall be subject to the exclusive
        jurisdiction of the courts having authority over our registered place of business.
      </p>

      <h2>10. Changes to These Terms</h2>
      <p>
        We may revise these Terms from time to time. Continued use of our services after changes take effect
        constitutes acceptance of the updated Terms.
      </p>

      <h2>11. Contact Us</h2>
      <p>
        For any questions about these Terms, please reach out via our <a href="/contact">Contact page</a>.
      </p>
    </LegalPageLayout>
  );
}
