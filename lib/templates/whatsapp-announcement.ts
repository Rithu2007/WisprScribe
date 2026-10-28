import { FactMap } from "../extraction-schema";

export function generateWhatsAppAnnouncement(facts: FactMap): string {
  const lines: string[] = [];

  const eventName = facts.eventName?.value || "College Event";
  const eventType = facts.eventType?.value ? ` (${facts.eventType.value})` : "";
  const organizer = facts.organizer?.value ? ` organized by *${facts.organizer.value}*` : "";

  // Title / Heading
  lines.push(`📢 *EVENT RECAP: ${eventName}${eventType}*`);
  lines.push("");

  // Intro line
  if (facts.date?.value) {
    lines.push(`The event was successfully conducted on *${facts.date.value}*${organizer}.`);
  } else {
    lines.push(`The event was successfully conducted${organizer}.`);
  }
  lines.push("");

  // Key Verified Details
  lines.push("📌 *Key Details:*");

  if (facts.venue?.value) {
    lines.push(`• *Venue:* ${facts.venue.value}`);
  }
  if (facts.time?.value) {
    lines.push(`• *Timing:* ${facts.time.value}`);
  }
  if (facts.speaker?.value) {
    const desig = facts.speakerDesignation?.value
      ? `, ${facts.speakerDesignation.value}`
      : "";
    const org = (facts as Record<string, any>).speakerOrganization?.value
      ? `, ${(facts as Record<string, any>).speakerOrganization.value}`
      : "";
    lines.push(`• *Speaker:* ${facts.speaker.value}${desig}${org}`);
  }
  if (facts.attendance?.value !== null && facts.attendance?.value !== undefined) {
    lines.push(`• *Attendance:* ${facts.attendance.value} participants`);
  }
  if (facts.coordinator?.value) {
    lines.push(`• *Coordinator:* ${facts.coordinator.value}`);
  }

  // Key Outcome
  if (facts.outcomes?.value) {
    lines.push("");
    lines.push("✨ *Key Takeaway & Outcomes:*");
    lines.push(String(facts.outcomes.value));
  }

  // Follow-up
  if (facts.followUp?.value) {
    lines.push("");
    lines.push("📋 *Next Steps / Follow-up:*");
    lines.push(String(facts.followUp.value));
  } else {
    lines.push("");
    lines.push("📝 *Follow-up:* Official documentation and participation records have been prepared.");
  }

  if (facts.studentName?.value) {
    const roll = facts.studentRollNo?.value ? ` (Roll No: ${facts.studentRollNo.value})` : "";
    lines.push("");
    lines.push(`👤 *Document prepared by:* ${facts.studentName.value}${roll}`);
  }
  if (facts.collegeName?.value) {
    lines.push(`🏛️ *Institution:* ${facts.collegeName.value}`);
  }

  return lines.join("\n");
}
