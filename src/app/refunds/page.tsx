export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-16 sm:px-6">
      <h1 className="text-5xl font-bold uppercase tracking-wide">
        Cancellation & Refunds
      </h1>
      <p className="text-muted-foreground mt-2 text-xs uppercase tracking-widest">
        Damages, Leaks & Exchanges
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-foreground text-lg font-bold uppercase tracking-wider">
            1. Fragrance Hygiene & Non-Returnable Items
          </h2>
          <p className="mt-2">
            Due to the hygienic, personal-care nature of artisan perfumes and
            strict quality control standards, opened, sprayed, or unsealed
            bottles cannot be returned or refunded if you dislike the scent. We
            recommend sampling individual blends through our Trial Sets before
            buying full-sized bottles.
          </p>
        </section>

        <section>
          <h2 className="text-foreground text-lg font-bold uppercase tracking-wider">
            2. Transit Damage & Leaking Bottles
          </h2>
          <p className="mt-2">
            If your package arrives physically broken, heavily leaking, or with
            defective atomizers, we provide a 100% free replacement. To qualify:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Notify us within 48 hours of delivery at our support email.</li>
            <li>
              Provide clear photos/unboxing footage of the outer package, batch
              sticker, and damaged bottle.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-foreground text-lg font-bold uppercase tracking-wider">
            3. Refund Processing
          </h2>
          <p className="mt-2">
            Approved monetary refunds are processed back to the original payment
            source (UPI account or issuing bank) within 5 to 7 business days via
            Razorpay.
          </p>
        </section>
      </div>
    </div>
  );
}
