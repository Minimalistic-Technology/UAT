const commitments = [
  {
    title: "Easy & Hassle-Free Access",
    description:
      "We are committed to making legal services simple, smooth, and accessible—eliminating unnecessary complexity and delays.",
  },
  {
    title: "Verified Legal Experts",
    description:
      "Every professional on our platform is carefully vetted to ensure you receive reliable, accurate, and high-quality legal guidance.",
  },
  {
    title: "Confidentiality & Data Security",
    description:
      "Your privacy is our priority. All consultations and information shared on LexVeda are handled with strict confidentiality and secure systems.",
  },
  {
    title: "Timely Assistance",
    description:
      "Legal matters can’t wait. We ensure prompt responses and efficient handling of your queries and cases.",
  },
  {
    title: "Client-Centric Approach",
    description:
      "We listen, understand, and tailor solutions to your specific needs—because every legal situation is unique.",
  },
  {
    title: "Seamless Online Experience",
    description:
      "From booking consultations to document handling, our platform is designed for a smooth, user-friendly digital journey.",
  },
  {
    title: "Affordable Legal Solutions",
    description:
      "Quality legal help should be accessible to everyone. We strive to offer cost-effective services without compromising on excellence.",
  },
  {
    title: "End-to-End Support",
    description:
      "From initial consultation to resolution, we stand by you throughout your legal journey.",
  },
  {
    title: "Continuous Improvement",
    description:
      "We are committed to evolving our platform and services based on user feedback, technology, and changing legal needs.",
  },
];

const CommitmentsSection = () => {
  return (
    <section id="commitments" className="section-padding bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
            Our Commitments at LexVeda
          </h2>
          <div className="gold-divider mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {commitments.map((item, idx) => (
            <article
              key={item.title}
              className="border border-border rounded-xl p-6 bg-background shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-xs font-semibold tracking-widest text-accent opacity-90">
                {idx + 1}. {item.title}
              </span>
              <p className="mt-3 text-sm md:text-base font-sans text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommitmentsSection;
