import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Privacy Policy | ${config.appName}`,
  canonicalUrlRelative: "/privacy-policy",
});

const PrivacyPolicy = () => {
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
          </svg>{" "}
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Privacy Policy for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: January 26, 2025

Thank you for using Dryft ("we," "us," or "our"). This Privacy Policy outlines how we collect, use, and protect your personal and non-personal information when you use our website located at ${config.domainName} (the "Website").

By accessing or using the Website, you agree to the terms of this Privacy Policy. If you do not agree with the practices described in this policy, please do not use the Website.

1. Information We Collect

1.1 Personal Data

We collect the following personal information from you:

- Name: To personalize your experience and identify users within leagues.
- Email: To manage account registration, login authentication, and communication.
- Payment Information: To process league fees and purchases securely. Payments are processed by trusted third-party providers like Stripe.

1.2 Non-Personal Data

We may collect non-personal data through web cookies and analytics tools, including:
- IP address, browser type, and device information
- Usage patterns and website interactions

This helps us enhance the user experience and improve our services.

2. Purpose of Data Collection

We collect and use your data for the following purposes:
- Managing user accounts and authentication
- Facilitating league creation and participation
- Processing payments for league access
- Improving website performance and security

3. Data Sharing

We do not sell or share your personal data with third parties, except:
- With payment processors (e.g., Stripe) for transaction processing.
- If required by law or legal processes.

4. Children's Privacy

Dryft is not intended for children under 13. We do not knowingly collect data from minors. If you believe a child has provided personal data, please contact us immediately.

5. Updates to the Privacy Policy

We may update this Privacy Policy periodically. Any changes will be posted on this page, and we may notify users via email for significant updates.

6. Contact Information

If you have any questions or concerns about this Privacy Policy, contact us at:

Email: ${config.resend.supportEmail}

By using Dryft, you consent to the terms of this Privacy Policy.`}
        </pre>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
