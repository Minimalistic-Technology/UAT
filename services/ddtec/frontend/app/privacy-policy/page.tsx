import type { Metadata } from "next";
import LegalPageLayout from "../_components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | DDTEC",
  description: "How DDTEC collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="27 September 2026">
      <p>
        This Privacy Policy explains how <strong>DDTEC</strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;)
        collects, uses, discloses, and safeguards your information when you visit our website, create an
        account, place an order, or otherwise interact with our services. By using our platform, you agree
        to the practices described in this policy.
      </p>

      <h2>1. Information We Collect</h2>
      <p>We may collect the following categories of information:</p>
      <ul>
        <li><strong>Account information:</strong> name, email address, phone number, and password (stored in encrypted/hashed form).</li>
        <li><strong>Order &amp; billing information:</strong> shipping address, billing address, GSTIN (for business buyers), order history, and invoices.</li>
        <li><strong>Payment information:</strong> payments are processed by our third-party payment gateway (Cashfree); we do not store your full card, UPI, or bank credentials on our servers.</li>
        <li><strong>Delivery information:</strong> pincode and address used to check serviceability and calculate shipping via our courier partners (Blue Dart, DTDC).</li>
        <li><strong>Communications:</strong> messages you send us via contact forms, WhatsApp, email, or support requests.</li>
        <li><strong>Usage data:</strong> pages visited, products viewed, device/browser type, and approximate location, collected automatically via cookies and analytics tools (see our <a href="/cookie-policy">Cookie Policy</a>).</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To create and manage your account.</li>
        <li>To process, fulfil, and deliver your orders, including generating GST-compliant invoices.</li>
        <li>To check delivery serviceability for your pincode and coordinate with courier partners.</li>
        <li>To send order updates, OTPs, receipts, and service communications via email, SMS, or WhatsApp.</li>
        <li>To respond to customer support enquiries and process returns or warranty claims.</li>
        <li>To improve our website, products, and customer experience.</li>
        <li>To detect, prevent, and address fraud, abuse, or security issues.</li>
        <li>To send promotional communications, where you have opted in (you may unsubscribe at any time).</li>
      </ul>

      <h2>3. Sharing of Information</h2>
      <p>We do not sell your personal information. We share information only with:</p>
      <ul>
        <li><strong>Payment processors</strong> (e.g. Cashfree) to complete transactions securely.</li>
        <li><strong>Courier and logistics partners</strong> (e.g. Blue Dart, DTDC) to deliver your orders.</li>
        <li><strong>Cloud, hosting, and infrastructure providers</strong> (e.g. our database and image hosting providers) who process data on our behalf under confidentiality obligations.</li>
        <li><strong>Communication providers</strong> used to send order notifications, OTPs, and emails.</li>
        <li>Law enforcement or regulators, where required by applicable law.</li>
      </ul>

      <h2>4. Data Retention</h2>
      <p>
        We retain personal information for as long as your account is active or as needed to provide you
        services, comply with legal obligations (such as tax and invoicing records), resolve disputes, and
        enforce our agreements.
      </p>

      <h2>5. Your Rights &amp; Choices</h2>
      <ul>
        <li>You may access, update, or correct your account information at any time from your profile.</li>
        <li>You may request deletion of your account and associated personal data, subject to legal record-keeping requirements (e.g. GST invoices).</li>
        <li>You may opt out of marketing emails/SMS via the unsubscribe link or by contacting us.</li>
        <li>You may control cookies through your browser settings — see our <a href="/cookie-policy">Cookie Policy</a> for details.</li>
      </ul>

      <h2>6. Data Security</h2>
      <p>
        We use industry-standard measures, including encrypted connections (HTTPS), hashed passwords, and
        access controls, to protect your information. However, no method of transmission or storage is
        completely secure, and we cannot guarantee absolute security.
      </p>

      <h2>7. Children&apos;s Privacy</h2>
      <p>
        Our services are not directed to individuals under the age of 18. We do not knowingly collect
        personal information from minors.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Material changes will be reflected by updating
        the &quot;Last updated&quot; date above. Continued use of our services after changes constitutes
        acceptance of the revised policy.
      </p>

      <h2>9. Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy or how your data is handled, please reach out via
        our <a href="/contact">Contact page</a> or the support channels listed on our website.
      </p>
    </LegalPageLayout>
  );
}
