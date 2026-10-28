/**
 * html-preview-renderer.ts
 *
 * Renders THE ONE FRAME in clean HTML for on-screen document review.
 * Matches PDF and DOCX typography, dimensions, and layout identically.
 *
 * Font: Times New Roman / Tinos
 * All text black (#000000)
 * Only standard layouts and main borders (letterhead divider, table grid, footer rule).
 * No colorful or extraneous elements.
 */

import { CollegeDocument } from "../document-model";

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderCollegeDocumentHtml(doc: CollegeDocument): string {
  const bodyBlocksHtml = doc.bodyBlocks
    .map((block) => {
      if (block.type === "paragraph") {
        return `<p class="text-[12pt] leading-[1.5] text-justify mb-3 text-black font-serif">${escapeHtml(
          block.text
        )}</p>`;
      }
      if (block.type === "sectionHeading") {
        return `<h3 class="text-[12pt] font-bold mt-4 mb-2 text-black font-serif">${block.number}. ${escapeHtml(
          block.title
        )}</h3>`;
      }
      if (block.type === "numberedList") {
        const itemsHtml = block.items
          .map(
            (item) =>
              `<li class="pl-2 leading-[1.5] text-justify text-black font-serif">${escapeHtml(item)}</li>`
          )
          .join("");
        return `<ol class="list-decimal pl-6 my-2 space-y-1 text-[12pt] text-black font-serif">${itemsHtml}</ol>`;
      }
      if (block.type === "detailsTable") {
        const rowsHtml = block.rows
          .map(
            (row) => `
          <tr class="border-b border-black last:border-b-0">
            <td class="p-2 font-bold w-[35%] border-r border-black align-top text-[11pt] font-serif">${escapeHtml(
              row.label
            )}</td>
            <td class="p-2 w-[65%] align-top text-[11pt] font-serif">${escapeHtml(
              row.value
            )}</td>
          </tr>`
          )
          .join("");

        return `
        <table class="w-full text-[11pt] border-collapse my-4 font-serif border border-black">
          <thead>
            <tr class="border-b border-black">
              <th class="p-2 text-left font-bold w-[35%] border-r border-black text-[11pt] font-serif bg-transparent">Parameter</th>
              <th class="p-2 text-left font-bold w-[65%] text-[11pt] font-serif bg-transparent">Details</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>`;
      }
      if (block.type === "dataTable") {
        const headerHtml = block.headers
          .map(
            (h) =>
              `<th class="p-2 text-left font-bold border-r border-black last:border-r-0 text-[11pt] font-serif bg-transparent">${escapeHtml(
                h
              )}</th>`
          )
          .join("");

        const bodyHtml = block.rows
          .map(
            (r) => `
          <tr class="border-b border-black last:border-b-0">
            ${r
              .map(
                (cell) =>
                  `<td class="p-2 border-r border-black last:border-r-0 align-top text-[11pt] font-serif">${escapeHtml(
                    cell
                  )}</td>`
              )
              .join("")}
          </tr>`
          )
          .join("");

        return `
        <table class="w-full text-[11pt] border-collapse my-4 font-serif border border-black">
          <thead>
            <tr class="border-b border-black">
              ${headerHtml}
            </tr>
          </thead>
          <tbody>
            ${bodyHtml}
          </tbody>
        </table>`;
      }
      return "";
    })
    .join("\n");

  const toBlockHtml = doc.toBlock
    .map((line) => `<div class="pl-4 text-[12pt] font-serif text-black leading-snug">${escapeHtml(line)}</div>`)
    .join("");

  const sigColumnsHtml = doc.signatureRow
    .map((sig) => {
      return `
      <div class="flex-1 flex flex-col justify-end text-center px-2">
        <!-- Generous blank signing space for wet-ink signature -->
        <div class="h-16 mb-2"></div>
        <div class="font-bold text-[10pt] uppercase tracking-wide text-black font-serif leading-tight">
          ${escapeHtml(sig.designation)}
        </div>
        ${
          sig.name
            ? `<div class="text-[9.5pt] text-black font-serif mt-0.5 leading-tight">${escapeHtml(sig.name)}</div>`
            : ""
        }
        ${
          sig.detail
            ? `<div class="text-[8.5pt] text-black font-serif mt-0.5 leading-tight">${escapeHtml(sig.detail)}</div>`
            : ""
        }
      </div>`;
    })
    .join("");

  const subContent = doc.subLine.replace(/^Sub:\s*/i, "");

  return `
<div class="college-document-frame bg-white text-black font-serif max-w-[850px] mx-auto p-10 sm:p-14 border border-neutral-300 select-text">
  <style>
    .college-document-frame {
      font-family: "Times New Roman", Times, "Tinos", serif !important;
      color: #000000 !important;
      line-height: 1.5;
    }
    .hanging-sub {
      display: flex;
      align-items: flex-start;
      margin-top: 0.75rem;
      margin-bottom: 0.75rem;
      font-weight: bold;
      font-size: 12pt;
    }
    .hanging-sub-prefix {
      flex-shrink: 0;
      width: 3.5rem;
    }
    .hanging-sub-text {
      flex: 1;
    }
  </style>

  <!-- 1. LETTERHEAD FROM CollegeProfile -->
  <header class="text-center pb-2 select-none border-b-[2.5px] border-black">
    <h1 class="text-2xl font-bold uppercase tracking-wider text-black font-serif leading-tight mb-1">
      ${escapeHtml(doc.college.name.toUpperCase())}
    </h1>
    ${
      doc.college.status
        ? `<div class="text-[10pt] font-bold text-black font-serif leading-tight mb-1">${escapeHtml(
            doc.college.status
          )}</div>`
        : ""
    }
    ${doc.college.affiliations
      .map(
        (aff) => `<div class="text-[8.5pt] text-black font-serif leading-tight">${escapeHtml(aff)}</div>`
      )
      .join("")}
    <div class="text-[8.5pt] text-black font-serif leading-tight mt-0.5 mb-1.5">
      Campus: ${escapeHtml(doc.college.address)}
    </div>
  </header>

  <!-- 2. CLUB OR DEPARTMENT LINE (bold, centered, underlined) -->
  <div class="text-center my-4">
    <span class="text-[12pt] font-bold underline uppercase tracking-wider text-black font-serif">
      ${escapeHtml(doc.clubOrDeptLine)}
    </span>
  </div>

  <!-- 3. ONE ROW: "Ref. No.: ___" left, "Date: ___" right -->
  <div class="flex items-center justify-between text-[11pt] font-bold font-serif mb-4 text-black">
    <div>${escapeHtml(doc.refNo.text)}</div>
    <div>${escapeHtml(doc.date.text)}</div>
  </div>

  <!-- 4. "To," BLOCK (each recipient line on its own line) -->
  <div class="mb-3 space-y-0.5">
    <div class="text-[12pt] font-serif text-black">To,</div>
    ${toBlockHtml}
  </div>

  <!-- 5. OPTIONAL "Through:" LINE -->
  ${
    doc.throughLine
      ? `<div class="pl-4 text-[12pt] font-bold font-serif text-black my-2.5">${escapeHtml(doc.throughLine)}</div>`
      : ""
  }

  <!-- 6. "Sub:" LINE (bold with hanging indent) -->
  <div class="hanging-sub text-black font-serif">
    <span class="hanging-sub-prefix">Sub:</span>
    <span class="hanging-sub-text">${escapeHtml(subContent)}</span>
  </div>

  <!-- 7. SALUTATION: "Respected Sir/Madam," -->
  <div class="text-[12pt] font-serif text-black mb-3">
    ${escapeHtml(doc.salutation)}
  </div>

  <!-- 8. BODY BLOCKS -->
  <main class="space-y-2 mb-6">
    ${bodyBlocksHtml}
  </main>

  <!-- 9. CLOSING: "Thanking you," then "Yours faithfully," -->
  <div class="space-y-0.5 mb-6 text-black font-serif">
    <div class="text-[12pt]">${escapeHtml(doc.closing.thankingYou)}</div>
    <div class="text-[12pt]">${escapeHtml(doc.closing.yoursFaithfully)}</div>
  </div>

  <!-- 10. SIGNATURE ROW (equal columns, blank signing space, bold CAPS designations) -->
  <section class="mt-8 pt-4">
    <div class="flex items-end justify-between gap-4">
      ${sigColumnsHtml}
    </div>
  </section>

  <!-- 11. OPTIONAL ENCLOSURES (no extraneous dividing lines) -->
  ${
    doc.enclosures && doc.enclosures.length > 0
      ? `
    <div class="mt-6 text-[11pt] font-serif text-black">
      <div class="font-bold mb-1">Enclosures:</div>
      <ol class="list-none pl-4 space-y-0.5">
        ${doc.enclosures.map((enc) => `<li>${escapeHtml(enc)}</li>`).join("")}
      </ol>
    </div>`
      : ""
  }

  <!-- 12. FOOTER ON EVERY PAGE (thin rule, address, phone, website, Page X of Y) -->
  <footer class="mt-12 pt-3 border-t border-black flex items-center justify-between text-[8.5pt] font-serif text-black">
    <div>
      ${escapeHtml(doc.college.address)} | Phone: ${escapeHtml(doc.college.phone)} | Website: ${escapeHtml(
    doc.college.website
  )}
    </div>
    <div class="text-[8.5pt] font-serif">
      Page 1 of 1
    </div>
  </footer>
</div>
  `.trim();
}
