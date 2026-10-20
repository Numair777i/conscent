export default function TermsPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-16 sm:px-6">
      <h1 className="text-5xl font-bold uppercase tracking-wide">
        Terms & Conditions
      </h1>
      <p className="text-muted-foreground mt-2 text-xs uppercase tracking-widest">
        Last updated: October 2026
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-foreground text-lg font-bold uppercase tracking-wider">
            1. Agreement to Terms
          </h2>
          <p className="mt-2">
            By accessing or purchasing from <strong>CONSCENT</strong> (“we”,
            “us”, “our”) through <strong>conscentfragrances.com</strong>, you
            agree to be bound by these Terms and Conditions. If you do not
            agree, please do not use our services or purchase our handcrafted
            extrait de parfum and fragrance formulations.
          </p>
        </section>

        <section>
          <h2 className="text-foreground text-lg font-bold uppercase tracking-wider">
            2. Product Specifications & Artisan Formulations
          </h2>
          <p className="mt-2">
            All fragrances are formulated in controlled small batches using
            concentrated fragrance oils, perfumer&apos;s cosmetic ethanol, and
            specialty aromatic fixatives. Slight variations in liquid color,
            natural resin sediment, or olfactory maturation over time are
            natural characteristics of high-concentration macerated formulations
            and do not constitute product defects.
          </p>
        </section>

        <section>
          <h2 className="text-foreground text-lg font-bold uppercase tracking-wider">
            3. Safe Usage & Skin Sensitivity Disclaimer
          </h2>
          <p className="mt-2">
            Our extraits are high-strength formulations engineered solely for
            external application. Keep away from open flames, broken skin,
            mouth, and eyes. We recommend performing a small 24-hour patch test
            before full use. CONSCENT is not liable for individual skin
            allergies, irritation, or adverse sensitivities to specific aromatic
            compounds or essential fragrance oils.
          </p>
        </section>

        <section>
          <h2 className="text-foreground text-lg font-bold uppercase tracking-wider">
            4. Pricing, Orders & Payments
          </h2>
          <p className="mt-2">
            All prices are listed in Indian Rupees (INR) and are inclusive of
            applicable taxes. We reserve the right to refuse or cancel orders
            due to inventory inaccuracies or unauthorized pricing discrepancies.
            Payments are securely processed via tokenized Razorpay gateway
            integrations. We do not store or access your credit/debit card
            numbers, UPI PINs, or net banking credentials.
          </p>
        </section>

        <section>
          <h2 className="text-foreground text-lg font-bold uppercase tracking-wider">
            5. Shipping & Hazardous Goods Transport
          </h2>
          <p className="mt-2">
            Due to the ethanol content of fine fragrances, packages are
            classified as flammable personal care items and shipped strictly via
            Surface Road Logistics through contracted carriers (such as
            Delhivery). Estimated delivery windows are 2–4 business days for
            Delhi NCR and 4–8 business days for the rest of India.
          </p>
        </section>

        <section>
          <h2 className="text-foreground text-lg font-bold uppercase tracking-wider">
            6. Governing Law & Dispute Resolution
          </h2>
          <p className="mt-2">
            These terms shall be governed by and interpreted in accordance with
            the laws of the Republic of India. Any disputes arising in
            connection with these terms or purchases made through the site shall
            be subject to the exclusive jurisdiction of the competent courts in
            New Delhi, Delhi, India.
          </p>
        </section>

        <section className="border border-border p-5 bg-card/40 rounded-lg">
          <h2 className="text-foreground text-lg font-bold uppercase tracking-wider">
            7. Grievance Redressal & Customer Care
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            In compliance with the Consumer Protection (E-Commerce) Rules, 2020,
            our customer care and nodal grievance officer details are:
          </p>
          <div className="mt-3 text-xs space-y-1 text-foreground/80">
            <p>
              <strong>Brand / Entity:</strong> CONSCENT
            </p>
            <p>
              <strong>Grievance & Compliance Officer:</strong> Store
              Administrator
            </p>
            <p>
              <strong>Operational Address:</strong> New Delhi, Delhi, India –
              110025
            </p>
            <p>
              <strong>Customer Support Email:</strong>{" "}
              support@conscentfragrances.com
            </p>
            <p>
              <strong>Customer Support Phone:</strong> +91 7982846176 (Mon–Sat,
              10:00 AM – 6:00 PM IST)
            </p>
            <p className="text-muted-foreground mt-2">
              All customer complaints or grievances received will be
              acknowledged within 48 hours and resolved within 30 days of
              receipt.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
