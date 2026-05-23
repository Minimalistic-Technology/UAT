const page = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 md:px-10">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-6 md:p-10">

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Terms of Use
        </h1>

        <p className="text-sm text-gray-400 mb-6">
          Last Updated: 22.03.2026
        </p>

        <p className="text-gray-600 mb-6">
          These Terms govern your access to and use of the LexVeda platform,
          including legal consultations and related services.
        </p>

        <Section title="1. Changes to Terms">
          LexVeda may update these Terms at any time. Continued use of the Platform
          constitutes acceptance of the updated Terms.
        </Section>

        <Section title="2. Nature of Platform">
          <ul className="list-disc ml-6 space-y-1">
            <li>Connects users with independent legal professionals</li>
            <li>Facilitates online consultations</li>
            <li>Is not a law firm</li>
            <li>Does not provide legal advice directly</li>
            <li>No lawyer-client relationship with LexVeda</li>
          </ul>
        </Section>

        <Section title="3. No Legal Advice by LexVeda">
          <ul className="list-disc ml-6 space-y-1">
            <li>Content is for informational purposes only</li>
            <li>Advice is provided only by Professionals</li>
            <li>LexVeda is not responsible for outcomes</li>
          </ul>
        </Section>

        <Section title="4. User Eligibility">
          <ul className="list-disc ml-6 space-y-1">
            <li>Must be legally capable of entering contracts</li>
            <li>Must provide accurate information</li>
          </ul>
        </Section>

        <Section title="5. User Accounts">
          <ul className="list-disc ml-6 space-y-1">
            <li>Maintain account confidentiality</li>
            <li>Responsible for all activity</li>
            <li>No impersonation allowed</li>
            <li>Accounts may be suspended for misuse</li>
          </ul>
        </Section>

        <Section title="6. Engagement with Professionals">
          <ul className="list-disc ml-6 space-y-1">
            <li>Professionals are independent</li>
            <li>No guarantee of quality or outcomes</li>
            <li>Users must evaluate before engagement</li>
          </ul>
        </Section>

        <Section title="7. Acceptable Use">
          <ul className="list-disc ml-6 space-y-1">
            <li>No illegal or fraudulent use</li>
            <li>No harmful or misleading content</li>
            <li>No harassment or abuse</li>
            <li>No hacking or disruption attempts</li>
          </ul>
        </Section>

        <Section title="8. Intellectual Property">
          <ul className="list-disc ml-6 space-y-1">
            <li>All platform content belongs to LexVeda</li>
            <li>Allowed for personal/business use only</li>
            <li>No copying or resale without permission</li>
          </ul>
        </Section>

        <Section title="9. Copyright Complaints">
          <ul className="list-disc ml-6 space-y-1">
            <li>Proof of ownership</li>
            <li>Description of infringement</li>
            <li>Material location (URL)</li>
            <li>Contact details</li>
            <li>Legal declaration of accuracy</li>
          </ul>
          <p className="mt-2">Email: info@lexvedalegalservices.in</p>
        </Section>

        <Section title="10. Third-Party Services">
          LexVeda is not responsible for third-party tools such as payment or
          video consultation services.
        </Section>

        <Section title="11. Disclaimers">
          <ul className="list-disc ml-6 space-y-1">
            <li>Platform provided “AS IS”</li>
            <li>No guarantee of uninterrupted service</li>
            <li>No warranty on accuracy of listings</li>
          </ul>
        </Section>

        <Section title="12. Limitation of Liability">
          LexVeda is not liable for:
          <ul className="list-disc ml-6 space-y-1 mt-2">
            <li>Advice from Professionals</li>
            <li>User-Professional disputes</li>
            <li>Indirect or consequential damages</li>
            <li>Loss of data or profits</li>
          </ul>
        </Section>

        <Section title="13. Indemnity">
          You agree to indemnify LexVeda from claims arising from your use of the Platform.
        </Section>

        <Section title="14. Termination">
          Access may be suspended or terminated for violations or misuse.
        </Section>

        <Section title="15. Privacy">
          Your use is also governed by our Privacy Policy.
        </Section>

        <Section title="16. Governing Law & Jurisdiction">
          Governed by Indian law. Courts in Mumbai, Maharashtra have jurisdiction.
        </Section>

        <Section title="17. Limitation Period">
          Claims must be brought within 6 months.
        </Section>

        <Section title="18. General Provisions">
          <ul className="list-disc ml-6 space-y-1">
            <li>Invalid clauses do not affect others</li>
            <li>No waiver of rights</li>
            <li>Entire agreement clause applies</li>
          </ul>
        </Section>

        <Section title="19. Contact Us">
          <p>Email: info@lexvedalegalservices.in</p>
        </Section>

      </div>
    </div>
  );
}

// Reusable Section Component
function Section({ title, children }:any) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
      <div className="text-gray-600 text-sm leading-relaxed">{children}</div>
    </div>
  );
}


export default page