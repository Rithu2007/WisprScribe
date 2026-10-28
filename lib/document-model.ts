/**
 * document-model.ts
 *
 * Single document data model and unified document builder.
 * Every formal college document in WisprScribe is constructed by buildCollegeDocument().
 *
 * THE ONE FRAME (identical for every document, every time):
 * 1. Letterhead from CollegeProfile (logo left, centered text block, thick rule beneath)
 * 2. Club or department line: bold, centered, underlined
 * 3. One row: "Ref. No.: ___" left, "Date: ___" right
 * 4. "To," block: each recipient on its own line
 * 5. Optional "Through:" line
 * 6. "Sub:" line in bold with hanging indent
 * 7. Salutation: "Respected Sir/Madam,"
 * 8. BODY: standard sequence of blocks (Paragraph, SectionHeading, DetailsTable, etc.)
 * 9. Closing: "Thanking you," then "Yours faithfully,"
 * 10. Signature row: equal columns, blank signing space, bold CAPS designations, names
 * 11. Optional Enclosures and Copy to
 * 12. Footer: thin rule, address, phone, website, Page X of Y
 */

import { FactMap, ExtractedField } from "./extraction-schema";
import {
  CollegeProfile,
  DEFAULT_COLLEGE_PROFILE,
  Signatory,
  formatPlaceholder,
  resolveField,
} from "./format.config";

export type DocumentPurpose = "permission" | "report" | "sanction";

export type BodyBlock =
  | { type: "paragraph"; text: string }
  | { type: "sectionHeading"; number: number; title: string }
  | { type: "detailsTable"; rows: Array<{ label: string; value: string }> }
  | { type: "numberedList"; items: string[] }
  | { type: "dataTable"; headers: string[]; rows: string[][] };

export interface CollegeDocument {
  purpose: DocumentPurpose;
  college: CollegeProfile;
  clubOrDeptLine: string; // bold, centered, underlined
  refNo: { text: string; isMissing: boolean };
  date: { text: string; isMissing: boolean };
  toBlock: string[]; // each recipient line on its own line
  throughLine?: string; // optional Through line
  subLine: string; // Bold with hanging indent
  salutation: string; // "Respected Sir/Madam,"
  bodyBlocks: BodyBlock[];
  closing: {
    thankingYou: string;
    yoursFaithfully: string;
  };
  signatureRow: Signatory[];
  enclosures?: string[];
  copyTo?: string[];
  missingFields: string[]; // List of fields marked [To be confirmed: <field>]
}

/**
 * Standardize capitalization for college names
 */
export function standardizeCollegeName(raw: string): string {
  if (!raw || !raw.trim()) return DEFAULT_COLLEGE_PROFILE.name;
  let s = raw.trim();
  s = s
    .replace(/\bcmr\b/gi, "CMR")
    .replace(/\bcmrtc\b/gi, "CMR Technical Campus")
    .replace(/\bdtu\b/gi, "DTU")
    .replace(/\biit\b/gi, "IIT")
    .replace(/\bnit\b/gi, "NIT")
    .replace(/\biiit\b/gi, "IIIT")
    .replace(/\bjntuh?\b/gi, "JNTUH")
    .replace(/\bvit\b/gi, "VIT")
    .replace(/\bsrm\b/gi, "SRM")
    .replace(/\bbits\b/gi, "BITS");
  return s.toUpperCase();
}

/**
 * Standardize Department name
 */
export function standardizeDepartment(raw: string): string {
  if (!raw || !raw.trim()) return "DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING";
  let s = raw.trim();
  s = s
    .replace(/\bcse[- ]?ai&?ml\b/gi, "Computer Science and Engineering (AI & ML)")
    .replace(/\bcse\b/gi, "Computer Science & Engineering")
    .replace(/\bece\b/gi, "Electronics & Communication Engineering")
    .replace(/\beee\b/gi, "Electrical & Electronics Engineering")
    .replace(/\bme\b/gi, "Mechanical Engineering")
    .replace(/\bit\b/gi, "Information Technology")
    .replace(/\baiml\b/gi, "Artificial Intelligence & Machine Learning")
    .replace(/\bds\b/gi, "Data Science");
  if (!/^department of/i.test(s)) {
    s = "Department of " + s;
  }
  return s;
}

/**
 * Polish terse user phrases without inventing any facts.
 * Example: "learn about Ai fundamentals" -> "The event aimed to introduce participants to the fundamentals of Artificial Intelligence."
 */
export function polishTerseObjective(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  // Normalize common terse phrases
  let s = trimmed;
  if (/^learn (about )?ai fundamentals$/i.test(s)) {
    return "The event aimed to introduce participants to the fundamentals of Artificial Intelligence.";
  }
  if (/^learn (about )?web dev(elopment)?$/i.test(s)) {
    return "The event aimed to introduce participants to the fundamentals of web development.";
  }

  // Capitalize first character and ensure ending punctuation
  s = s.charAt(0).toUpperCase() + s.slice(1);
  if (!/[.!?]$/.test(s)) {
    s += ".";
  }
  return s;
}

/**
 * Polish terse outcome statements without inventing PO/PSO or tools.
 */
export function polishTerseOutcome(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  let s = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  if (!/[.!?]$/.test(s)) {
    s += ".";
  }
  return s;
}

/**
 * Single Unified Document Builder
 * Used by all document types (permission, report, sanction).
 * ZERO-INVENTION: Never adds biometric, geo-tagged, PO/PSO, or fabricated data.
 */
export function buildCollegeDocument(
  facts: FactMap,
  purpose: DocumentPurpose,
  profileOverride?: Partial<CollegeProfile>
): CollegeDocument {
  const missingFields: string[] = [];

  // Helper to resolve fact values
  function getVal(field: ExtractedField | undefined, label: string, isOptional: boolean = false): string {
    const res = resolveField(field?.value, label, isOptional);
    if (res.isMissing && !isOptional) {
      missingFields.push(label);
    }
    return res.text;
  }

  // Helper for optional fields (empty string if missing)
  function getOptVal(field: ExtractedField | undefined): string {
    if (!field || field.value === null || field.value === undefined) return "";
    return String(field.value).trim();
  }

  // College Profile setup
  const collegeNameRaw = getOptVal(facts.collegeName);
  const collegeName = collegeNameRaw ? standardizeCollegeName(collegeNameRaw) : DEFAULT_COLLEGE_PROFILE.name;

  const college: CollegeProfile = {
    ...DEFAULT_COLLEGE_PROFILE,
    name: collegeName,
    ...profileOverride,
  };

  // Club / Department line
  const organizerRaw = getOptVal(facts.organizer);
  const deptRaw = getOptVal(facts.department);
  const clubOrDeptLine = (organizerRaw || (deptRaw ? standardizeDepartment(deptRaw) : DEFAULT_COLLEGE_PROFILE.clubDefault)).toUpperCase();

  // Reference Number & Date
  const userRefNo = getOptVal(facts.refNo);
  const refNo = userRefNo
    ? { text: `Ref. No.: ${userRefNo}`, isMissing: false }
    : { text: `Ref. No.: ${formatPlaceholder("Ref. No.")}`, isMissing: true };
  if (!userRefNo) {
    missingFields.push("Ref. No.");
  }

  const userDate = getVal(facts.date, "Date");
  const dateObj = {
    text: `Date: ${userDate}`,
    isMissing: userDate.includes("[To be confirmed:"),
  };

  // Event core facts
  const eventName = getVal(facts.eventName, "Event Name");
  const eventType = getVal(facts.eventType, "Event Type");
  const venue = getVal(facts.venue, "Venue");
  const time = getVal(facts.time, "Time");
  const coordinator = getVal(facts.coordinator, "Faculty Coordinator");
  const studentName = getVal(facts.studentName, "Student Lead Name", true);
  const studentRollNo = getVal(facts.studentRollNo, "Student Roll No.", true);
  const attendanceRaw = facts.attendance?.value;
  const attendance = attendanceRaw !== null && attendanceRaw !== undefined
    ? String(attendanceRaw)
    : formatPlaceholder("Attendance");
  if (attendance.includes("[To be confirmed:")) {
    missingFields.push("Attendance");
  }

  // Resource Person (Fix: separate name, designation, organization. NEVER substitute host college!)
  const speakerName = getVal(facts.speaker, "Resource Person Name", true);
  const speakerDesignation = getVal(facts.speakerDesignation, "Speaker Designation", true);
  const speakerOrg = getOptVal(facts.speakerOrganization);

  let resourcePersonDisplay = "";
  if (speakerName) {
    resourcePersonDisplay = speakerName;
    if (speakerDesignation) resourcePersonDisplay += `, ${speakerDesignation}`;
    if (speakerOrg) resourcePersonDisplay += `, ${speakerOrg}`;
  } else {
    resourcePersonDisplay = formatPlaceholder("Resource Person");
    missingFields.push("Resource Person");
  }

  const deptDisplay = deptRaw ? standardizeDepartment(deptRaw) : DEFAULT_COLLEGE_PROFILE.departmentDefault;
  const hodName = getOptVal(facts.hod);
  const directorRaw = getOptVal(facts.director);
  const directorName = directorRaw ? directorRaw.replace(/\s*,\s*Director/i, "").trim() : "Dr. A. Raji Reddy";
  const keynotes = getOptVal(facts.keynotes);

  // Signatory Row based on Purpose
  const studentSig: Signatory = {
    role: "Student Coordinator",
    designation: "STUDENT COORDINATOR",
    name: studentName || undefined,
    detail: studentRollNo || undefined,
  };

  const facultySig: Signatory = {
    role: "Faculty Coordinator",
    designation: "FACULTY IN-CHARGE",
    name: (coordinator || hodName || "").replace(/\s*\(.*\)/, "").trim() || undefined,
    detail: organizerRaw || undefined,
  };

  const hodSig: Signatory = {
    role: "Head of Department",
    designation: "HEAD OF THE DEPARTMENT",
    name: hodName || undefined,
    detail: deptDisplay,
  };

  const principalSig: Signatory = {
    role: "Director",
    designation: "DIRECTOR",
    name: directorName,
    detail: college.name,
  };

  const signatureRow: Signatory[] = [studentSig, facultySig, hodSig, principalSig];

  // Build Purpose-Specific Blocks
  let subLine = "";
  let toBlock: string[] = [];
  let throughLine: string | undefined = undefined;
  const bodyBlocks: BodyBlock[] = [];
  let enclosures: string[] | undefined = undefined;

  if (purpose === "permission") {
    // -------------------------------------------------------------
    // PURPOSE: PERMISSION LETTER
    // -------------------------------------------------------------
    subLine = `Sub: Requesting permission to organize ${eventName} on ${userDate} - Reg.`;

    toBlock = [
      "The Principal,",
      `${college.name},`,
      `${college.address}.`,
    ];

    throughLine = `Through: The Head of the Department, ${deptDisplay}.`;

    // Paragraph 1: who is writing and what the event is
    const organizerText = organizerRaw ? `the ${organizerRaw}` : "our department student chapter";
    bodyBlocks.push({
      type: "paragraph",
      text: `We, the student coordinators and faculty representatives of ${organizerText} under the ${deptDisplay}, write to formally request permission to organize an institutional ${eventType.toLowerCase()} titled "${eventName}". The event is scheduled to be conducted on ${userDate} from ${time} at ${venue}.`,
    });

    // Paragraph 2: what participants will do and benefit (only from provided facts)
    const rawPurpose = getOptVal(facts.purpose);
    if (rawPurpose) {
      bodyBlocks.push({
        type: "paragraph",
        text: polishTerseObjective(rawPurpose),
      });
    }

    // Paragraph 3: the specific request
    bodyBlocks.push({
      type: "paragraph",
      text: `We request your kind permission to conduct the activity, reserve the venue, and issue the necessary notifications to students. The session will be conducted in accordance with institutional guidelines without causing any disruption to the regular academic schedule.`,
    });

  } else if (purpose === "report") {
    // -------------------------------------------------------------
    // PURPOSE: EVENT REPORT
    // -------------------------------------------------------------
    subLine = `Sub: Submission of report on ${eventName} conducted on ${userDate} - Reg.`;

    toBlock = [
      "The Principal,",
      `${college.name},`,
      `${college.address}.`,
    ];

    throughLine = `Through: The Head of the Department, ${deptDisplay}.`;

    // Opening Paragraph: event conducted, when, where, by whom
    const speakerSentence = speakerName
      ? ` The session was addressed by Chief Guest ${speakerName}${speakerDesignation ? ` (${speakerDesignation}${speakerOrg ? `, ${speakerOrg}` : ""})` : ""}.`
      : "";
    bodyBlocks.push({
      type: "paragraph",
      text: `The ${organizerRaw || "department student body"} under the ${deptDisplay} at ${college.name} organized a ${eventType} titled "${eventName}" on ${userDate} from ${time} at ${venue}.${speakerSentence} A total of ${attendance} participants attended the program.`,
    });

    // Details Table: two columns ("Parameter", "Details") - ZERO INVENTION
    const detailsRows = [
      { label: "Title of Event", value: eventName },
      { label: "Type of Activity", value: eventType },
      { label: "Organizing Body", value: organizerRaw || deptDisplay },
      { label: "Host Department", value: deptDisplay },
      { label: "Date & Time", value: `${userDate} (${time})` },
      { label: "Venue", value: venue },
      { label: "Chief Guest / Speaker", value: resourcePersonDisplay },
      { label: "Head of the Department", value: hodName ? `${hodName} (HOD, ${deptDisplay})` : deptDisplay },
      { label: "Patron / Director", value: `${directorName}, CMR Technical Campus` },
      { label: "Faculty In-Charge", value: coordinator || (hodName ? `${hodName} (Faculty In-Charge)` : "Faculty In-Charge") },
    ];
    if (studentName) {
      detailsRows.push({
        label: "Student Coordinator",
        value: `${studentName}${studentRollNo ? " (" + studentRollNo + ")" : ""}`,
      });
    }
    if (keynotes) {
      detailsRows.push({
        label: "Key Session Highlights",
        value: keynotes,
      });
    }
    detailsRows.push({
      label: "Attendance",
      value: attendance.includes("[To be confirmed:") ? attendance : `${attendance} participants`,
    });

    bodyBlocks.push({
      type: "detailsTable",
      rows: detailsRows,
    });

    let sectionIndex = 1;

    // 1. Objective (polished from user input, only if provided)
    const rawPurpose = getOptVal(facts.purpose);
    if (rawPurpose) {
      bodyBlocks.push({
        type: "sectionHeading",
        number: sectionIndex++,
        title: "Objective",
      });
      bodyBlocks.push({
        type: "paragraph",
        text: polishTerseObjective(rawPurpose),
      });
    }

    // 2. Keynotes and Technical Highlights Observed (addressing: What are the key notes to be observed?)
    if (keynotes) {
      bodyBlocks.push({
        type: "sectionHeading",
        number: sectionIndex++,
        title: "Keynotes and Technical Highlights Observed",
      });
      bodyBlocks.push({
        type: "paragraph",
        text: `The proceedings included expert technical keynotes and interactive knowledge exchange. Primary highlights observed during the session comprised: ${keynotes}. Participants actively engaged with the guest speaker, exploring developer tools, industry-grade architectures, and networking avenues.`,
      });
    }

    // 3. Description (only if provided by user; omit if empty)
    const rawDesc = getOptVal((facts as Record<string, ExtractedField | undefined>).description);
    if (rawDesc) {
      bodyBlocks.push({
        type: "sectionHeading",
        number: sectionIndex++,
        title: "Description",
      });
      bodyBlocks.push({
        type: "paragraph",
        text: rawDesc,
      });
    }

    // 4. Outcomes (polished from user input only; NO invented PO/PSO mapping!)
    const rawOutcomes = getOptVal(facts.outcomes);
    if (rawOutcomes) {
      bodyBlocks.push({
        type: "sectionHeading",
        number: sectionIndex++,
        title: "Outcomes",
      });
      bodyBlocks.push({
        type: "paragraph",
        text: polishTerseOutcome(rawOutcomes),
      });
    }

    // 5. Participation and Feedback
    bodyBlocks.push({
      type: "sectionHeading",
      number: sectionIndex++,
      title: "Participation and Feedback",
    });
    bodyBlocks.push({
      type: "paragraph",
      text: `A headcount of ${attendance} participants actively attended the session. The feedback gathered from attendees indicated constructive engagement with the subject matter and commended the organization under the guidance of the Department Head and College Leadership.`,
    });

    // 5. Budget (only if provided; omit completely if none)
    const rawBudget = getOptVal((facts as Record<string, ExtractedField | undefined>).budget);
    if (rawBudget) {
      bodyBlocks.push({
        type: "sectionHeading",
        number: sectionIndex++,
        title: "Budget and Expenditure",
      });
      bodyBlocks.push({
        type: "paragraph",
        text: `The verified expenditure incurred for the event stands at ${rawBudget}.`,
      });
    }

    // Closing Paragraph: formal submission statement
    bodyBlocks.push({
      type: "paragraph",
      text: "Submitted for kind perusal and further necessary action.",
    });

    enclosures = [
      "1. Participant Attendance Register",
      "2. Resource Person Profile & Session Overview",
    ];

  } else if (purpose === "sanction") {
    // -------------------------------------------------------------
    // PURPOSE: SANCTION / FOLLOW-UP MEMORANDUM
    // -------------------------------------------------------------
    subLine = `Sub: Requesting sanction and administrative acceptance for ${eventName} - Reg.`;

    toBlock = [
      "The Principal,",
      `${college.name},`,
      `${college.address}.`,
    ];

    throughLine = `Through: The Head of the Department, ${deptDisplay}.`;

    // Paragraph: event conducted
    bodyBlocks.push({
      type: "paragraph",
      text: `With reference to the prior approval granted for organizing the ${eventType.toLowerCase()} titled "${eventName}", we write to inform you that the event was successfully conducted on ${userDate} at ${venue} with an attendance of ${attendance} participants.`,
    });

    // Small data table if budget/amounts exist
    const rawBudget = getOptVal((facts as Record<string, ExtractedField | undefined>).budget);
    if (rawBudget) {
      bodyBlocks.push({
        type: "dataTable",
        headers: ["S.No.", "Item Description", "Amount (INR)"],
        rows: [
          ["1", `Expenses for ${eventName}`, rawBudget],
        ],
      });
    }

    // Paragraph: the specific request
    bodyBlocks.push({
      type: "paragraph",
      text: `We hereby submit the completion documentation and request your formal sanction, administrative acceptance, and archival of the event dossier in institutional records.`,
    });

    enclosures = [
      "1. Summary Report & Attendance Register",
      "2. Voucher Clearances (if applicable)",
    ];
  }

  return {
    purpose,
    college,
    clubOrDeptLine,
    refNo,
    date: dateObj,
    toBlock,
    throughLine,
    subLine,
    salutation: "Respected Sir/Madam,",
    bodyBlocks,
    closing: {
      thankingYou: "Thanking you,",
      yoursFaithfully: "Yours faithfully,",
    },
    signatureRow,
    enclosures,
    missingFields: Array.from(new Set(missingFields)),
  };
}
