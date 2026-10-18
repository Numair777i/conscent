import React from "react";

export const metadata = {
  title: "Shipping Policy | CONSCENT Fragrances",
  description:
    "Shipping timelines, surface transport protocol, and delivery rates for CONSCENT Fragrances.",
};

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 py-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Main Title & Metadata */}
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight font-sans">
            Shipping Policy
          </h1>
          <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase mt-3">
            Last Updated: October 2026
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-black">
            1. Dispatch &amp; Processing Timeline
          </h2>
          <p className="text-neutral-700 leading-relaxed text-sm md:text-base">
            Orders are packed and dispatched within 24 to 48 business hours
            after payment confirmation. Orders placed on Sundays or national
            holidays are handed over to couriers the following business day.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-black">
            2. Surface Transport Protocol &amp; Timelines
          </h2>
          <p className="text-neutral-700 leading-relaxed text-sm md:text-base">
            Because our formulations contain cosmetic ethanol and aromatic oils,
            shipments are regulated as flammable goods and routed strictly via
            Surface Express Courier (Road Cargo) to ensure compliance with
            transport regulations.
          </p>
          <div className="pt-1 text-sm md:text-base text-neutral-700 space-y-1">
            <p className="font-semibold text-black">
              Estimated delivery windows:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-700">
              <li>
                <strong>Delhi NCR &amp; North India:</strong> 2 to 4 business
                days
              </li>
              <li>
                <strong>
                  Metro Cities (Mumbai, Bengaluru, Kolkata, Chennai):
                </strong>{" "}
                4 to 6 business days
              </li>
              <li>
                <strong>Rest of India:</strong> 5 to 8 business days
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-black">
            3. Shipping Rates
          </h2>
          <p className="text-neutral-700 leading-relaxed text-sm md:text-base">
            Standard surface shipping is complimentary on all orders of ₹1,499
            and above. A flat shipping fee of ₹99 applies to orders below this
            threshold.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-black">
            4. Tracking &amp; Transit Inquiries
          </h2>
          <p className="text-neutral-700 leading-relaxed text-sm md:text-base">
            Once dispatched, tracking details and an Air Waybill (AWB) number
            will be sent via SMS and email. For any delivery queries, please
            reach out to customer support at{" "}
            <a
              href="mailto:conscent7@gmail.com"
              className="underline font-medium text-black"
            >
              conscent7@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
