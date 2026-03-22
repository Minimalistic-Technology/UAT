const page = () => {
  return (
    <div>
    <div className="bg-gray-50 min-h-screen py-10 px-4 md:px-10">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-6 md:p-10">
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
          Privacy Policy
        </h1>

        <p className="text-gray-600 mb-6">
          <strong>LexVeda</strong> (“Company”, “We”, “Our”, “Us”) is committed to protecting and respecting your privacy. This Privacy Policy (“Policy”) outlines how we collect, use, disclose, store, and protect your personal data when you access or use our platform.
        </p>

        {/* Section */}
        <Section title="1. Applicability">
          This Policy applies to all users, clients, visitors, and individuals who access or use the Platform.
        </Section>

        <Section title="2. Information We Collect">
          <SubSection title="2.1 Personal Information">
            <ul className="list-disc ml-6 space-y-1">
              <li>Full name</li>
              <li>Email address</li>
              <li>Contact number</li>
              <li>Residential or business address</li>
              <li>Organization details and designation</li>
            </ul>
          </SubSection>

          <SubSection title="2.2 Sensitive Personal Data or Information (SPDI)">
            <ul className="list-disc ml-6 space-y-1">
              <li>Legal documents or case-related information</li>
              <li>Any other voluntarily provided data</li>
            </ul>
          </SubSection>

          <SubSection title="2.3 Technical and Usage Information">
            <ul className="list-disc ml-6 space-y-1">
              <li>IP address</li>
              <li>Device type and OS</li>
              <li>Browser type</li>
              <li>Usage data and interactions</li>
            </ul>
          </SubSection>
        </Section>

        <Section title="3. Method of Collection">
          <ul className="list-disc ml-6 space-y-1">
            <li>Direct interactions (forms, onboarding)</li>
            <li>Automated tools (cookies, analytics)</li>
            <li>Third-party integrations</li>
          </ul>
        </Section>

        <Section title="4. Purpose of Processing">
          <ul className="list-disc ml-6 space-y-1">
            <li>Provide and maintain services</li>
            <li>Manage communication</li>
            <li>Customer support</li>
            <li>Platform improvements</li>
            <li>Security and fraud prevention</li>
          </ul>
        </Section>

        <Section title="5. Legal Basis for Processing">
          <ul className="list-disc ml-6 space-y-1">
            <li>Consent</li>
            <li>Contractual obligations</li>
            <li>Legal compliance</li>
            <li>Legitimate interests</li>
          </ul>
        </Section>

        <Section title="6. Data Sharing and Disclosure">
          <ul className="list-disc ml-6 space-y-1">
            <li>Internal team and representatives</li>
            <li>Service providers</li>
            <li>Legal authorities</li>
            <li>Professional advisors</li>
          </ul>
        </Section>

        <Section title="7. Data Retention">
          We retain data only as long as necessary to fulfill legal and operational requirements.
        </Section>

        <Section title="8. Data Security">
          We implement reasonable safeguards, but cannot guarantee absolute security.
        </Section>

        <Section title="9. User Rights">
          <ul className="list-disc ml-6 space-y-1">
            <li>Access your data</li>
            <li>Request corrections</li>
            <li>Request deletion</li>
            <li>Withdraw consent</li>
          </ul>
        </Section>

        <Section title="10. Contact Information">
          <p>Email: your@email.com</p>
        </Section>

        <p className="text-sm text-gray-400 mt-10">
          Last Updated: [Insert Date]
        </p>
      </div>
    </div>
    </div>
  )
}

function Section({ title, children }:any) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
      <div className="text-gray-600 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

// Reusable SubSection Component
function SubSection({ title, children }:any) {
  return (
    <div className="mb-4">
      <h3 className="text-md font-medium text-gray-700 mb-1">{title}</h3>
      <div className="text-gray-600 text-sm">{children}</div>
    </div>
  );
}

export default page