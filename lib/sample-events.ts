export interface SampleEvent {
  id: string;
  title: string;
  organizer: string;
  badge: string;
  isSynthetic: boolean;
  disclaimer?: string;
  transcript: string;
  approxDuration: string;
  wordCount: number;
}

export const SAMPLE_EVENTS: SampleEvent[] = [
  {
    id: "coding-club-web-dev",
    title: "Coding Club Web Dev Workshop",
    organizer: "Coding Club",
    badge: "Primary Sample (Spec §5)",
    isSynthetic: false,
    transcript:
      "We conducted a web development workshop on Saturday in Seminar Hall 2. There were 62 attendees. Professor Mehta was the speaker. The Coding Club organized the workshop from 10 AM to 1 PM. Students learned how to build a basic web page.",
    approxDuration: "25s spoken",
    wordCount: 42,
  },
  {
    id: "ecell-startup-pitch",
    title: "E-Cell Startup Pitch Night",
    organizer: "Entrepreneurship Cell",
    badge: "Synthetic Demo Data",
    isSynthetic: true,
    disclaimer:
      "Synthetic demo data, replace with a real event before making real-world claims.",
    transcript:
      "The Entrepreneurship Cell hosted the annual Startup Pitch Night in the Main Auditorium on Saturday from 2 PM to 5 PM. 85 students participated. Ms. Kavya Nair was the invited guest speaker. Students presented startup ideas and received feedback from the panel.",
    approxDuration: "28s spoken",
    wordCount: 42,
  },
  {
    id: "robotics-arduino-bootcamp",
    title: "Robotics Club Arduino Bootcamp",
    organizer: "Robotics Club",
    badge: "Synthetic Demo Data",
    isSynthetic: true,
    disclaimer:
      "Synthetic demo data, replace with a real event before making real-world claims.",
    transcript:
      "The Robotics Club conducted an Arduino Bootcamp on Sunday in Electronics Laboratory 3 between 10 AM and 1 PM. 48 students attended. Dr. R. Iyer was the guest instructor. Students built and tested a basic sensor prototype.",
    approxDuration: "24s spoken",
    wordCount: 38,
  },
];

export const DEFAULT_SAMPLE_EVENT = SAMPLE_EVENTS[0];
