import React from "react";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/layout/PageHero";
import { LegalDocument, P, H3, UL, Table, A, type LegalSectionDef } from "@/components/pages/legal/Legal";
import { getSiteSettings } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";
import { LEGAL } from "@/lib/legal";
import { SITE } from "@/lib/site";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How F.QUAD Studio collects, uses, stores and protects personal information shared through this website, and the rights you have over it.",
  path: "/privacy",
});

export default async function PrivacyPage() {
  const settings = await getSiteSettings().catch(() => null);
  const email = settings?.email || LEGAL.privacyEmail;

  const sections: LegalSectionDef[] = [
    {
      id: "who-we-are",
      title: "Who we are",
      children: (
        <>
          <P>
            This website is run by <strong className="text-white">{LEGAL.entityName}</strong>, trading as{" "}
            {LEGAL.brandName}, an architecture and interior design practice based in {SITE.city},{" "}
            {SITE.region}, India ({LEGAL.registrationNumber}). Registered office: {LEGAL.registeredAddress}.
          </P>
          <P>
            For the personal information described below, we are the “Data Fiduciary” under India’s Digital
            Personal Data Protection Act, 2023 (the “DPDP Act”), and the person responsible for it under the
            Information Technology Act, 2000 and the rules made under it. In this policy, “we”, “us” and “our”
            mean the studio; “you” means anyone who visits the website or contacts us through it.
          </P>
        </>
      ),
    },
    {
      id: "what-we-collect",
      title: "Information we collect",
      children: (
        <>
          <H3>What you give us</H3>
          <Table
            head={["When", "What we receive"]}
            rows={[
              [
                "You send a message through the Contact form",
                "Name, email address, phone number, your message, and whether you prefer to be reached on WhatsApp.",
              ],
              [
                "You submit a “Start a project” brief",
                "Name, email, phone, WhatsApp preference; project type, area (sq. ft.), location, current stage, approximate timeline and budget range; any notes you write; and any plan file you attach (PDF, JPG, PNG, DWG or DXF, up to 30 MB).",
              ],
              [
                "You email, call, WhatsApp or message us",
                "Your contact details and whatever you choose to tell us, including site photographs, drawings or references you send.",
              ],
              [
                "You agree to feature in our work",
                "Your name, your project name, your words and, where you agree, photographs of the space — published only with your permission.",
              ],
            ]}
          />
          <P>
            Plans and site details can reveal where you live or own property. Please share only what you are
            comfortable with; we do not ask for government IDs, bank or card details, or any sensitive
            category of data through this website, and you should not send them.
          </P>

          <H3>What is collected automatically</H3>
          <P>
            Like most websites, the server that delivers these pages records basic technical data in its
            logs — your IP address, the pages and files requested, date and time, browser and device type
            and the referring page. We use it to keep the site working, to investigate faults and abuse, and
            to understand overall load. We do not use advertising or third-party analytics tracking on this
            website at the date above.
          </P>
          <P>
            A few small items are saved in your browser to make the site behave; they are listed in{" "}
            <a href="#cookies" className="underline underline-offset-4">
              Cookies and similar technologies
            </a>
            .
          </P>
        </>
      ),
    },
    {
      id: "how-we-use",
      title: "How and why we use it",
      children: (
        <>
          <P>
            We process your information on the basis of your consent — given when you submit a form or
            contact us — or where the DPDP Act permits it without consent, such as to respond to something you
            asked us to do, to comply with the law, or to protect against fraud and misuse. We use it to:
          </P>
          <UL>
            <li>reply to your message or project brief and arrange a consultation;</li>
            <li>assess whether and how we can help, and prepare proposals and estimates;</li>
            <li>
              send you a confirmation and follow-up about your enquiry, by email, phone or WhatsApp as you
              have indicated;
            </li>
            <li>run the project once you become a client (under a separate written agreement);</li>
            <li>keep records we are legally required to keep, such as tax and accounting records;</li>
            <li>secure, maintain and improve this website; and</li>
            <li>establish, exercise or defend legal claims.</li>
          </UL>
          <P>
            We do not sell your personal information, and we do not use it for automated decisions that
            affect you. We will not send you marketing messages unless you have asked for them or the law
            allows it, and you can opt out at any time.
          </P>
        </>
      ),
    },
    {
      id: "cookies",
      title: "Cookies and similar technologies",
      children: (
        <>
          <P>
            This website does not set advertising or tracking cookies. It stores the following in your
            browser:
          </P>
          <Table
            head={["Name", "Purpose", "Lifetime"]}
            rows={[
              [
                <code key="t">fq-theme</code>,
                "Remembers your light/dark appearance choice (local storage).",
                "Until you clear site data",
              ],
              [
                <code key="i">fq-intro</code>,
                "Remembers that the opening animation has played so it does not repeat on every page (session storage).",
                "Until you close the tab",
              ],
              [
                <code key="s">fquad_admin_session</code>,
                "A secure, HTTP-only sign-in cookie. Set only for studio staff who log in to the administration area; visitors never receive it.",
                "Up to 7 days",
              ],
            ]}
          />
          <P>
            These are strictly necessary for the site to work as you expect, so they are not switched on by a
            consent banner. If we later add analytics or marketing tools, we will update this section and
            ask for your consent first where the law requires it.
          </P>
          <P>
            The Contact page embeds a Google map. When that map loads, Google receives your IP address and
            browser details and may set its own cookies, under{" "}
            <A href="https://policies.google.com/privacy">Google’s privacy policy</A>. You can block it in
            your browser settings; the rest of the site will keep working.
          </P>
        </>
      ),
    },
    {
      id: "sharing",
      title: "Who we share it with",
      children: (
        <>
          <P>
            Your information is handled by our team. We share it with others only as far as needed, and only
            with organisations that are bound to protect it:
          </P>
          <Table
            head={["Recipient", "Why"]}
            rows={[
              [
                "Resend (email delivery service)",
                "Delivers the notification we receive and the confirmation email you receive when you submit a form.",
              ],
              [
                LEGAL.hostingProvider,
                "Hosts the website, our database of enquiries and the files you upload.",
              ],
              [
                "Google (Google Maps)",
                "Displays the studio location on the Contact page, as described above.",
              ],
              [
                "WhatsApp / Meta and Instagram",
                "Only if you choose to message us on WhatsApp or follow our Instagram link — those services then handle your data under their own policies.",
              ],
              [
                "Consultants, engineers and contractors",
                "Only for a project you have engaged us on, and with your knowledge, so that they can do the work.",
              ],
              [
                "Professional advisers, auditors, courts, regulators and law-enforcement bodies",
                "Where the law requires it, or to protect our legal rights.",
              ],
            ]}
          />
          <P>
            If the studio is restructured, merged or sold, your information may pass to the successor, who
            will be bound by this policy.
          </P>
        </>
      ),
    },
    {
      id: "transfers",
      title: "Transfers outside India",
      children: (
        <P>
          Some of the providers above (for example, our email delivery service) may process data on servers
          outside India. The DPDP Act allows this except to countries the Government of India restricts. We
          choose providers that apply appropriate safeguards, and we send them only the information needed
          for the service.
        </P>
      ),
    },
    {
      id: "retention",
      title: "How long we keep it",
      children: (
        <>
          <UL>
            <li>
              <strong className="text-white">Enquiries that do not lead to a project:</strong> up to{" "}
              {LEGAL.retention.unconvertedEnquiryMonths} months from the last contact, then deleted or
              anonymised.
            </li>
            <li>
              <strong className="text-white">Uploaded plans and site material:</strong> until your enquiry is
              closed, or until the project ends if we work together; you can ask us to delete them sooner.
            </li>
            <li>
              <strong className="text-white">Client and project records:</strong> for as long as the project
              runs and afterwards for up to {LEGAL.retention.clientRecordsYears} years, or longer where tax,
              accounting or other law requires.
            </li>
            <li>
              <strong className="text-white">Server logs:</strong> kept for the short period set by our hosting
              provider, then overwritten.
            </li>
          </UL>
          <P>
            We delete information earlier when you withdraw consent or ask us to erase it, unless the law
            requires us to keep it.
          </P>
        </>
      ),
    },
    {
      id: "security",
      title: "How we protect it",
      children: (
        <P>
          We take reasonable security measures: the site is served over an encrypted (HTTPS) connection,
          enquiries are stored in a database reachable only through a password-protected administration
          area, staff passwords are stored hashed, and access is limited to the people who need it. No
          system is perfectly secure, and we cannot guarantee absolute security. If a personal data breach
          affects you, we will notify you and the Data Protection Board of India as the law requires.
        </P>
      ),
    },
    {
      id: "your-rights",
      title: "Your rights",
      children: (
        <>
          <P>Under the DPDP Act you have the right to:</P>
          <UL>
            <li>ask for a summary of the personal data we hold about you and how we use and share it;</li>
            <li>ask us to correct, complete or update it;</li>
            <li>ask us to erase it, where it is no longer needed for the purpose or required by law;</li>
            <li>withdraw your consent at any time — it will not affect what we lawfully did before;</li>
            <li>have your complaint heard by us, and then by the Data Protection Board of India; and</li>
            <li>nominate another person to exercise these rights if you die or become incapacitated.</li>
          </UL>
          <P>
            To exercise any of them, email <A href={`mailto:${email}`}>{email}</A>. We may ask you to
            confirm your identity first. We aim to reply within {LEGAL.grievanceResponseDays} days. If you are
            in the European Economic Area or the United Kingdom, you may also have rights under the GDPR or UK
            GDPR; write to us and we will honour them to the extent they apply.
          </P>
        </>
      ),
    },
    {
      id: "children",
      title: "Children",
      children: (
        <P>
          This website is for adults who are planning a building or interior project. It is not directed at
          anyone under 18, and we do not knowingly collect their personal data. If you believe a child has
          sent us information, tell us and we will delete it.
        </P>
      ),
    },
    {
      id: "links",
      title: "Other websites",
      children: (
        <P>
          Our pages link to other sites and services, including Instagram and WhatsApp. We do not control
          them and are not responsible for their privacy practices. Please read their policies.
        </P>
      ),
    },
    {
      id: "changes",
      title: "Changes to this policy",
      children: (
        <P>
          We may update this policy as our practice or the law changes. The date at the top shows the latest
          version. If a change materially affects how we use your information, we will make it prominent on
          the site or contact you directly.
        </P>
      ),
    },
    {
      id: "contact",
      title: "Contact and grievances",
      children: (
        <>
          <P>
            Questions, requests or complaints about your personal data go to our Grievance Officer:
          </P>
          <UL>
            <li>{LEGAL.grievanceOfficerName}</li>
            <li>
              Email: <A href={`mailto:${email}`}>{email}</A>
            </li>
            <li>Address: {settings?.address || LEGAL.registeredAddress}</li>
          </UL>
          <P>
            If we have not resolved your concern, you may complain to the Data Protection Board of India once
            it is operational.
          </P>
        </>
      ),
    },
  ];

  return (
    <PageShell>
      <PageHero
        eyebrow="Legal"
        title={"Privacy\nPolicy"}
        crumbs={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
        art="none"
      />
      <LegalDocument
        updated={LEGAL.lastUpdated}
        intro={
          <P>
            Your brief tells us about your land, your home or your business. This policy explains, in plain
            words, what we collect when you use this website, why, who sees it, how long we keep it and what
            you can do about it.
          </P>
        }
        sections={sections}
      />
    </PageShell>
  );
}
