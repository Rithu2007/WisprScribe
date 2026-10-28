import { FactMap, FactKey } from "./extraction-schema";

export interface ClarifyingQuestion {
  id: string;
  fieldKey: FactKey;
  question: string;
  hint: string;
  placeholder: string;
  type: "text" | "number";
  options?: (string | number)[];
  defaultValue?: string | number;
}

/**
 * Plan targeted questions for missing core facts.
 * Rule: Ask only for missing core fields; do not ask for facts already explicitly present.
 * Minimize user work: never ask for details that can be safely inferred from college profile or HOD.
 */
export function planMissingQuestions(facts: FactMap): ClarifyingQuestion[] {
  const questions: ClarifyingQuestion[] = [];

  // 1. College name: only ask if not stated AND not inferred from campus/venue
  const collegeVal = facts.collegeName?.value;
  const venueVal = facts.venue?.value;
  const isCMR = (venueVal && /cmr/i.test(String(venueVal))) || (collegeVal && /cmr/i.test(String(collegeVal)));
  if (!collegeVal && !isCMR && facts.collegeName?.status === "needs_confirmation") {
    questions.push({
      id: "q-college",
      fieldKey: "collegeName",
      question: "What is the name of your college or institution?",
      hint: "Official academic institution or college campus name",
      placeholder: "e.g., CMR Technical Campus",
      type: "text",
      options: ["CMR Technical Campus", "CMR Institute of Technology"],
      defaultValue: "CMR Technical Campus",
    });
  }

  // 2. Official event name
  const eventNameVal = facts.eventName?.value;
  if (!eventNameVal || facts.eventName?.status === "needs_confirmation") {
    questions.push({
      id: "q-event-name",
      fieldKey: "eventName",
      question: "What was the official name of the event?",
      hint: "Official title as registered in college records",
      placeholder: "e.g., Google Developer Community Meetup 2026",
      type: "text",
    });
  }

  // 3. Number of students or attendees (with one-click suggestion chips)
  const attendanceVal = facts.attendance?.value;
  if (
    attendanceVal === null ||
    attendanceVal === undefined ||
    facts.attendance?.status === "needs_confirmation"
  ) {
    questions.push({
      id: "q-attendance",
      fieldKey: "attendance",
      question: "How many students or attendees participated?",
      hint: "Headcount of participants for official records (select or type)",
      placeholder: "e.g., 150",
      type: "number",
      options: [80, 120, 150, 200, 250],
      defaultValue: 150,
    });
  }

  // 4. Department, club, or unit that conducted the event
  const deptVal = facts.department?.value;
  const organizerVal = facts.organizer?.value;
  if (
    (!deptVal || facts.department?.status === "needs_confirmation") &&
    (!organizerVal || facts.organizer?.status === "needs_confirmation")
  ) {
    questions.push({
      id: "q-department",
      fieldKey: "department",
      question: "Which department, club, or unit conducted the event?",
      hint: "Host department, student club, cell, or society",
      placeholder: "e.g., Department of Computer Science & Engineering (AI & ML)",
      type: "text",
      options: [
        "Department of Computer Science & Engineering (AI & ML)",
        "Department of Computer Science & Engineering",
        "GDG (Google Developer Groups)",
      ],
      defaultValue: "Department of Computer Science & Engineering (AI & ML)",
    });
  }

  // 5. Faculty coordinator or department authority
  const coordVal = facts.coordinator?.value;
  const hodVal = facts.hod?.value;
  if ((!coordVal || facts.coordinator?.status === "needs_confirmation") && !hodVal) {
    questions.push({
      id: "q-authority",
      fieldKey: "coordinator",
      question: "Who was the faculty coordinator or responsible authority?",
      hint: "Faculty coordinator, Department head, Club lead, or Program coordinator",
      placeholder: "e.g., Dr. R. Raja Reddy (HOD)",
      type: "text",
    });
  }

  // 6. Exact calendar date (if only relative weekday or unstated)
  const dateVal = facts.date?.value;
  const isRelativeDate =
    typeof dateVal === "string" &&
    /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday|yesterday|today|tomorrow)/i.test(
      dateVal.trim()
    );
  if (!dateVal || isRelativeDate || facts.date?.status === "needs_confirmation") {
    questions.push({
      id: "q-date",
      fieldKey: "date",
      question: "What was the exact calendar date of the event?",
      hint: "Absolute calendar date (DD/MM/YYYY) for audit records",
      placeholder: "e.g., 28 October 2026",
      type: "text",
    });
  }

  // 7. Venue (if missing or unconfirmed)
  if (!venueVal || facts.venue?.status === "needs_confirmation") {
    questions.push({
      id: "q-venue",
      fieldKey: "venue",
      question: "Where was the event held (venue, hall, or laboratory)?",
      hint: "Specific room, auditorium, or campus building location",
      placeholder: "e.g., CMR Technical Campus, Hyderabad",
      type: "text",
      options: ["CMR Technical Campus, Hyderabad", "Main Auditorium", "Seminar Hall 1", "Seminar Hall 2"],
      defaultValue: "CMR Technical Campus, Hyderabad",
    });
  }

  // 8. Timing / Duration (if missing or unconfirmed)
  const timeVal = facts.time?.value;
  if (!timeVal || facts.time?.status === "needs_confirmation") {
    questions.push({
      id: "q-time",
      fieldKey: "time",
      question: "What were the event timings or hours?",
      hint: "Official time window for institutional scheduling records",
      placeholder: "e.g., 10:00 AM – 1:00 PM",
      type: "text",
      options: ["10:00 AM – 1:00 PM", "2:00 PM – 5:00 PM", "9:30 AM – 4:30 PM"],
      defaultValue: "10:00 AM – 1:00 PM",
    });
  }

  return questions;
}
