import { Mail, Phone } from "lucide-react";

const ContactUs = () => {
  const contacts = [
    {
      id: 1,
      title: "General Inquiries",
      description: "For general questions, service information, and business inquiries",
      email: "info@lexvedalegalservices.com",
      icon: Mail,
    },
    {
      id: 2,
      title: "Consultation Requests",
      description: "For legal consultation requests and case-specific inquiries",
      email: "lexvega.legalservices@gmail.com",
      icon: Phone,
    },
  ];

  return (
    <section id="contact-us" className="section-padding bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Contact Us
          </h2>
          <div className="gold-divider mb-6" />
          <p className="text-sm sm:text-base text-foreground/70 max-w-2xl mx-auto">
            Reach out to us for any inquiries or consultation requests. We're here to assist you.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {contacts.map((contact) => {
            const Icon = contact.icon;
            return (
              <div
                key={contact.id}
                className="group flex flex-col items-center text-center bg-card border border-border rounded-lg p-6 sm:p-8 hover:border-accent/50 hover:shadow-lg transition-all duration-300"
              >
                {/* Icon */}
                <div className="mb-4 sm:mb-6 size-12 sm:size-16 rounded-lg bg-primary flex items-center justify-center group-hover:bg-accent transition-colors">
                  <Icon className="size-6 sm:size-8 text-primary-foreground" />
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-serif font-semibold text-foreground mb-2 sm:mb-3">
                  {contact.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-foreground/60 mb-4 sm:mb-6 leading-relaxed">
                  {contact.description}
                </p>

                {/* Email */}
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-block text-sm sm:text-base font-sans font-medium text-accent hover:text-accent/80 transition-colors break-all"
                >
                  {contact.email}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ContactUs;