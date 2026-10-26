export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-16 sm:px-6">
      <h1 className="text-5xl font-bold uppercase tracking-wide">
        Privacy Policy
      </h1>
      <p className="text-muted-foreground mt-2 text-xs uppercase tracking-widest">
        Last updated: October 2026
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-foreground text-lg font-bold uppercase tracking-wider">
            1. Overview
          </h2>
          <p className="mt-2">
            This Privacy Policy outlines how <strong>CONSCENT</strong> (“we”,
            “us”, “our”) collects, uses, and safeguards your personal data when
            you visit or make a purchase from{" "}
            <strong>conscentfragrances.com</strong>. We are committed to
            maintaining the confidentiality and integrity of your personal
            information.
          </p>
        </section>

        <section>
          <h2 className="text-foreground text-lg font-bold uppercase tracking-wider">
            2. Information We Collect
          </h2>
          <p className="mt-2">
            When you interact with our platform, we collect information
            necessary to fulfill your orders and support your user account:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              <strong>Customer &amp; Order Details:</strong> Full name, delivery
              address, registered 10-digit mobile number, and email address.
            </li>
            <li>
              <strong>Authentication Data:</strong> Profile name and verified
              email address when authenticating via Google OAuth or credentials
              login.
            </li>
            <li>
              <strong>Payment Information:</strong> All payment transactions are
              processed directly by our RBI-licensed payment gateway partner,{" "}
              <strong>Razorpay</strong>. We never view, collect, or store your
              debit/credit card credentials, CVVs, or UPI PINs on our servers.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-foreground text-lg font-bold uppercase tracking-wider">
            3. Cookies &amp; Behavioral Telemetry
          </h2>
          <p className="mt-2">
            Our site utilizes essential session cookies and browser storage
            technologies to maintain platform security, preserve your active
            shopping bag across navigation, and verify authenticated logins.
          </p>
          <p className="mt-2">
            To diagnose interface usability issues, eliminate navigation
            friction, and understand catalog engagement, we partner with
            behavioral analytics providers:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-2">
            <li>
              <strong>Google Analytics:</strong> Collects non-personally
              identifiable diagnostic metrics regarding aggregate visitor
              volume, referral channels, and page views.
            </li>
            <li>
              <strong>Microsoft Clarity:</strong> Captures behavioral telemetry,
              interaction heatmaps, and session replays through first- and
              third-party cookies. This helps us observe how patrons interact
              with our product pages and checkout flow.{" "}
              <strong>All sensitive customer inputs</strong> (including
              passwords, payment fields, and street addresses) are strictly
              masked and never recorded or stored by Microsoft Clarity. By using
              our site, you acknowledge data processing by Microsoft in
              accordance with the{" "}
              <a
                href="https://privacy.microsoft.com/en-us/privacystatement"
                target="_blank"
                rel="noreferrer"
                className="text-foreground font-semibold underline underline-offset-4 hover:text-brand"
              >
                Microsoft Privacy Statement
              </a>
              .
            </li>
          </ul>
          <p className="mt-2">
            You can modify, block, or clear your browser’s cookie preferences at
            any time through your device settings.
          </p>
        </section>

        <section>
          <h2 className="text-foreground text-lg font-bold uppercase tracking-wider">
            4. How We Use Your Data
          </h2>
          <p className="mt-2">
            We process your data strictly for legitimate operational purposes:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              Dispatching fragrance parcels via contracted surface road cargo
              couriers (e.g., Delhivery).
            </li>
            <li>
              Sending transactional order confirmations, tracking waybills
              (AWB), and digital tax invoices via automated email services.
            </li>
            <li>
              Handling customer care requests, transit inquiries, and order
              management through your personal account dashboard.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-foreground text-lg font-bold uppercase tracking-wider">
            5. Third-Party Sharing &amp; Security
          </h2>
          <p className="mt-2">
            We do not sell, rent, or trade your personal information to
            third-party data brokers or marketing services. Your data is shared
            solely with verified service providers essential to fulfilling your
            purchase (logistics networks for transit delivery, Razorpay for
            payment processing, and email infrastructure providers).
          </p>
        </section>

        <section className="border border-border p-5 bg-card/40 rounded-lg">
          <h2 className="text-foreground text-lg font-bold uppercase tracking-wider">
            6. Data Protection &amp; Grievance Contact
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            If you have questions regarding this Privacy Policy or wish to
            request data correction or account deletion, contact our Grievance
            Desk:
          </p>
          <div className="mt-3 text-xs space-y-1 text-foreground/80">
            <p>
              <strong>Brand / Entity:</strong> CONSCENT Fragrances
            </p>
            <p>
              <strong>Operational Address:</strong> New Delhi, Delhi, India –
              110025
            </p>
            <p>
              <strong>Privacy &amp; Support Email:</strong>{" "}
              support@conscentfragrances.com
            </p>
            <p>
              <strong>Support Helpline:</strong> +91 7982846176 (Mon–Sat, 10:00
              AM – 6:00 PM IST)
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
