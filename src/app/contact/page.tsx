export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-16 sm:px-6">
      <h1 className="text-5xl font-bold uppercase tracking-wide">Contact Us</h1>
      <p className="text-muted-foreground mt-2 text-xs uppercase tracking-widest">
        Support & Inquiries
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <div className="border border-border p-6 bg-tile">
          <h3 className="text-foreground text-base font-bold uppercase tracking-wider">
            Operational Business Entity
          </h3>
          <p className="mt-2">
            <strong>Brand Name:</strong> CONSCENT
          </p>
          <p className="mt-1">
            <strong>Operating Address:</strong> New Delhi, Delhi, India - 110025
          </p>
          <p className="mt-1">
            <strong>Support Email:</strong> support@conscent.in
          </p>
          <p className="mt-1">
            <strong>Business Hours:</strong> Monday – Saturday, 10:00 AM – 6:00
            PM IST
          </p>
        </div>
      </div>
    </div>
  );
}
