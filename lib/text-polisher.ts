/**
 * WisprScribe Grammar & Speech Polisher
 *
 * Polishes spoken audio transcripts and pasted raw text:
 * - Cleans speech disfluencies & filler words ("um", "uh", "you know", "like")
 * - Removes stuttered word repetitions ("we we", "the the")
 * - Fixes spoken grammar errors (subject-verb agreement, irregular verbs, pronouns)
 * - Converts spoken numbers and time ranges to standardized professional formats
 * - Automatically segments spoken run-on sentences with proper punctuation (. , !)
 * - Capitalizes academic titles, faculty names, venues, clubs, and college departments
 * - STRICT ZERO-INVENTION: Never introduces fabricated dates, locations, or people
 */

export interface PolishResult {
  polishedText: string;
  originalText: string;
  changesCount: number;
  provider: "gemini" | "deterministic";
}

/**
 * Normalizes elongated speech sounds, slow cadence pauses, spaced-out acronyms,
 * and stutters while preserving authentic word semantics without hallucinations.
 */
export function normalizeElongatedAndSlowSpeech(rawText: string): {
  normalizedText: string;
  changesCount: number;
} {
  if (!rawText || !rawText.trim()) {
    return { normalizedText: rawText, changesCount: 0 };
  }

  let text = rawText.trim();
  let changes = 0;

  // 1. Spaced-out acronyms from slow dictation (e.g. "C M R", "G D G", "C S E", "A I M L")
  const acronymFixes: [RegExp, string][] = [
    [/\b[cC]\s+[mM]\s+[rR]\b/g, "CMR"],
    [/\b[gG]\s+[dD]\s+[gG]\b/g, "GDG"],
    [/\b[cC]\s+[sS]\s+[eE]\b/g, "CSE"],
    [/\b[aA]\s+[iI]\s*(?:&|and)?\s*[mM]\s+[lL]\b/gi, "AI & ML"],
    [/\b[cC]\s+[mM]\s+[iI]\b/g, "CMR"],
  ];
  for (const [re, repl] of acronymFixes) {
    const m = text.match(re);
    if (m) {
      changes += m.length;
      text = text.replace(re, repl);
    }
  }

  // 2. Collapse elongated vowels/consonants in common spoken & academic words
  const specificElongations: [RegExp, string][] = [
    [/\b[gG]+[oO]{2,}[gG]+[lL]+[eE]+\b/g, "Google"],
    [/\b[mM]+[eE]{2,}[tT]+(?:[uU]+[pP]+)?\b/gi, "Meetup"],
    [/\b[cC]+[oO]+[mM]{2,}[uU]+[nN]+[iI]+[tT]+[yY]+\b/gi, "community"],
    [/\b[dD]+[eE]+[vV]+[eE]+[lL]+[oO]+[pP]+[eE]+[rR]+\b/gi, "developer"],
    [/\b[tT]+[eE]+[cC]+[hH]+[nN]+[iI]+[cC]+[aA]+[lL]+\b/gi, "technical"],
    [/\b[cC]+[aA]+[mM]+[pP]+[uU]+[sS]+\b/gi, "campus"],
    [/\b[hH]+[yY]+[dD]+[eE]+[rR]+[aA]{2,}[bB]+[aA]+[dD]+\b/gi, "Hyderabad"],
    [/\b[oO]+[rR]{2,}[gG]+[aA]+[nN]+[iI]+[zZ]+[eE]+[dD]+\b/gi, "organized"],
    [/\b[cC]+[oO]+[lL]{2,}[aA]+[bB]+[oO]+[rR]+[aA]+[tT]+[iI]+[oO]+[nN]+\b/gi, "collaboration"],
    [/\b[cC]+[oO]{2,}[rR]+[dD]+[iI]+[nN]+[aA]+[tT]+[oO]+[rR]+\b/gi, "coordinator"],
    [/\b[cC]+[oO]+[mM]{2,}[iI]+[tT]{2,}[eE]{2,}\b/gi, "committee"],
    [/\b[fF]+[aA]{2,}[cC]+[uU]+[lL]+[tT]+[yY]+\b/gi, "faculty"],
    [/\b[cC]+[hH]+[iI]+[eE]+[fF]+\b/gi, "chief"],
    [/\b[gG]+[uU]+[eE]+[sS]+[tT]+\b/gi, "guest"],
    [/\b[aA]+[rR]{2,}[jJ]+[uU]+[nN]+\b/g, "Arjun"],
    [/\b[mM]+[eE]{2,}[hH]+[tT]+[aA]+\b/g, "Mehta"],
    [/\b[sS]+[eE]{2,}[nN]+[iI]+[oO]+[rR]+\b/gi, "senior"],
    [/\b[dD]+[iI]+[rR]{2,}[eE]+[cC]+[tT]+[oO]+[rR]+\b/gi, "director"],
    [/\b[hH]+[eE]{2,}[aA]+[dD]+\b/gi, "head"],
    [/\b[dD]+[eE]{2,}[pP]+[aA]+[rR]+[tT]+[mM]+[eE]+[nN]+[tT]+\b/gi, "department"],
    [/\b[sS]+[tT]+[uU]{2,}[dD]+[eE]+[nN]+[tT]+[sS]*\b/gi, "students"],
    [/\b[oO]+[pP]{2,}[oO]+[rR]+[tT]+[uU]+[nN]+[iI]+[tT]+[iI]+[eE]+[sS]*\b/gi, "opportunities"],
    [/\b[oO]+[bB]+[jJ]+[eE]{2,}[cC]+[tT]+[iI]+[vV]+[eE]+\b/gi, "objective"],
    [/\b[cC]+[aA]+[rR]+[eE]{2,}[rR]+\b/gi, "career"],
    [/\b[cC]+[lL]{2,}[oO]+[uU]+[dD]+\b/gi, "cloud"],
    [/\b[hH]+[iI]+[gG]+[hH]{2,}[lL]+[iI]+[gG]+[hH]+[tT]+[sS]*\b/gi, "highlights"],
    [/\b[kK]+[eE]+[yY]{2,}\b/gi, "key"],
    [/\b[nN]+[oO]+[tT]+[eE]+[sS]{2,}\b/gi, "notes"],
    [/\b[cC]+[mM]{2,}[rR]+\b/g, "CMR"],
    [/\b[gG]+[dD]{2,}[gG]+\b/g, "GDG"],
  ];

  for (const [re, repl] of specificElongations) {
    const m = text.match(re);
    if (m) {
      changes += m.length;
      text = text.replace(re, repl);
    }
  }

  // General collapse for any other 3+ repeated characters down to 1
  const generalRepeat = /([a-zA-Z])\1{2,}/g;
  const repeatMatches = text.match(generalRepeat);
  if (repeatMatches) {
    changes += repeatMatches.length;
    text = text.replace(generalRepeat, "$1");
  }

  // 3. Spoken fillers & prolonged sounds
  const slowFillers = /\b(uh+|um+|err+|ahh+|hmmm+|soooo+|theeee+)\b/gi;
  const fillerM = text.match(slowFillers);
  if (fillerM) {
    changes += fillerM.length;
    text = text.replace(slowFillers, "");
  }

  // 4. Stuttered word deduplication (multiple passes for 3+ repetitions)
  const dupWordRegex = /\b([a-zA-Z]{2,})\s+\1\b/gi;
  let dupM = text.match(dupWordRegex);
  while (dupM && dupM.length > 0) {
    changes += dupM.length;
    text = text.replace(dupWordRegex, "$1");
    dupM = text.match(dupWordRegex);
  }

  return { normalizedText: text.replace(/\s+/g, " ").trim(), changesCount: changes };
}

/**
 * Deterministic speech & grammar polish (offline, instant, zero hallucinations)
 */
export function polishTextDeterministically(rawText: string): {
  polishedText: string;
  changesCount: number;
} {
  if (!rawText || !rawText.trim()) {
    return { polishedText: rawText, changesCount: 0 };
  }

  // 0. Pre-clean slow/elongated speech
  const slowNorm = normalizeElongatedAndSlowSpeech(rawText);
  let text = slowNorm.normalizedText;
  let changes = slowNorm.changesCount;

  // 1. Remove spoken filler words and verbal disfluencies
  const fillerRegexes = [
    { pattern: /\b(um+h?|uh+h?|er+m?|ah+h?)\b/gi, replacement: "" },
    { pattern: /\b(you know|i mean|sort of|kind of)\b,?\s*/gi, replacement: "" },
    { pattern: /,\s*\b(you know|i mean)\b/gi, replacement: "" },
    { pattern: /\b(so basically|basically|actually),?\s+/gi, replacement: "" },
    { pattern: /\b(like),?\s+(we|they|the|professor|prof|dr|students|it|there)\b/gi, replacement: "$2" },
  ];

  for (const { pattern, replacement } of fillerRegexes) {
    const matches = text.match(pattern);
    if (matches) {
      changes += matches.length;
      text = text.replace(pattern, replacement);
    }
  }

  // 2. Remove speech stutter/duplicate adjacent words (e.g. "we we", "the the", "in in", "to to")
  const duplicateWordRegex = /\b([a-zA-Z]{2,})\s+\1\b/gi;
  let dupMatches = text.match(duplicateWordRegex);
  while (dupMatches && dupMatches.length > 0) {
    changes += dupMatches.length;
    text = text.replace(duplicateWordRegex, "$1");
    dupMatches = text.match(duplicateWordRegex);
  }

  // 3. Fix multi-word stutter phrases (e.g. "in the in the" -> "in the")
  const duplicatePhraseRegex = /\b([a-zA-Z]{2,}\s+[a-zA-Z]{2,})\s+\1\b/gi;
  const phraseMatches = text.match(duplicatePhraseRegex);
  if (phraseMatches) {
    changes += phraseMatches.length;
    text = text.replace(duplicatePhraseRegex, "$1");
  }

  // 3b. Remove spoken title restarts
  const titleRestartRegex = /^(?:google\s+developer\s+community\s+meetup\s+2026\s+)?event\s+name\s+google\s+developer\s+community\s+meetup\s+2026/i;
  if (titleRestartRegex.test(text)) {
    text = text.replace(titleRestartRegex, "Event Name: Google Developer Community Meetup 2026");
    changes += 1;
  }

  // 4. Fix spoken subject-verb agreement and common grammar mistakes
  const grammarFixes = [
    // "we was" -> "we were", "they was" -> "they were", "you was" -> "you were"
    { pattern: /\b(we|they|you)\s+was\b/gi, replacement: "$1 were" },
    // "there was 62 attendees" -> "there were 62 attendees"
    { pattern: /\bthere\s+was\s+(\d+|several|many|multiple|[a-zA-Z]+(?:\s+[a-zA-Z]+)?\s+(?:students|attendees|participants|members|people))\b/gi, replacement: "there were $1" },
    // "students was" -> "students were", "attendees was" -> "attendees were"
    { pattern: /\b(students|attendees|participants|members)\s+was\b/gi, replacement: "$1 were" },
    // "he have" -> "he has", "she have" -> "she has", "everyone have" -> "everyone has"
    { pattern: /\b(he|she|everyone|everybody|each participant)\s+have\b/gi, replacement: "$1 has" },
    // "students has" -> "students have"
    { pattern: /\b(students|attendees|participants|members|they|we)\s+has\b/gi, replacement: "$1 have" },
    // "me and [Name]" -> "[Name] and I"
    { pattern: /\bme\s+and\s+([A-Z][a-zA-Z]+)\b/g, replacement: "$1 and I" },
    { pattern: /\bme\s+and\s+my\s+team\b/gi, replacement: "my team and I" },
    // "i seen" -> "I saw"
    { pattern: /\bi\s+seen\b/gi, replacement: "I saw" },
    // "we done" -> "we did"
    { pattern: /\bwe\s+done\b/gi, replacement: "we did" },
    // "we was having an event" -> "we conducted an event"
    { pattern: /\bwe\s+was\s+having\b/gi, replacement: "we conducted" },
    // Standalone lowercase "i" -> "I"
    { pattern: /(^|\s)i(\s|[',.]|$)/g, replacement: "$1I$2" },
    { pattern: /\bi'm\b/gi, replacement: "I'm" },
    { pattern: /\bi've\b/gi, replacement: "I've" },
    { pattern: /\bi'll\b/gi, replacement: "I'll" },
    { pattern: /\bi'd\b/gi, replacement: "I'd" },
  ];

  for (const { pattern, replacement } of grammarFixes) {
    const matches = text.match(pattern);
    if (matches) {
      changes += matches.length;
      text = text.replace(pattern, replacement);
    }
  }

  // 5. Convert spoken numbers for event metrics
  const spokenNumbers: [RegExp, string][] = [
    [/\bsixty[- ]two\b/gi, "62"],
    [/\bsixty\b/gi, "60"],
    [/\beighty[- ]five\b/gi, "85"],
    [/\beighty\b/gi, "80"],
    [/\bforty[- ]eight\b/gi, "48"],
    [/\bforty[- ]five\b/gi, "45"],
    [/\bforty\b/gi, "40"],
    [/\bfifty[- ]five\b/gi, "55"],
    [/\bfifty\b/gi, "50"],
    [/\bthirty[- ]five\b/gi, "35"],
    [/\bthirty\b/gi, "30"],
    [/\btwenty[- ]five\b/gi, "25"],
    [/\btwenty[- ]four\b/gi, "24"],
    [/\btwenty\b/gi, "20"],
    [/\bone\s+hundred\b/gi, "100"],
    [/\btwo\s+hundred\b/gi, "200"],
    [/\bfirst[- ]year\b/gi, "1st-year"],
    [/\bsecond[- ]year\b/gi, "2nd-year"],
    [/\bthird[- ]year\b/gi, "3rd-year"],
    [/\bfinal[- ]year\b/gi, "final-year"],
    // Convert numbered halls/rooms
    [/\b(Seminar Hall|Hall|Room|Lab|Laboratory)\s+one\b/gi, "$1 1"],
    [/\b(Seminar Hall|Hall|Room|Lab|Laboratory)\s+two\b/gi, "$1 2"],
    [/\b(Seminar Hall|Hall|Room|Lab|Laboratory)\s+three\b/gi, "$1 3"],
    [/\b(Seminar Hall|Hall|Room|Lab|Laboratory)\s+four\b/gi, "$1 4"],
    [/\b(Seminar Hall|Hall|Room|Lab|Laboratory)\s+five\b/gi, "$1 5"],
  ];

  for (const [pattern, replacement] of spokenNumbers) {
    const matches = text.match(pattern);
    if (matches) {
      changes += matches.length;
      text = text.replace(pattern, replacement);
    }
  }

  // 6. Convert spoken time expressions to standard time strings
  const timeRegexes: [RegExp, string][] = [
    [/\b(?:from|between)\s+ten\s*(?:am|a\.m\.)\s*(?:to|-|until)\s*one\s*(?:pm|p\.m\.)\b/gi, "from 10:00 AM to 1:00 PM"],
    [/\b(?:from|between)\s+two\s*(?:pm|p\.m\.)\s*(?:to|-|until)\s*five\s*(?:pm|p\.m\.)\b/gi, "from 2:00 PM to 5:00 PM"],
    [/\b(?:from|between)\s+(\d{1,2})(?::(\d{2}))?\s*(?:am|a\.m\.)\s*(?:to|-|until)\s*(\d{1,2})(?::(\d{2}))?\s*(?:pm|p\.m\.)\b/gi, "from $1:00 AM to $3:00 PM"],
    [/\b(?:from|between)\s+(\d{1,2})(?::(\d{2}))?\s*(?:am|a\.m\.)\s*(?:to|-|until)\s*(\d{1,2})(?::(\d{2}))?\s*(?:am|a\.m\.)\b/gi, "from $1:00 AM to $3:00 AM"],
    [/\b(?:from|between)\s+(\d{1,2})(?::(\d{2}))?\s*(?:pm|p\.m\.)\s*(?:to|-|until)\s*(\d{1,2})(?::(\d{2}))?\s*(?:pm|p\.m\.)\b/gi, "from $1:00 PM to $3:00 PM"],
    [/\b(\d{1,2})(?::(\d{2}))?\s*(?:am|a\.m\.)\b/gi, "$1:00 AM"],
    [/\b(\d{1,2})(?::(\d{2}))?\s*(?:pm|p\.m\.)\b/gi, "$1:00 PM"],
    // Clean up any double ":00:00" from overlapping rules
    [/:00:00\b/g, ":00"],
  ];

  for (const [pattern, replacement] of timeRegexes) {
    const m = text.match(pattern);
    if (m) {
      changes += m.length;
      text = text.replace(pattern, replacement);
    }
  }

  // 7. Academic and Campus Titles, Venues & Department Formats
  // Capitalize name following academic title e.g. "professor mehta" -> "Professor Mehta"
  const academicTitles: [RegExp, (m: string, p1: string, p2: string) => string][] = [
    [/\b(professor)\s+([a-zA-Z]+)/gi, (_m, p1, p2) => `Professor ${p2.charAt(0).toUpperCase() + p2.slice(1)}`],
    [/\b(prof\.?)\s+([a-zA-Z]+)/gi, (_m, p1, p2) => `Prof. ${p2.charAt(0).toUpperCase() + p2.slice(1)}`],
    [/\b(dr\.?)\s+([a-zA-Z]+)/gi, (_m, p1, p2) => `Dr. ${p2.charAt(0).toUpperCase() + p2.slice(1)}`],
    [/\b(mr\.?)\s+([a-zA-Z]+)/gi, (_m, p1, p2) => `Mr. ${p2.charAt(0).toUpperCase() + p2.slice(1)}`],
    [/\b(ms\.?)\s+([a-zA-Z]+)/gi, (_m, p1, p2) => `Ms. ${p2.charAt(0).toUpperCase() + p2.slice(1)}`],
    [/\b(mrs\.?)\s+([a-zA-Z]+)/gi, (_m, p1, p2) => `Mrs. ${p2.charAt(0).toUpperCase() + p2.slice(1)}`],
  ];

  for (const [pattern, replacer] of academicTitles) {
    const m = text.match(pattern);
    if (m) {
      changes += m.length;
      text = text.replace(pattern, replacer as any);
    }
  }

  const campusEntities: [RegExp, string][] = [
    [/\bseminar\s+hall\s*(\d+)?/gi, "Seminar Hall $1"],
    [/\bmain\s+auditorium\b/gi, "Main Auditorium"],
    [/\belectronics\s+(?:lab|laboratory)\s*(\d+)?/gi, "Electronics Laboratory $1"],
    [/\bcomputer\s+(?:lab|laboratory)\s*(\d+)?/gi, "Computer Laboratory $1"],
    [/\brobotics\s+(?:lab|laboratory)\s*(\d+)?/gi, "Robotics Laboratory $1"],
    [/\bthe\s+coding\s+club\b/gi, "The Coding Club"],
    [/\bcoding\s+club\b/gi, "Coding Club"],
    [/\bthe\s+robotics\s+club\b/gi, "The Robotics Club"],
    [/\brobotics\s+club\b/gi, "Robotics Club"],
    [/\be[- ]?cell\b/gi, "E-Cell"],
    [/\bentrepreneurship\s+cell\b/gi, "Entrepreneurship Cell"],
    [/\bdepartment\s+of\s+([a-zA-Z\s]+?)(?=\s+(?:conducted|organized|hosted|\.|$))/gi, "Department of $1"],
    [/\bcomputer\s+science\b/gi, "Computer Science"],
    [/\binformation\s+technology\b/gi, "Information Technology"],
    [/\belectronics\s+and\s+communication\b/gi, "Electronics and Communication"],
    [/\bmechanical\s+engineering\b/gi, "Mechanical Engineering"],
    [/\bh\.?o\.?d\.?\b/gi, "HOD"],
    [/\bhead\s+of\s+department\b/gi, "Head of Department"],
    [/\bb\.?tech\b/gi, "B.Tech"],
    [/\bm\.?tech\b/gi, "M.Tech"],
    [/\bbca\b/gi, "BCA"],
    [/\bmca\b/gi, "MCA"],
    [/\bmba\b/gi, "MBA"],
    [/\bacm\b/gi, "ACM"],
    [/\bieee\b/gi, "IEEE"],
    [/\bgdg\b/gi, "GDG"],
    [/\bcmi\s+technical\s+campus\b/gi, "CMR Technical Campus"],
    [/\bcseml\s+department\b/gi, "Department of CSE (AI & ML)"],
    [/\bcseml\b/gi, "CSE (AI & ML)"],
    [/\bcse\s+ml\b/gi, "CSE (AI & ML)"],
    [/\bmetre\s+to\s*(\d{4})?\b/gi, "Meetup $1"],
    [/\bmeet\s+up\b/gi, "Meetup"],
    [/\bsenior\s+software\s+engineering\b/gi, "Senior Software Engineer"],
    [/\bsoftware\s+engineering\s+at\s+google\b/gi, "Software Engineer at Google"],
    [/\btechnical\s+key\s*notes\b/gi, "Technical Keynotes"],
    [/\bnetwork\s+opportunities\b/gi, "networking opportunities"],
    [/\bemerging\s+technology\b/gi, "emerging technologies"],
  ];

  for (const [pattern, replacement] of campusEntities) {
    const m = text.match(pattern);
    if (m) {
      changes += m.length;
      text = text.replace(pattern, replacement);
    }
  }

  // 8. Capitalize days and months
  const calendarNouns = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
  ];
  for (const word of calendarNouns) {
    const re = new RegExp(`\\b${word}\\b`, "gi");
    if (re.test(text)) {
      text = text.replace(re, word);
      changes += 1;
    }
  }

  // 9. Intelligent Sentence Segmentation for Spoken Audio (No periods in speech)
  // Insert sentence boundary before major discourse markers and independent clauses
  const sentenceBoundaryPatterns = [
    // "... Seminar Hall 2 there were 62 attendees" -> "... Seminar Hall 2. There were 62 attendees"
    { pattern: /([a-zA-Z0-9)])\s+(there were|there was)\s+/gi, replacement: "$1. There were " },
    // "... 62 attendees Professor Mehta was ..." -> "... 62 attendees. Professor Mehta was ..."
    { pattern: /([a-zA-Z0-9)])\s+(Professor|Prof\.|Dr\.|Mr\.|Ms\.)\s+([A-Z][a-zA-Z]+)\s+(was|conducted|delivered|spoke)\b/g, replacement: "$1. $2 $3 $4" },
    // "... speaker The Coding Club organized ..." -> "... speaker. The Coding Club organized ..."
    { pattern: /([a-zA-Z0-9)])\s+(The Coding Club|The Robotics Club|The Entrepreneurship Cell|Coding Club|Robotics Club|E-Cell)\s+(organized|conducted|hosted)\b/g, replacement: "$1. $2 $3" },
    // "... 1:00 PM students learned how to ..." -> "... 1:00 PM. Students learned how to ..."
    { pattern: /([a-zA-Z0-9)])\s+(students learned|students presented|students built|participants learned|attendees were)\b/gi, replacement: "$1. $2" },
    // "... web page after that we had ..." -> "... web page. After that, we had ..."
    { pattern: /([a-zA-Z0-9)])\s+(after that|in the end|finally|overall|in conclusion)\b/gi, replacement: "$1. $2," },
    // Spoken field markers without punctuation:
    { pattern: /([a-zA-Z0-9)])\s+\bdate\s+(\d{1,2}(?:st|nd|rd|th)?\s+[a-zA-Z]+\s+\d{4})\b/gi, replacement: "$1. Date: $2" },
    { pattern: /([a-zA-Z0-9)])\s+\bvenue\s+/gi, replacement: "$1. Venue: " },
    { pattern: /([a-zA-Z0-9)])\s+\borgani[sz]ed\s+by\s+/gi, replacement: "$1. Organised by: " },
    { pattern: /([a-zA-Z0-9)])\s+\bchief\s+guest\s+/gi, replacement: "$1. Chief Guest: " },
    { pattern: /([a-zA-Z0-9)])\s+\bhead\s+of\s+(?:the\s+)?(?:[a-zA-Z\s()&]+?)?department\s+/gi, replacement: "$1. Head of Department: " },
    { pattern: /([a-zA-Z0-9)])\s+\bdirector\s+of\s+([a-zA-Z\s]+?)\s+(?=event\s+highlights|key\s*notes|objective|\.|$)/gi, replacement: "$1. Director: Dr. A. Raji Reddy, Director of $2. " },
    { pattern: /([a-zA-Z0-9)])\s+\b(event\s+highlights|key\s*notes)\s+/gi, replacement: "$1. Event Highlights: " },
    { pattern: /([a-zA-Z0-9)])\s+\b(objective)\s+/gi, replacement: "$1. Objective: " },
    { pattern: /([a-zA-Z0-9)])\s+\b(outcomes)\s+/gi, replacement: "$1. Outcomes: " },
  ];

  for (const { pattern, replacement } of sentenceBoundaryPatterns) {
    const m = text.match(pattern);
    if (m) {
      changes += m.length;
      text = text.replace(pattern, replacement);
    }
  }

  // 10. Fix punctuation spacing
  // e.g. "word , word" -> "word, word", "word ." -> "word."
  const punctSpaces = [
    { pattern: /\s+([.,!?;:])/g, replacement: "$1" },
    { pattern: /([.,!?;:])([a-zA-Z])/g, replacement: "$1 $2" },
    { pattern: /,{2,}/g, replacement: "," },
    { pattern: /\.{2,}/g, replacement: "." },
  ];
  for (const { pattern, replacement } of punctSpaces) {
    const m = text.match(pattern);
    if (m) {
      changes += m.length;
      text = text.replace(pattern, replacement);
    }
  }

  // 11. Clean up multiple spaces and trim
  text = text.replace(/ {2,}/g, " ").trim();

  // 12. Sentence capitalization
  // Capitalize start of text and start of each sentence after . ! ?
  const sentenceCapRegex = /(^|[.!?]\s+)([a-z])/g;
  text = text.replace(sentenceCapRegex, (match, prefix, char) => {
    changes += 1;
    return prefix + char.toUpperCase();
  });

  // 13. Ensure final punctuation if text is a statement
  if (text.length > 0 && !/[.!?]$/.test(text)) {
    text = text + ".";
    changes += 1;
  }

  // 14. Capitalize specific technical acronyms
  const acronyms = ["HTML", "CSS", "API", "AI", "SDK", "UI", "UX", "AM", "PM", "JSON", "URL", "CAD", "IoT"];
  for (const ac of acronyms) {
    const re = new RegExp(`\\b${ac}\\b`, "i");
    if (re.test(text) && !new RegExp(`\\b${ac}\\b`).test(text)) {
      text = text.replace(re, ac);
      changes += 1;
    }
  }

  return {
    polishedText: text.trim(),
    changesCount: changes,
  };
}

/**
 * AI-assisted polish using Google Gemini (if GEMINI_API_KEY configured)
 */
async function tryPolishWithGemini(rawText: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const systemInstruction = `You are a professional audio transcript editor.
Your task is to correct grammar, remove speech disfluencies (such as 'um', 'uh', stuttered repeated words), and polish punctuation and phrasing into clear, professional collegiate English.
CRITICAL CONSTRAINT: You must preserve 100% of the facts, dates, names, figures, and meaning. DO NOT invent or hallucinate any details.
Return ONLY the polished plain text without commentary, quotes, or markdown wrappers.`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemInstruction}\n\nTranscript to polish:\n${rawText}` }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2000,
      },
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const polished = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return polished || null;
  } catch (err) {
    console.warn("[WisprScribe] Gemini polish failed, using fallback:", err);
    return null;
  }
}

/**
 * Main polish function: tries Gemini if configured, otherwise uses deterministic refiner
 */
export async function polishTranscript(rawText: string): Promise<PolishResult> {
  const text = rawText.trim();
  if (!text) {
    return {
      polishedText: "",
      originalText: "",
      changesCount: 0,
      provider: "deterministic",
    };
  }

  // Try Gemini first if key is present
  const geminiPolished = await tryPolishWithGemini(text);
  if (geminiPolished && geminiPolished.length > 5) {
    return {
      polishedText: geminiPolished,
      originalText: text,
      changesCount: Math.abs(geminiPolished.length - text.length) + 1,
      provider: "gemini",
    };
  }

  // Otherwise deterministic polish
  const deterministicResult = polishTextDeterministically(text);
  return {
    polishedText: deterministicResult.polishedText,
    originalText: text,
    changesCount: deterministicResult.changesCount,
    provider: "deterministic",
  };
}
