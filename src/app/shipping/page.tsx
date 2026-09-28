export default function ShippingPolicyPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-16 sm:px-6">
      <h1 className="text-5xl font-bold uppercase tracking-wide">
        Shipping Policy
      </h1>
      <p className="text-muted-foreground mt-2 text-xs uppercase tracking-widest">
        Surface Transport Protocol
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-foreground text-lg font-bold uppercase tracking-wider">
            1. Dispatch & Processing Timeline
          </h2>
          <p className="mt-2">
            Orders are packed and dispatched within 24 to 48 business hours
            after payment confirmation. Orders placed on Sundays or national
            holidays are handed over to couriers the following business day.
          </p>
        </section>

        <section>
          <h2 className="text-foreground text-lg font-bold uppercase tracking-wider">
            2. Transit Method & Timeline
          </h2>
          <p className="mt-2">
            Because our formulations contain cosmetic ethanol and aromatic oils,
            shipments are regulated as flammable goods and routed strictly via{" "}
            <strong>Surface Express Courier (Road Cargo)</strong> to ensure
            compliance with transport regulations.
          </p>
          <p className="mt-2">Estimated delivery windows:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Delhi NCR & North India: 2 to 4 business days</li>
            <li>
              Metro Cities (Mumbai, Bengaluru, Kolkata, Chennai): 4 to 6
              business days
            </li>
            <li>Rest of India: 5 to 8 business days</li>
          </ul>
        </section>

        <section>
          <h2 className="text-foreground text-lg font-bold uppercase tracking-wider">
            3. Shipping Rates
          </h2>
          <p className="mt-2">
            Standard surface shipping is free on all orders of ₹1,499 and above.
            A flat shipping fee of ₹99 applies to orders below this threshold.
          </p>
        </section>
      </div>
    </div>
  );
}
