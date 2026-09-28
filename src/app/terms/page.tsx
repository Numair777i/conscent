export default function TermsPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-16 sm:px-6">
      <h1 className="text-5xl font-bold uppercase tracking-wide">
        Terms & Conditions
      </h1>
      <p className="text-muted-foreground mt-2 text-xs uppercase tracking-widest">
        Last updated: September 2026
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-foreground text-lg font-bold uppercase tracking-wider">
            1. Agreement to Terms
          </h2>
          <p className="mt-2">
            By accessing or purchasing from CONSCENT (&ldquo;we&rdquo;,
            &ldquo;us&rdquo;, &ldquo;our&rdquo;), you agree to be bound by these
            Terms and Conditions. If you do not agree, please do not use our
            services or purchase our handcrafted Eau de Parfum and extrait
            products.
          </p>
        </section>

        <section>
          <h2 className="text-foreground text-lg font-bold uppercase tracking-wider">
            2. Product Specifications & Artisan Variations
          </h2>
          <p className="mt-2">
            All fragrances are formulated in controlled small batches using
            premium fragrance oils, perfumer&apos;s ethanol, and cosmetic
            diluents. Slight variations in color or natural scent maceration
            over time are inherent characteristics of high-concentration
            formulations and do not constitute product defects.
          </p>
        </section>

        <section>
          <h2 className="text-foreground text-lg font-bold uppercase tracking-wider">
            3. Pricing & Payments
          </h2>
          <p className="mt-2">
            All prices are listed in Indian Rupees (INR) and are inclusive of
            applicable taxes unless stated otherwise. Payments are securely
            processed via Razorpay. We do not store card details, UPI PINs, or
            banking credentials on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-foreground text-lg font-bold uppercase tracking-wider">
            4. Governing Law
          </h2>
          <p className="mt-2">
            These terms shall be governed by and interpreted in accordance with
            the laws of India. Any disputes arising in connection with these
            terms shall be subject to the exclusive jurisdiction of the courts
            in Delhi, India.
          </p>
        </section>
      </div>
    </div>
  );
}
