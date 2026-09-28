export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-16 sm:px-6">
      <h1 className="text-5xl font-bold uppercase tracking-wide">
        Privacy Policy
      </h1>
      <p className="text-muted-foreground mt-2 text-xs uppercase tracking-widest">
        Last updated: September 2026
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-foreground text-lg font-bold uppercase tracking-wider">
            1. Information We Collect
          </h2>
          <p className="mt-2">
            We collect personal information necessary to fulfill and ship your
            orders, including your full name, shipping address, contact phone
            number, and email address. Payment data is processed directly via
            tokenized Razorpay APIs; we never access or store raw financial
            details.
          </p>
        </section>

        <section>
          <h2 className="text-foreground text-lg font-bold uppercase tracking-wider">
            2. How Information is Used
          </h2>
          <p className="mt-2">
            Your details are used strictly for order fulfillment, logistics
            dispatch (via surface courier partners like Delhivery),
            transactional notifications via email, and customer support
            inquiries.
          </p>
        </section>

        <section>
          <h2 className="text-foreground text-lg font-bold uppercase tracking-wider">
            3. Third-Party Sharing
          </h2>
          <p className="mt-2">
            We only disclose delivery addresses and phone numbers to contracted
            courier networks for package delivery. We do not rent, trade, or
            monetize customer data to third-party marketing services.
          </p>
        </section>
      </div>
    </div>
  );
}
