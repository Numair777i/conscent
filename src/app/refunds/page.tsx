import React from "react";

export const metadata = {
  title: "Cancellation & Refunds | CONSCENT Fragrances",
  description:
    "Cancellation terms, damage replacements, and refund policies for CONSCENT Fragrances.",
};

export default function CancellationRefunds() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 py-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Main Title & Metadata */}
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight font-sans">
            Cancellation &amp; Refunds
          </h1>
          <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase mt-3">
            Last Updated: October 2026
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-black">
            1. Fragrance Hygiene &amp; Non-Returnable Items
          </h2>
          <p className="text-neutral-700 leading-relaxed text-sm md:text-base">
            Due to the hygienic, personal-care nature of artisan perfumes and
            strict quality control standards, opened, sprayed, or unsealed
            bottles cannot be returned or refunded if you dislike the scent. We
            recommend sampling individual blends through our Trial Sets before
            purchasing full-sized bottles.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-black">
            2. Order Cancellations
          </h2>
          <p className="text-neutral-700 leading-relaxed text-sm md:text-base">
            Orders can be cancelled before they are dispatched from our
            fulfillment facility. Once a shipment has been handed over to the
            courier partner and an Air Waybill (AWB) has been generated, the
            order cannot be cancelled in transit.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-black">
            3. Transit Damage &amp; Defective Atomizers
          </h2>
          <p className="text-neutral-700 leading-relaxed text-sm md:text-base">
            If your package arrives physically broken, heavily leaking, or with
            a defective atomizer, we provide a 100% complimentary replacement.
            To qualify:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-neutral-700 text-sm md:text-base">
            <li>
              Notify us within <strong>48 hours of delivery</strong> at{" "}
              <a
                href="mailto:conscent7@gmail.com"
                className="underline font-medium text-black"
              >
                conscent7@gmail.com
              </a>
              .
            </li>
            <li>
              Provide clear photos or an unboxing video showing the outer
              shipping box, shipping label, batch sticker, and damaged bottle.
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-black">
            4. Refund Processing
          </h2>
          <p className="text-neutral-700 leading-relaxed text-sm md:text-base">
            Approved monetary refunds are credited directly back to the original
            payment source (UPI ID, debit/credit card, or net banking account)
            within <strong>5 to 7 business days</strong> via our payment
            processor, Razorpay.
          </p>
        </section>
      </div>
    </div>
  );
}
