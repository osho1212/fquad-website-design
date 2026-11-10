import React from "react";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/layout/PageHero";
import { LegalDocument, P, UL, A, type LegalSectionDef } from "@/components/pages/legal/Legal";
import { getSiteSettings } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";
import { LEGAL } from "@/lib/legal";
import { SITE } from "@/lib/site";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Terms & Conditions",
  description:
    "The terms on which you may use the F.QUAD Studio website and submit enquiries, project briefs and files to us.",
  path: "/terms",
});

export default async function TermsPage() {
  const settings = await getSiteSettings().catch(() => null);
  const email = settings?.email || LEGAL.privacyEmail;

  const privacyLink = (
    <Link href="/privacy" className="text-white underline underline-offset-4 decoration-white/40 hover:decoration-white">
      Privacy Policy
    </Link>
  );

  const sections: LegalSectionDef[] = [
    {
      id: "about",
      title: "About these terms",
      children: (
        <>
          <P>
            These terms govern your use of this website, operated by{" "}
            <strong className="text-white">{LEGAL.entityName}</strong>, trading as {LEGAL.brandName} (“we”,
            “us”), {LEGAL.registrationNumber}, with its registered office at {LEGAL.registeredAddress}. By
            using the website or submitting anything through it, you agree to them. If you do not agree,
            please do not use the website.
          </P>
          <P>
            These terms cover the website only. Our architecture and interior design services are provided
            under a separate written agreement, which prevails over these terms if the two conflict.
          </P>
        </>
      ),
    },
    {
      id: "enquiries",
      title: "Enquiries do not create a contract",
      children: (
        <>
          <P>
            Sending a message or a “Start a project” brief is an invitation to talk, not an order. We
            may decline an enquiry, and nothing on this website or in our replies — including any estimate,
            budget range, timeline or scope discussed informally — is a binding offer.
          </P>
          <P>
            A client relationship begins only when both parties sign a written proposal or agreement setting
            out the scope of work, fees, payment schedule, timelines, responsibilities and ownership of the
            work. Until then, no services are owed and no fees are payable by either side.
          </P>
        </>
      ),
    },
    {
      id: "information",
      title: "Information on this website",
      children: (
        <>
          <P>
            The website showcases our past work and describes our services. It is provided for general
            information and is not professional advice for your particular site or project.
          </P>
          <UL>
            <li>
              Images, renders, videos and 3D visuals are illustrative. Finished spaces depend on the site,
              materials, budget, approvals and the client’s decisions, and may differ from what you see here.
            </li>
            <li>
              Budget bands, timelines and project figures shown on the site or in our form are indicative
              ranges, not quotations.
            </li>
            <li>
              Statements about awards, years of practice and number of projects reflect our records at the
              time of publication.
            </li>
            <li>
              Professional practice by our architects is subject to the Architects Act, 1972 and the Council of
              Architecture’s regulations; registration details: {LEGAL.coaRegistration}.
            </li>
          </UL>
          <P>
            We try to keep the site accurate and available, but we do not promise that it will be
            uninterrupted, error-free or complete.
          </P>
        </>
      ),
    },
    {
      id: "your-submissions",
      title: "What you send us",
      children: (
        <>
          <P>When you submit a form or upload a file, you confirm that:</P>
          <UL>
            <li>the details you give are accurate and you are entitled to give them;</li>
            <li>
              you own, or are authorised to share, any plans, drawings, photographs or other material you
              upload, and doing so does not infringe anyone’s rights or breach any confidentiality owed to a
              third party;
            </li>
            <li>
              uploads are limited to the file types the form accepts (PDF, JPG, PNG, DWG, DXF), up to 30 MB,
              and contain no malware, unlawful or offensive material.
            </li>
          </UL>
          <P>
            You keep ownership of what you send. You give us permission to use it, and to share it with
            consultants working with us at your request, to assess your enquiry and prepare a proposal. We
            treat your brief and plans as confidential and will not publish them or use them to promote the
            studio without your permission. How we handle personal data is described in our {privacyLink}.
          </P>
        </>
      ),
    },
    {
      id: "communications",
      title: "Being contacted",
      children: (
        <P>
          By giving us your email address and phone number, you agree that we may contact you about your
          enquiry by email, phone, SMS and WhatsApp, including where your number is registered on a Do Not
          Disturb list, because you have initiated the contact. You can ask us to stop at any time by telling
          us, or by replying “stop”.
        </P>
      ),
    },
    {
      id: "intellectual-property",
      title: "Intellectual property",
      children: (
        <>
          <P>
            All content on this website — designs, drawings, photographs, renders, videos, 3D scenes, text,
            logos, the F.QUAD name and mark, and the site’s code and layout — belongs to us or our licensors
            and is protected by copyright, trademark and other laws.
          </P>
          <P>
            You may view the site and share its pages by link for personal, non-commercial purposes. You
            may not copy, reproduce, adapt, distribute, scrape or use our content or project imagery —
            including to train an AI model — or present our work as your own, without our written
            permission.
          </P>
          <P>
            The designs and drawings we prepare for a client remain our work. Who owns them, and what the
            client may do with them, is set out in the project agreement; unless that agreement says
            otherwise, the Copyright Act, 1957 applies.
          </P>
        </>
      ),
    },
    {
      id: "acceptable-use",
      title: "Acceptable use",
      children: (
        <>
          <P>You agree not to:</P>
          <UL>
            <li>use the site for anything unlawful, fraudulent or misleading;</li>
            <li>
              attempt to gain unauthorised access to the site, the administration area, our servers or any
              connected system, or probe or test their security without our written consent;
            </li>
            <li>
              introduce viruses or harmful code, or overload the site with automated requests or scraping;
            </li>
            <li>submit spam, bulk or false enquiries; or</li>
            <li>impersonate another person or misrepresent your connection with us.</li>
          </UL>
          <P>
            We may block access, remove submissions or report conduct to the authorities if we believe these
            rules have been broken.
          </P>
        </>
      ),
    },
    {
      id: "third-parties",
      title: "Third-party links and services",
      children: (
        <P>
          The site links to or embeds services we do not control, such as Google Maps, Instagram and
          WhatsApp. They are subject to their own terms and policies. We are not responsible for their
          content, availability or practices, and a link is not an endorsement.
        </P>
      ),
    },
    {
      id: "disclaimer",
      title: "Disclaimer and limits of liability",
      children: (
        <>
          <P>
            The website is provided “as is” and “as available”. To the fullest extent the law allows, we
            exclude all warranties about it, express or implied, and we are not liable for any loss arising
            from your use of, or inability to use, the site or from relying on its content — including
            indirect, incidental or consequential loss, loss of profit, data or opportunity.
          </P>
          <P>
            Where liability cannot be excluded, our total liability in connection with the website is
            limited to {LEGAL.websiteLiabilityCap}. Nothing in these terms limits liability for fraud, death or personal injury
            caused by negligence, or anything else that cannot lawfully be limited. Liability under a
            project agreement is governed by that agreement.
          </P>
          <P>
            You agree to compensate us for loss we suffer because you breached these terms, including by
            uploading material you had no right to share.
          </P>
        </>
      ),
    },
    {
      id: "changes",
      title: "Changes to the site and these terms",
      children: (
        <P>
          We may change, suspend or withdraw any part of the website at any time, and we may update these
          terms. The date at the top shows the current version; continued use after a change means you accept
          it.
        </P>
      ),
    },
    {
      id: "law",
      title: "Governing law and disputes",
      children: (
        <>
          <P>
            These terms are governed by the laws of India. If a dispute arises, please write to us first so
            that we can try to settle it in good faith. If it cannot be settled, the courts at{" "}
            {LEGAL.jurisdictionCity}, {LEGAL.jurisdictionState} have exclusive jurisdiction, subject to any
            different dispute-resolution clause in a signed project agreement.
          </P>
          <P>
            If any part of these terms is held unenforceable, the rest remains in force. A delay in
            enforcing a right is not a waiver of it. These terms, with our {privacyLink}, are the whole
            agreement between you and us about the website.
          </P>
        </>
      ),
    },
    {
      id: "contact",
      title: "Contact",
      children: (
        <>
          <P>Questions about these terms:</P>
          <UL>
            <li>{LEGAL.brandName}</li>
            <li>{settings?.address || LEGAL.registeredAddress || SITE.fallback.address}</li>
            <li>
              <A href={`mailto:${email}`}>{email}</A>
            </li>
          </UL>
        </>
      ),
    },
  ];

  return (
    <PageShell>
      <PageHero
        eyebrow="Legal"
        title={"Terms &\nConditions"}
        crumbs={[{ label: "Home", href: "/" }, { label: "Terms & Conditions" }]}
        art="none"
      />
      <LegalDocument
        updated={LEGAL.lastUpdated}
        intro={
          <P>
            Please read these terms before using the website or sending us a project brief. They are short on
            purpose: they set out what the website is for, what you can expect from us, and what we expect
            from you.
          </P>
        }
        sections={sections}
      />
    </PageShell>
  );
}
