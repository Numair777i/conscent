import React from "react";

export const metadata = {
  title: "Contact Us | CONSCENT Fragrances",
  description:
    "Customer care, operational address, and support inquiries for CONSCENT Fragrances.",
};

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 py-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Main Title & Metadata */}
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight font-sans">
            Contact Us
          </h1>
          <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase mt-3">
            Customer Support &amp; Operational Inquiries
          </p>
        </div>

        {/* Section 1: Customer Care */}
        <section className="space-y-3">
          <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-black">
            1. Customer Support
          </h2>
          <p className="text-neutral-700 leading-relaxed text-sm md:text-base">
            For order inquiries, transit tracking, or formulation questions, our
            support desk can be reached directly via:
          </p>
          <ul className="list-none space-y-2 text-neutral-700 text-sm md:text-base pt-1">
            <li>
              <strong className="text-black">Support Email:</strong>{" "}
              <a
                href="mailto:conscent7@gmail.com"
                className="underline font-medium text-black"
              >
                conscent7@gmail.com
              </a>
            </li>
            <li>
              <strong className="text-black">Phone &amp; WhatsApp:</strong>{" "}
              <a
                href="tel:+917982846176"
                className="underline font-medium text-black"
              >
                +91 7982846176
              </a>
            </li>
            <li>
              <strong className="text-black">Support Hours:</strong> Monday –
              Saturday, 10:00 AM – 6:00 PM IST
            </li>
          </ul>
        </section>

        {/* Section 2: Operational Entity */}
        <section className="space-y-3">
          <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-black">
            2. Operational Business Entity
          </h2>
          <div className="text-neutral-700 leading-relaxed text-sm md:text-base space-y-1">
            <p>
              <strong className="text-black">Brand Name:</strong> CONSCENT
              (marketed as CONSCENT Fragrances)
            </p>
            <p>
              <strong className="text-black">Operating Address:</strong> Zakir
              Nagar, Okhla, New Delhi, Delhi, India – 110025
            </p>
          </div>
        </section>

        {/* Section 3: Grievance & Escalation */}
        <section className="space-y-3">
          <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-black">
            3. Grievance Redressal
          </h2>
          <p className="text-neutral-700 leading-relaxed text-sm md:text-base">
            In accordance with the Information Technology Act and Consumer
            Protection (E-Commerce) Rules, any unresolved delivery or payment
            grievances may be addressed to our dedicated support officer at{" "}
            <a
              href="mailto:conscent7@gmail.com"
              className="underline font-medium text-black"
            >
              conscent7@gmail.com
            </a>
            . All escalations are acknowledged within 24 business hours.
          </p>
        </section>
      </div>
    </div>
  );
}
