import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";


export const metadata = getSEOTags({
  title: `Terms and Conditions | ${config.appName}`,
  canonicalUrlRelative: "/tos",
});

const TOS = () => {
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <Link href="/" className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Terms and Conditions for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: January 26, 2025

Welcome to Dryft!

These Terms of Service ("Terms") govern your use of the Dryft website at https://dryftsportspools.com ("Website") and the services provided by Dryft. By using our Website and services, you agree to these Terms.

1. Description of Dryft

Dryft is a fantasy sports platform that allows users to create and manage pools, participate in drafts, and track standings for various sporting events.

2. Ownership and Usage Rights

When you create a pool on Dryft, you gain access to drafting and pool management tools.
Pool access beyond the draft, including standings and scoring updates, requires a payment by the commissioner.
Users may not resell, redistribute, or misuse any part of Dryft’s software or services.

3. User Data and Privacy

We collect and store user data, including name, email, and payment information, to provide our services.
For details on how we handle your data, please refer to our Privacy Policy at https://dryftplay.com/privacy-policy.

4. Non-Personal Data Collection

We use web cookies to collect non-personal data for the purpose of improving our services and user experience.

5. Payments and Refund Policy

Payments for premium league features are processed securely via Stripe.
All sales are final, and no refunds will be issued after payment is made.

6. Governing Law

These Terms are governed by the laws of the United States.

7. Updates to the Terms

We may update these Terms from time to time. Users will be notified of any changes via email.

For any questions or concerns regarding these Terms of Service, please contact us at ${config.resend.supportEmail}.

Thank you for using Dryft!`}
        </pre>
      </div>
    </main>
  );
};

export default TOS;
