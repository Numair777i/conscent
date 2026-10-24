import { NextResponse } from "next/server";
import { Resend } from "resend";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SubscriberDoc {
  email: string;
  isVerified?: boolean;
  status?: string;
  unsubscribed?: boolean;
  unsubscribeToken?: string;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as { role?: string } | undefined)?.role;

    if (!session || userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, headline, content, ctaText, ctaLink, testEmailOnly } =
      await req.json();

    if (!subject || !headline || !content) {
      return NextResponse.json(
        { error: "Subject, headline, and content are required." },
        { status: 400 },
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://www.conscentfragrances.com";

    const createHtml = (unsubUrl: string) => `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:40px 16px;background-color:#0c0a09;font-family:sans-serif;color:#f5f5f4;">
        <table align="center" width="100%" style="max-width:600px;border:1px solid #292524;background-color:#1c1917;padding:32px;">
          <tr>
            <td align="center" style="padding-bottom:24px;border-bottom:1px solid #292524;">
              <h2 style="letter-spacing:0.3em;text-transform:uppercase;color:#fafaf9;margin:0;">CONSCENT</h2>
              <p style="font-size:10px;letter-spacing:0.2em;color:#a8a29e;margin:6px 0 0 0;">ARTISAN PERFUMERY &bull; NEW DELHI</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 0 24px 0;">
              <h1 style="font-size:20px;letter-spacing:0.05em;color:#fafaf9;line-height:1.4;margin:0 0 16px 0;">${headline}</h1>
              <div style="font-size:14px;line-height:1.7;color:#d6d3d1;white-space:pre-line;">${content}</div>
              ${
                ctaLink && ctaText
                  ? `<div style="margin-top:28px;"><a href="${ctaLink}" style="background-color:#f5f5f4;color:#0c0a09;padding:12px 24px;font-size:11px;font-weight:bold;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;display:inline-block;">${ctaText}</a></div>`
                  : ""
              }
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:24px;border-top:1px solid #292524;font-size:11px;color:#78716c;">
              <p style="margin:0 0 8px 0;">You received this private dispatch as a patron of CONSCENT.</p>
              <a href="${unsubUrl}" style="color:#a8a29e;text-decoration:underline;">Unsubscribe</a>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // 1. Test Mode (sends directly to test address)
    if (testEmailOnly) {
      const unsubUrl = `${baseUrl}/api/newsletter/unsubscribe?token=test`;
      const { data, error } = await resend.emails.send({
        from: "CONSCENT Atelier <dispatch@news.conscentfragrances.com>",
        replyTo: "support@conscentfragrances.com",
        to: testEmailOnly,
        subject: `[TEST] ${subject}`,
        html: createHtml(unsubUrl),
        text: `${headline}\n\n${content}\n\nUnsubscribe: ${unsubUrl}`,
        headers: { "List-Unsubscribe": `<${unsubUrl}>` },
      });

      if (error) return NextResponse.json({ error }, { status: 500 });
      return NextResponse.json({ success: true, mode: "test", id: data?.id });
    }

    // 2. Production Bulk Dispatch
    const client = await clientPromise;
    const db = client.db();

    const subscribers = await db
      .collection<SubscriberDoc>("subscribers")
      .find({
        $or: [{ status: "active" }, { isVerified: true }],
        unsubscribed: { $ne: true },
      })
      .toArray();

    if (!subscribers.length) {
      return NextResponse.json({ message: "No active subscribers found." });
    }

    const emails = subscribers.map((sub) => {
      const token = sub.unsubscribeToken || "direct";
      const unsubUrl = `${baseUrl}/api/newsletter/unsubscribe?token=${token}&email=${encodeURIComponent(sub.email)}`;
      return {
        from: "CONSCENT Atelier <dispatch@news.conscentfragrances.com>",
        replyTo: "support@conscentfragrances.com",
        to: sub.email,
        subject,
        html: createHtml(unsubUrl),
        text: `${headline}\n\n${content}\n\nUnsubscribe: ${unsubUrl}`,
        headers: { "List-Unsubscribe": `<${unsubUrl}>` },
      };
    });

    const chunkSize = 100;
    for (let i = 0; i < emails.length; i += chunkSize) {
      await resend.batch.send(emails.slice(i, i + chunkSize));
    }

    return NextResponse.json({ success: true, count: emails.length });
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
