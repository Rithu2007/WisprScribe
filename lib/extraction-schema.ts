import { z } from "zod";

export const FieldStatusSchema = z.enum(["confirmed", "needs_confirmation", "edited"]);
export type FieldStatus = z.infer<typeof FieldStatusSchema>;

export const ExtractedFieldSchema = z.object({
  value: z.union([z.string(), z.number()]).nullable(),
  status: FieldStatusSchema,
  sourceText: z.string().nullable(),
  reason: z.string().nullable(),
});
export type ExtractedField = z.infer<typeof ExtractedFieldSchema>;

export const FactSchema = z.object({
  collegeName: ExtractedFieldSchema,
  eventName: ExtractedFieldSchema,
  eventType: ExtractedFieldSchema,
  date: ExtractedFieldSchema,
  time: ExtractedFieldSchema,
  venue: ExtractedFieldSchema,
  organizer: ExtractedFieldSchema,
  coordinator: ExtractedFieldSchema,
  speaker: ExtractedFieldSchema,
  speakerDesignation: ExtractedFieldSchema,
  speakerOrganization: ExtractedFieldSchema.optional().default({
    value: null,
    status: "needs_confirmation",
    sourceText: null,
    reason: "Speaker external organization or firm not specified.",
  }),
  hod: ExtractedFieldSchema.optional().default({
    value: null,
    status: "needs_confirmation",
    sourceText: null,
    reason: "Head of the Department not specified.",
  }),
  director: ExtractedFieldSchema.optional().default({
    value: null,
    status: "needs_confirmation",
    sourceText: null,
    reason: "College Director or Principal not specified.",
  }),
  keynotes: ExtractedFieldSchema.optional().default({
    value: null,
    status: "needs_confirmation",
    sourceText: null,
    reason: "Technical keynotes or session highlights not specified.",
  }),
  department: ExtractedFieldSchema,
  attendance: ExtractedFieldSchema,
  purpose: ExtractedFieldSchema,
  outcomes: ExtractedFieldSchema,
  followUp: ExtractedFieldSchema,
  refNo: ExtractedFieldSchema.optional().default({
    value: null,
    status: "needs_confirmation",
    sourceText: null,
    reason: "Institutional dispatch reference number not specified.",
  }),
  budget: ExtractedFieldSchema.optional().default({
    value: null,
    status: "needs_confirmation",
    sourceText: null,
    reason: "Budget or expenditure amount not specified.",
  }),
  studentName: ExtractedFieldSchema.optional().default({
    value: null,
    status: "needs_confirmation",
    sourceText: null,
    reason: "Student submitter or lead organizer name not specified.",
  }),
  studentRollNo: ExtractedFieldSchema.optional().default({
    value: null,
    status: "needs_confirmation",
    sourceText: null,
    reason: "Student Roll Number or Registration ID not specified.",
  }),
  academicYear: ExtractedFieldSchema.optional().default({
    value: null,
    status: "needs_confirmation",
    sourceText: null,
    reason: "Academic session / year or semester not specified.",
  }),
});
export type FactMap = z.infer<typeof FactSchema>;
export type FactKey = keyof FactMap;

export const ExtractApiResponseSchema = z.object({
  ok: z.boolean(),
  facts: FactSchema,
  warnings: z.array(z.string()),
  extractorUsed: z.enum(["deterministic_fallback", "gemini_live"]),
  notice: z.string().nullable(),
});
export type ExtractApiResponse = z.infer<typeof ExtractApiResponseSchema>;

export interface FieldDefinition {
  key: FactKey;
  label: string;
  category: "core" | "people" | "academic" | "student";
  type: "text" | "number" | "multiline";
  description: string;
  placeholder: string;
}

export const FACT_FIELD_DEFINITIONS: FieldDefinition[] = [
  {
    key: "collegeName",
    label: "College / Institution Name",
    category: "core",
    type: "text",
    description: "Official name of the academic institution or college campus",
    placeholder: "e.g., Delhi Technological University",
  },
  {
    key: "eventName",
    label: "Official Event Name",
    category: "core",
    type: "text",
    description: "Official title of the event as registered in college records",
    placeholder: "e.g., Annual Web Development Workshop 2026",
  },
  {
    key: "eventType",
    label: "Event Type / Format",
    category: "core",
    type: "text",
    description: "Format of the activity (Workshop, Seminar, Competition, Guest Lecture)",
    placeholder: "e.g., Technical Workshop",
  },
  {
    key: "date",
    label: "Calendar Date",
    category: "core",
    type: "text",
    description: "Absolute date (DD/MM/YYYY). Weekdays without dates require confirmation.",
    placeholder: "e.g., 24 October 2026",
  },
  {
    key: "time",
    label: "Timing / Duration",
    category: "core",
    type: "text",
    description: "Start and end times of the session",
    placeholder: "e.g., 10:00 AM – 1:00 PM",
  },
  {
    key: "venue",
    label: "Venue / Room",
    category: "core",
    type: "text",
    description: "Auditorium, laboratory, or hall where the event took place",
    placeholder: "e.g., Seminar Hall 2, Science Block",
  },
  {
    key: "organizer",
    label: "Organizing Body / Club",
    category: "people",
    type: "text",
    description: "Student club, cell, or committee responsible for execution",
    placeholder: "e.g., Coding Club",
  },
  {
    key: "coordinator",
    label: "Faculty / Student Coordinator",
    category: "people",
    type: "text",
    description: "Faculty advisor or student lead supervising the event",
    placeholder: "e.g., Dr. Ananya Sharma (Faculty In-Charge)",
  },
  {
    key: "speaker",
    label: "Keynote Speaker / Resource Person",
    category: "people",
    type: "text",
    description: "Primary guest speaker or instructor",
    placeholder: "e.g., Professor Mehta",
  },
  {
    key: "speakerDesignation",
    label: "Speaker Designation & Affiliation",
    category: "people",
    type: "text",
    description: "Title, organization, or academic department of the speaker",
    placeholder: "e.g., Senior Technical Lead, Acme Tech / Adjunct Professor",
  },
  {
    key: "speakerOrganization",
    label: "Speaker Organization / Firm",
    category: "people",
    type: "text",
    description: "External organization, firm, or company where the speaker works",
    placeholder: "e.g., Google, Microsoft",
  },
  {
    key: "hod",
    label: "Head of the Department (HOD)",
    category: "people",
    type: "text",
    description: "Designated Head of Department supervising academic governance",
    placeholder: "e.g., Dr. R. Raja Reddy",
  },
  {
    key: "director",
    label: "Campus Director / Principal",
    category: "people",
    type: "text",
    description: "Institutional executive director or principal",
    placeholder: "e.g., Dr. A. Raji Reddy (Director)",
  },
  {
    key: "keynotes",
    label: "Key Notes & Event Highlights",
    category: "academic",
    type: "multiline",
    description: "Core technical keynotes and session highlights observed during the event",
    placeholder: "e.g., Technical Keynotes on Cloud and AI, Developer Tools demo, Networking",
  },
  {
    key: "department",
    label: "Hosting Department / Branch",
    category: "academic",
    type: "text",
    description: "Academic department under whose banner the event is documented",
    placeholder: "e.g., Department of Computer Science & Engineering",
  },
  {
    key: "attendance",
    label: "Participant Attendance",
    category: "academic",
    type: "number",
    description: "Verified headcount of student/faculty attendees",
    placeholder: "e.g., 62",
  },
  {
    key: "purpose",
    label: "Stated Objective / Purpose",
    category: "academic",
    type: "multiline",
    description: "The official academic or developmental purpose of organizing the session",
    placeholder: "e.g., To introduce first-year engineering students to full-stack frontend fundamentals",
  },
  {
    key: "outcomes",
    label: "Key Outcomes & Takeaways",
    category: "academic",
    type: "multiline",
    description: "Concrete skills learned or work produced by attendees",
    placeholder: "e.g., Students learned HTML/CSS fundamentals and deployed a basic web page",
  },
  {
    key: "followUp",
    label: "Follow-up Actions / Next Steps",
    category: "academic",
    type: "multiline",
    description: "Post-event deliverables, feedback forms, certificates, or budget clearance",
    placeholder: "e.g., Distribution of participation certificates and submission of expenditure bills",
  },
  {
    key: "studentName",
    label: "Student Submitter / Lead Name",
    category: "student",
    type: "text",
    description: "Full name of the student organizer or submitter",
    placeholder: "e.g., Rahul Sharma",
  },
  {
    key: "studentRollNo",
    label: "Student Roll No. / ID",
    category: "student",
    type: "text",
    description: "University or college enrollment number",
    placeholder: "e.g., 21CS042",
  },
  {
    key: "academicYear",
    label: "Academic Session & Semester",
    category: "student",
    type: "text",
    description: "Academic year and semester under which this event is submitted",
    placeholder: "e.g., 2024–2025 (Semester VI)",
  },
];
