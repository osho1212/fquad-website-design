import { SITE } from "./site";

/**
 * Facts the Privacy Policy and Terms quote. One place, so a fact is filled in
 * once and both documents stay in step.
 *
 * Every value that still reads "[CONFIRM: …]" is a gap only the studio can
 * fill (legal name, registration numbers, officer names…). Replace each one
 * before the pages go live — `npm run legal:check` style grep:
 *   grep -rn "CONFIRM:" lib/legal.ts app/privacy app/terms
 */
export const LEGAL = {
  /** Date shown at the top of both documents. Bump it on every material change. */
  lastUpdated: "10 November 2026",

  /** The contracting / data-fiduciary entity — not just the brand name. */
  entityName: "[CONFIRM: registered legal name, e.g. F.QUAD Studio LLP / F.QUAD Design Pvt. Ltd.]",
  brandName: SITE.name,
  registeredAddress: "[CONFIRM: registered office address, Hyderabad, Telangana, India]",
  /** CIN / LLPIN / partnership or proprietorship registration. */
  registrationNumber: "[CONFIRM: CIN / LLPIN / registration no.]",
  /** Council of Architecture registration of the practice's principal architect(s). */
  coaRegistration: "[CONFIRM: Council of Architecture registration no(s). of the principal architects]",

  /** Privacy contact — also the DPDP Act "grievance officer". */
  privacyEmail: SITE.fallback.email,
  grievanceOfficerName: "[CONFIRM: name and designation of Grievance Officer]",
  grievanceResponseDays: 30,

  /** Hosting / infrastructure providers named in the Privacy Policy. */
  hostingProvider: "[CONFIRM: hosting provider and region, e.g. Vercel / AWS Mumbai]",

  /** Retention periods quoted in the Privacy Policy. */
  retention: {
    unconvertedEnquiryMonths: 24,
    clientRecordsYears: 8,
  },

  /** Cap on liability arising from use of the website itself (not project work). */
  websiteLiabilityCap: "[CONFIRM: amount, e.g. ₹10,000 — ask your lawyer]",

  /** Where disputes are heard. */
  jurisdictionCity: "Hyderabad",
  jurisdictionState: "Telangana",
} as const;
