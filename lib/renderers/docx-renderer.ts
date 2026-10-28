/**
 * docx-renderer.ts
 *
 * Generates a standard Microsoft Word (.docx) document adhering to
 * THE ONE FRAME (unified college format).
 *
 * Font: Times New Roman
 * All text black (#000000)
 * 1-inch margins (1440 twips)
 * Identical layout across permission, report, and sanction.
 */

import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  UnderlineType,
  convertInchesToTwip,
  Packer,
} from "docx";
import { CollegeDocument } from "../document-model";

const FONT = "Times New Roman";
const COLOR_BLACK = "000000";

const noBorder = {
  style: BorderStyle.NONE,
  size: 0,
  color: "FFFFFF",
};

const thinBlackBorder = {
  style: BorderStyle.SINGLE,
  size: 4, // 0.5 pt
  color: COLOR_BLACK,
};

const tableBorders = {
  top: thinBlackBorder,
  bottom: thinBlackBorder,
  left: thinBlackBorder,
  right: thinBlackBorder,
  insideHorizontal: thinBlackBorder,
  insideVertical: thinBlackBorder,
};

const borderlessTableBorders = {
  top: noBorder,
  bottom: noBorder,
  left: noBorder,
  right: noBorder,
  insideHorizontal: noBorder,
  insideVertical: noBorder,
};

const cellMargins = {
  top: 100, // ~5pt top
  bottom: 100, // ~5pt bottom
  left: 140, // ~7pt left
  right: 140, // ~7pt right
};

/**
 * Creates clean text runs adhering strictly to standard monochrome typography.
 * No colorful or extraneous highlights.
 */
function renderCleanRuns(
  text: string,
  options: {
    font?: string;
    size?: number;
    color?: string;
    bold?: boolean;
  } = {}
): TextRun[] {
  const font = options.font || FONT;
  const size = options.size || 24;
  const color = options.color || COLOR_BLACK;
  const defaultBold = options.bold || false;

  return [
    new TextRun({
      text: text || "",
      font,
      size,
      color,
      bold: defaultBold,
    }),
  ];
}

export async function generateDocxBlob(doc: CollegeDocument): Promise<Blob> {
  const document = buildDocxDocument(doc);
  return await Packer.toBlob(document);
}

export async function generateDocxBuffer(doc: CollegeDocument): Promise<Buffer> {
  const document = buildDocxDocument(doc);
  return await Packer.toBuffer(document);
}

export function buildDocxDocument(doc: CollegeDocument): Document {
  const children: (Paragraph | Table)[] = [];

  // =========================================================================
  // 1. LETTERHEAD FROM CollegeProfile
  // =========================================================================
  // College Name (16pt bold uppercase centered)
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
      children: [
        new TextRun({
          text: doc.college.name.toUpperCase(),
          font: FONT,
          size: 32, // 16 pt = 32 half-points
          bold: true,
          color: COLOR_BLACK,
        }),
      ],
    })
  );

  // Status / Autonomy Line (10pt bold centered)
  if (doc.college.status) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 30 },
        children: [
          new TextRun({
            text: doc.college.status,
            font: FONT,
            size: 20, // 10 pt
            bold: true,
            color: COLOR_BLACK,
          }),
        ],
      })
    );
  }

  // Affiliations (8.5pt centered)
  for (const aff of doc.college.affiliations) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 20 },
        children: [
          new TextRun({
            text: aff,
            font: FONT,
            size: 17, // 8.5 pt
            color: COLOR_BLACK,
          }),
        ],
      })
    );
  }

  // Campus Address (8.5pt centered)
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 100 },
      children: [
        new TextRun({
          text: `Campus: ${doc.college.address}`,
          font: FONT,
          size: 17,
          color: COLOR_BLACK,
        }),
      ],
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 18, // ~2.25 pt thick rule beneath letterhead
          color: COLOR_BLACK,
          space: 8,
        },
      },
    })
  );

  // =========================================================================
  // 2. CLUB OR DEPARTMENT LINE (bold, centered, underlined)
  // =========================================================================
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 140, after: 140 },
      children: [
        new TextRun({
          text: doc.clubOrDeptLine,
          font: FONT,
          size: 24, // 12 pt
          bold: true,
          underline: { type: UnderlineType.SINGLE },
          color: COLOR_BLACK,
        }),
      ],
    })
  );

  // =========================================================================
  // 3. ONE ROW: "Ref. No.: ___" left, "Date: ___" right
  // =========================================================================
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: borderlessTableBorders,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 60, type: WidthType.PERCENTAGE },
              borders: borderlessTableBorders,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: doc.refNo.text,
                      font: FONT,
                      size: 22, // 11 pt
                      bold: true,
                      color: COLOR_BLACK,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              borders: borderlessTableBorders,
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: doc.date.text,
                      font: FONT,
                      size: 22,
                      bold: true,
                      color: COLOR_BLACK,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  // Small spacer
  children.push(new Paragraph({ spacing: { before: 100, after: 0 }, children: [] }));

  // =========================================================================
  // 4. "To," BLOCK (each recipient line on its own line)
  // =========================================================================
  children.push(
    new Paragraph({
      spacing: { before: 80, after: 40 },
      children: [
        new TextRun({
          text: "To,",
          font: FONT,
          size: 24, // 12 pt
          color: COLOR_BLACK,
        }),
      ],
    })
  );

  for (const line of doc.toBlock) {
    children.push(
      new Paragraph({
        spacing: { before: 0, after: 20 },
        indent: { left: 360 }, // 0.25 inch indent
        children: [
          new TextRun({
            text: line,
            font: FONT,
            size: 24,
            color: COLOR_BLACK,
          }),
        ],
      })
    );
  }

  // =========================================================================
  // 5. OPTIONAL "Through:" LINE
  // =========================================================================
  if (doc.throughLine) {
    children.push(
      new Paragraph({
        spacing: { before: 80, after: 80 },
        indent: { left: 360 },
        children: [
          new TextRun({
            text: doc.throughLine,
            font: FONT,
            size: 24,
            bold: true,
            color: COLOR_BLACK,
          }),
        ],
      })
    );
  }

  // =========================================================================
  // 6. "Sub:" LINE (bold with hanging indent)
  // =========================================================================
  children.push(
    new Paragraph({
      spacing: { before: 120, after: 120 },
      indent: { left: 720, hanging: 720 }, // Hanging indent so wrapped lines align after "Sub:"
      children: renderCleanRuns(doc.subLine, { size: 24, bold: true }),
    })
  );

  // =========================================================================
  // 7. SALUTATION: "Respected Sir/Madam,"
  // =========================================================================
  children.push(
    new Paragraph({
      spacing: { before: 100, after: 100 },
      children: [
        new TextRun({
          text: doc.salutation,
          font: FONT,
          size: 24,
          color: COLOR_BLACK,
        }),
      ],
    })
  );

  // =========================================================================
  // 8. BODY BLOCKS (Paragraphs, Headings, Tables, Lists)
  // =========================================================================
  for (const block of doc.bodyBlocks) {
    if (block.type === "paragraph") {
      children.push(
        new Paragraph({
          spacing: { before: 60, after: 120, line: 360 }, // 1.5 line spacing (360)
          alignment: AlignmentType.JUSTIFIED,
          children: renderCleanRuns(block.text, { size: 24 }),
        })
      );
    } else if (block.type === "sectionHeading") {
      children.push(
        new Paragraph({
          spacing: { before: 180, after: 80 },
          keepNext: true,
          children: [
            new TextRun({
              text: `${block.number}. ${block.title}`,
              font: FONT,
              size: 24,
              bold: true,
              color: COLOR_BLACK,
            }),
          ],
        })
      );
    } else if (block.type === "numberedList") {
      for (let i = 0; i < block.items.length; i++) {
        children.push(
          new Paragraph({
            spacing: { before: 40, after: 60, line: 360 },
            indent: { left: 720, hanging: 360 },
            children: [
              new TextRun({
                text: `${i + 1}.\t`,
                font: FONT,
                size: 24,
                bold: true,
                color: COLOR_BLACK,
              }),
              ...renderCleanRuns(block.items[i], { size: 24 }),
            ],
          })
        );
      }
    } else if (block.type === "detailsTable") {
      const tableRows = [
        // Header Row
        new TableRow({
          cantSplit: true,
          tableHeader: true,
          children: [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              margins: cellMargins,
              borders: tableBorders,
              children: [
                new Paragraph({
                  spacing: { before: 40, after: 40 },
                  children: [
                    new TextRun({
                      text: "Parameter",
                      font: FONT,
                      size: 22, // 11 pt
                      bold: true,
                      color: COLOR_BLACK,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              margins: cellMargins,
              borders: tableBorders,
              children: [
                new Paragraph({
                  spacing: { before: 40, after: 40 },
                  children: [
                    new TextRun({
                      text: "Details",
                      font: FONT,
                      size: 22,
                      bold: true,
                      color: COLOR_BLACK,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        // Data Rows
        ...block.rows.map(
          (row) =>
            new TableRow({
              cantSplit: true,
              children: [
                new TableCell({
                  width: { size: 35, type: WidthType.PERCENTAGE },
                  margins: cellMargins,
                  borders: tableBorders,
                  children: [
                    new Paragraph({
                      spacing: { before: 30, after: 30 },
                      children: [
                        new TextRun({
                          text: row.label,
                          font: FONT,
                          size: 22,
                          bold: true,
                          color: COLOR_BLACK,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 65, type: WidthType.PERCENTAGE },
                  margins: cellMargins,
                  borders: tableBorders,
                  children: [
                    new Paragraph({
                      spacing: { before: 30, after: 30 },
                      children: renderCleanRuns(row.value, { size: 22 }),
                    }),
                  ],
                }),
              ],
            })
        ),
      ];

      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: tableBorders,
          rows: tableRows,
        })
      );
      children.push(new Paragraph({ spacing: { before: 100, after: 0 }, children: [] }));
    } else if (block.type === "dataTable") {
      const headerRow = new TableRow({
        cantSplit: true,
        tableHeader: true,
        children: block.headers.map(
          (h) =>
            new TableCell({
              margins: cellMargins,
              borders: tableBorders,
              children: [
                new Paragraph({
                  spacing: { before: 40, after: 40 },
                  children: [
                    new TextRun({
                      text: h,
                      font: FONT,
                      size: 22,
                      bold: true,
                      color: COLOR_BLACK,
                    }),
                  ],
                }),
              ],
            })
        ),
      });

      const bodyRows = block.rows.map(
        (r) =>
          new TableRow({
            cantSplit: true,
            children: r.map(
              (val) =>
                new TableCell({
                  margins: cellMargins,
                  borders: tableBorders,
                  children: [
                    new Paragraph({
                      spacing: { before: 30, after: 30 },
                      children: renderCleanRuns(val, { size: 22 }),
                    }),
                  ],
                })
            ),
          })
      );

      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: tableBorders,
          rows: [headerRow, ...bodyRows],
        })
      );
      children.push(new Paragraph({ spacing: { before: 100, after: 0 }, children: [] }));
    }
  }

  // =========================================================================
  // 9. CLOSING: "Thanking you," then "Yours faithfully,"
  // =========================================================================
  children.push(
    new Paragraph({
      spacing: { before: 140, after: 40 },
      keepNext: true,
      children: [
        new TextRun({
          text: doc.closing.thankingYou,
          font: FONT,
          size: 24,
          color: COLOR_BLACK,
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      spacing: { before: 0, after: 120 },
      keepNext: true,
      children: [
        new TextRun({
          text: doc.closing.yoursFaithfully,
          font: FONT,
          size: 24,
          color: COLOR_BLACK,
        }),
      ],
    })
  );

  // =========================================================================
  // 10. SIGNATURE ROW (Equal columns, blank signing space, bold CAPS designations)
  // =========================================================================
  const numSigs = doc.signatureRow.length;
  const colWidth = Math.floor(100 / numSigs);

  const sigCells = doc.signatureRow.map((sig) => {
    const cellParagraphs: Paragraph[] = [
      // Blank signing space (approx 1.5 inches / 1200 twips blank space for wet ink signature)
      new Paragraph({
        spacing: { before: 600, after: 0 },
        children: [],
      }),
      // Bold CAPS designation
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 20 },
        children: [
          new TextRun({
            text: sig.designation,
            font: FONT,
            size: 20, // 10 pt
            bold: true,
            color: COLOR_BLACK,
          }),
        ],
      }),
    ];

    if (sig.name) {
      cellParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 10 },
          children: [
            new TextRun({
              text: sig.name,
              font: FONT,
              size: 19,
              color: COLOR_BLACK,
            }),
          ],
        })
      );
    }

    if (sig.detail) {
      cellParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0 },
          children: [
            new TextRun({
              text: sig.detail,
              font: FONT,
              size: 17,
              color: COLOR_BLACK,
            }),
          ],
        })
      );
    }

    return new TableCell({
      width: { size: colWidth, type: WidthType.PERCENTAGE },
      borders: borderlessTableBorders,
      children: cellParagraphs,
    });
  });

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: borderlessTableBorders,
      rows: [
        new TableRow({
          cantSplit: true,
          children: sigCells,
        }),
      ],
    })
  );

  // =========================================================================
  // 11. OPTIONAL ENCLOSURES
  // =========================================================================
  if (doc.enclosures && doc.enclosures.length > 0) {
    children.push(
      new Paragraph({
        spacing: { before: 160, after: 40 },
        children: [
          new TextRun({
            text: "Enclosures:",
            font: FONT,
            size: 22,
            bold: true,
            color: COLOR_BLACK,
          }),
        ],
      })
    );
    for (const enc of doc.enclosures) {
      children.push(
        new Paragraph({
          spacing: { before: 0, after: 20 },
          indent: { left: 360 },
          children: [
            new TextRun({
              text: enc,
              font: FONT,
              size: 22,
              color: COLOR_BLACK,
            }),
          ],
        })
      );
    }
  }

  // =========================================================================
  // 12. RUNNING HEADER (Page 2+) & FOOTER (Every Page)
  // =========================================================================
  const runningHeader = new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 0, after: 60 },
        children: [
          new TextRun({
            text: `${doc.college.name} • ${doc.refNo.text}`,
            font: FONT,
            size: 17, // 8.5 pt
            color: COLOR_BLACK,
          }),
        ],
      }),
    ],
  });

  const pageFooter = new Footer({
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: borderlessTableBorders,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 70, type: WidthType.PERCENTAGE },
                borders: {
                  ...borderlessTableBorders,
                  top: thinBlackBorder,
                },
                children: [
                  new Paragraph({
                    spacing: { before: 40, after: 0 },
                    children: [
                      new TextRun({
                        text: `${doc.college.address} | Phone: ${doc.college.phone} | Website: ${doc.college.website}`,
                        font: FONT,
                        size: 17, // 8.5 pt
                        color: COLOR_BLACK,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                borders: {
                  ...borderlessTableBorders,
                  top: thinBlackBorder,
                },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    spacing: { before: 40, after: 0 },
                    children: [
                      new TextRun({
                        text: "Page ",
                        font: FONT,
                        size: 17,
                        color: COLOR_BLACK,
                      }),
                      new TextRun({
                        children: [PageNumber.CURRENT],
                        font: FONT,
                        size: 17,
                        color: COLOR_BLACK,
                      }),
                      new TextRun({
                        text: " of ",
                        font: FONT,
                        size: 17,
                        color: COLOR_BLACK,
                      }),
                      new TextRun({
                        children: [PageNumber.TOTAL_PAGES],
                        font: FONT,
                        size: 17,
                        color: COLOR_BLACK,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  return new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT,
            size: 24, // 12 pt default
            color: COLOR_BLACK,
          },
          paragraph: {
            spacing: { line: 360, after: 120 }, // 1.5 line spacing, 6pt after
          },
        },
      },
    },
    sections: [
      {
        properties: {
          titlePage: true, // Enables Different First Page in Word & Google Docs
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
            },
          },
        },
        headers: {
          default: runningHeader,
          first: new Header({ children: [] }), // Page 1 has NO running header overlapping the letterhead
        },
        footers: {
          default: pageFooter,
          first: pageFooter, // Footer remains on Page 1 as well
        },
        children,
      },
    ],
  });
}
