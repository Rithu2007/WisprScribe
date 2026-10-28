/**
 * pdf-renderer.ts
 *
 * Generates a real PDF document adhering strictly to
 * THE ONE FRAME (unified college format).
 *
 * Font: Times / Times-Roman
 * All text black (#000000)
 * 1-inch margins (25.4 mm)
 * Identical layout across permission, report, and sanction.
 */

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { CollegeDocument } from "../document-model";

const COLOR_BLACK = [0, 0, 0] as const;

export async function generatePdfBlob(doc: CollegeDocument): Promise<Blob> {
  const pdf = buildPdfDocument(doc);
  return pdf.output("blob");
}

export async function generatePdfBuffer(doc: CollegeDocument): Promise<Buffer> {
  const pdf = buildPdfDocument(doc);
  const arrayBuffer = pdf.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}

export function buildPdfDocument(doc: CollegeDocument): jsPDF {
  // A4 size: 210 x 297 mm
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 25.4; // 1 inch
  const marginRight = 25.4;
  const contentWidth = pageWidth - marginLeft - marginRight; // 159.2 mm
  const marginTop = 25.4;
  const marginBottom = 25.4;
  const maxContentY = pageHeight - marginBottom - 12; // leave room for footer

  let y = marginTop;

  function checkPageBreak(requiredHeight: number) {
    if (y + requiredHeight > maxContentY) {
      pdf.addPage();
      y = marginTop;
      renderRunningHeader();
    }
  }

  function renderRunningHeader() {
    pdf.setFont("times", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(...COLOR_BLACK);
    const text = `${doc.college.name} • ${doc.refNo.text}`;
    pdf.text(text, pageWidth - marginRight, 15, { align: "right" });
    pdf.setLineWidth(0.2);
    pdf.line(marginLeft, 17, pageWidth - marginRight, 17);
    y = 24;
  }

  // =========================================================================
  // 1. LETTERHEAD FROM CollegeProfile
  // =========================================================================
  const centerX = pageWidth / 2;

  // College Name (15pt bold uppercase centered)
  pdf.setFont("times", "bold");
  pdf.setFontSize(15);
  pdf.setTextColor(...COLOR_BLACK);
  pdf.text(doc.college.name.toUpperCase(), centerX, y, { align: "center" });
  y += 5.5;

  // Status / Autonomy Line (10pt bold centered)
  if (doc.college.status) {
    pdf.setFont("times", "bold");
    pdf.setFontSize(9.5);
    pdf.text(doc.college.status, centerX, y, { align: "center" });
    y += 4.5;
  }

  // Affiliations (8.5pt normal centered)
  pdf.setFont("times", "normal");
  pdf.setFontSize(8.5);
  for (const aff of doc.college.affiliations) {
    pdf.text(aff, centerX, y, { align: "center" });
    y += 4;
  }

  // Campus Address (8.5pt normal centered)
  pdf.text(`Campus: ${doc.college.address}`, centerX, y, { align: "center" });
  y += 3.5;

  // Thick Rule Beneath Letterhead (approx 2 pt = 0.7 mm)
  pdf.setLineWidth(0.7);
  pdf.line(marginLeft, y, pageWidth - marginRight, y);
  y += 6;

  // =========================================================================
  // 2. CLUB OR DEPARTMENT LINE (bold, centered, underlined)
  // =========================================================================
  pdf.setFont("times", "bold");
  pdf.setFontSize(12);
  pdf.text(doc.clubOrDeptLine, centerX, y, { align: "center" });

  // Draw underline for club/dept line
  const textWidth = pdf.getTextWidth(doc.clubOrDeptLine);
  pdf.setLineWidth(0.3);
  pdf.line(centerX - textWidth / 2, y + 0.8, centerX + textWidth / 2, y + 0.8);
  y += 7;

  // =========================================================================
  // 3. ONE ROW: "Ref. No.: ___" left, "Date: ___" right
  // =========================================================================
  pdf.setFont("times", "bold");
  pdf.setFontSize(11);
  pdf.text(doc.refNo.text, marginLeft, y);
  pdf.text(doc.date.text, pageWidth - marginRight, y, { align: "right" });
  y += 6.5;

  // =========================================================================
  // 4. "To," BLOCK (each recipient line on its own line)
  // =========================================================================
  pdf.setFont("times", "normal");
  pdf.setFontSize(12);
  pdf.text("To,", marginLeft, y);
  y += 5;

  for (const line of doc.toBlock) {
    pdf.text(line, marginLeft + 6, y);
    y += 5;
  }

  // =========================================================================
  // 5. OPTIONAL "Through:" LINE
  // =========================================================================
  if (doc.throughLine) {
    y += 1.5;
    pdf.setFont("times", "bold");
    pdf.text(doc.throughLine, marginLeft + 6, y);
    y += 5.5;
  }

  // =========================================================================
  // 6. "Sub:" LINE (bold with hanging indent)
  // =========================================================================
  y += 2;
  pdf.setFont("times", "bold");
  pdf.setFontSize(12);

  const subPrefix = "Sub:   ";
  const subPrefixWidth = pdf.getTextWidth(subPrefix);
  const remainingWidth = contentWidth - subPrefixWidth;
  const subText = doc.subLine.replace(/^Sub:\s*/i, "");

  const wrappedSubLines = pdf.splitTextToSize(subText, remainingWidth);

  pdf.text(subPrefix, marginLeft, y);
  for (let i = 0; i < wrappedSubLines.length; i++) {
    pdf.text(wrappedSubLines[i], marginLeft + subPrefixWidth, y);
    if (i < wrappedSubLines.length - 1) {
      y += 5.5;
    }
  }
  y += 7;

  // =========================================================================
  // 7. SALUTATION: "Respected Sir/Madam,"
  // =========================================================================
  pdf.setFont("times", "normal");
  pdf.setFontSize(12);
  pdf.text(doc.salutation, marginLeft, y);
  y += 6.5;

  // =========================================================================
  // 8. BODY BLOCKS (Paragraphs, Headings, Tables)
  // =========================================================================
  for (const block of doc.bodyBlocks) {
    if (block.type === "paragraph") {
      checkPageBreak(12);
      pdf.setFont("times", "normal");
      pdf.setFontSize(12);
      const lines = pdf.splitTextToSize(block.text, contentWidth);
      for (const line of lines) {
        checkPageBreak(5.5);
        pdf.text(line, marginLeft, y);
        y += 5.5;
      }
      y += 2;
    } else if (block.type === "sectionHeading") {
      checkPageBreak(14);
      pdf.setFont("times", "bold");
      pdf.setFontSize(12);
      pdf.text(`${block.number}. ${block.title}`, marginLeft, y);
      y += 5.5;
    } else if (block.type === "numberedList") {
      pdf.setFont("times", "normal");
      pdf.setFontSize(12);
      for (let i = 0; i < block.items.length; i++) {
        checkPageBreak(8);
        const itemPrefix = `${i + 1}.  `;
        const prefixWidth = pdf.getTextWidth(itemPrefix);
        const lines = pdf.splitTextToSize(block.items[i], contentWidth - prefixWidth - 4);
        pdf.setFont("times", "bold");
        pdf.text(itemPrefix, marginLeft + 4, y);
        pdf.setFont("times", "normal");
        for (let j = 0; j < lines.length; j++) {
          checkPageBreak(5.5);
          pdf.text(lines[j], marginLeft + 4 + prefixWidth, y);
          y += 5.5;
        }
      }
      y += 2;
    } else if (block.type === "detailsTable") {
      checkPageBreak(30);
      autoTable(pdf, {
        startY: y,
        margin: { left: marginLeft, right: marginRight },
        head: [["Parameter", "Details"]],
        body: block.rows.map((r) => [r.label, r.value]),
        theme: "plain",
        styles: {
          font: "times",
          fontSize: 10,
          textColor: [0, 0, 0],
          cellPadding: 2,
          lineColor: [0, 0, 0],
          lineWidth: 0.2,
          fillColor: [255, 255, 255],
        },
        headStyles: {
          fontStyle: "bold",
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.2,
        },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: contentWidth * 0.35 },
          1: { cellWidth: contentWidth * 0.65 },
        },
      });

      // @ts-expect-error jspdf-autotable adds lastAutoTable to pdf instance
      y = (pdf.lastAutoTable?.finalY || y) + 5;
    } else if (block.type === "dataTable") {
      checkPageBreak(25);
      autoTable(pdf, {
        startY: y,
        margin: { left: marginLeft, right: marginRight },
        head: [block.headers],
        body: block.rows,
        theme: "plain",
        styles: {
          font: "times",
          fontSize: 10,
          textColor: [0, 0, 0],
          cellPadding: 2,
          lineColor: [0, 0, 0],
          lineWidth: 0.2,
          fillColor: [255, 255, 255],
        },
        headStyles: {
          fontStyle: "bold",
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.2,
        },
      });

      // @ts-expect-error jspdf-autotable adds lastAutoTable to pdf instance
      y = (pdf.lastAutoTable?.finalY || y) + 5;
    }
  }

  // =========================================================================
  // 9. CLOSING: "Thanking you," then "Yours faithfully,"
  // =========================================================================
  checkPageBreak(35);
  pdf.setFont("times", "normal");
  pdf.setFontSize(12);
  pdf.text(doc.closing.thankingYou, marginLeft, y);
  y += 5;
  pdf.text(doc.closing.yoursFaithfully, marginLeft, y);
  y += 6;

  // =========================================================================
  // 10. SIGNATURE ROW (Equal columns, blank signing space, bold CAPS designations)
  // =========================================================================
  // Ensure the entire signature row stays together on one page
  checkPageBreak(30);

  const numSigs = doc.signatureRow.length;
  const colW = contentWidth / numSigs;
  const signingSpaceHeight = 16; // 16 mm blank space for physical signature

  y += signingSpaceHeight;

  doc.signatureRow.forEach((sig, index) => {
    const colCenterX = marginLeft + index * colW + colW / 2;
    let sigY = y;

    // Bold CAPS Designation
    pdf.setFont("times", "bold");
    pdf.setFontSize(9.5);
    pdf.text(sig.designation, colCenterX, sigY, { align: "center" });
    sigY += 4;

    // Name if provided
    if (sig.name) {
      pdf.setFont("times", "normal");
      pdf.setFontSize(9);
      pdf.text(sig.name, colCenterX, sigY, { align: "center" });
      sigY += 3.5;
    }

    // Detail if provided
    if (sig.detail) {
      pdf.setFont("times", "normal");
      pdf.setFontSize(8);
      pdf.text(sig.detail, colCenterX, sigY, { align: "center" });
    }
  });

  y += 12;

  // =========================================================================
  // 11. OPTIONAL ENCLOSURES
  // =========================================================================
  if (doc.enclosures && doc.enclosures.length > 0) {
    checkPageBreak(15);
    pdf.setFont("times", "bold");
    pdf.setFontSize(10.5);
    pdf.text("Enclosures:", marginLeft, y);
    y += 4.5;

    pdf.setFont("times", "normal");
    pdf.setFontSize(10);
    for (const enc of doc.enclosures) {
      pdf.text(enc, marginLeft + 4, y);
      y += 4;
    }
  }

  // =========================================================================
  // 12. FOOTER ON EVERY PAGE (thin rule, address, phone, website, Page X of Y)
  // =========================================================================
  const totalPages = pdf.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    const footerY = pageHeight - marginBottom + 8;

    // Thin horizontal rule
    pdf.setLineWidth(0.2);
    pdf.line(marginLeft, footerY - 4, pageWidth - marginRight, footerY - 4);

    // Left info
    pdf.setFont("times", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...COLOR_BLACK);
    const leftText = `${doc.college.address} | Phone: ${doc.college.phone} | Website: ${doc.college.website}`;
    pdf.text(leftText, marginLeft, footerY);

    // Right page number
    const pageText = `Page ${p} of ${totalPages}`;
    pdf.text(pageText, pageWidth - marginRight, footerY, { align: "right" });
  }

  return pdf;
}
