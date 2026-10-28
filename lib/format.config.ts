/**
 * format.config.ts
 *
 * UNIFIED COLLEGE DOCUMENT FORMAT SPECIFICATION
 * Single configuration for all formal college documents in WisprScribe.
 * Strictly adheres to Zero-Invention Rules.
 */

export interface CollegeProfile {
  name: string;
  status: string;
  affiliations: string[];
  address: string;
  phone: string;
  email: string;
  website: string;
  departmentDefault: string;
  clubDefault: string;
  logoLeftSvg?: string;
  logoRightSvg?: string;
}

export interface Signatory {
  role: string;
  designation: string; // Bold uppercase, e.g. "STUDENT COORDINATOR", "FACULTY IN-CHARGE", "HEAD OF THE DEPARTMENT", "PRINCIPAL"
  name?: string;
  detail?: string;
}

export interface DocumentApprovalChain {
  permission: Signatory[];
  report: Signatory[];
  sanction: Signatory[];
}

export const DEFAULT_COLLEGE_PROFILE: CollegeProfile = {
  name: "CMR TECHNICAL CAMPUS",
  status: "(UGC Autonomous Institution)",
  affiliations: [
    "Approved by AICTE, New Delhi • Affiliated to Recognized State University",
    "Accredited by NBA & NAAC with 'A+' Grade",
  ],
  address: "Kandlakoya, Medchal Road, Hyderabad, Telangana - 501401",
  phone: "+91 8418 200037",
  email: "info@cmrtc.ac.in",
  website: "www.cmrtc.ac.in",
  departmentDefault: "Department of Computer Science & Engineering (AI & ML)",
  clubDefault: "AI CLUB",
};

export const STANDARD_STYLES = {
  fontFamily: {
    pdf: "Times-Roman",
    docx: "Times New Roman",
    web: "'Times New Roman', Times, 'Tinos', serif",
  },
  fontSizes: {
    letterheadTitle: 16,
    letterheadSubtitle: 9.5,
    letterheadMeta: 8.5,
    deptClubLine: 12,
    metaRow: 11,
    body: 12,
    table: 11,
    subLine: 12,
    footer: 9,
    runningHeader: 8.5,
  },
  lineHeight: 1.5,
  color: "#000000",
  margins: {
    top: 72, // 1 inch = 72 pt
    bottom: 72,
    left: 72,
    right: 72,
  },
};

/**
 * Format missing field placeholder according to the trust rule:
 * Missing fields render as highlighted "[To be confirmed: <field>]"
 */
export function formatPlaceholder(fieldName: string): string {
  return `[To be confirmed: ${fieldName}]`;
}

/**
 * Helper to get clean string or placeholder
 */
export function resolveField(
  value: string | number | null | undefined,
  fieldLabel: string,
  isOptional: boolean = false
): { text: string; isMissing: boolean } {
  if (value === null || value === undefined || String(value).trim() === "") {
    if (isOptional) {
      return { text: "", isMissing: true };
    }
    return { text: formatPlaceholder(fieldLabel), isMissing: true };
  }
  return { text: String(value).trim(), isMissing: false };
}
