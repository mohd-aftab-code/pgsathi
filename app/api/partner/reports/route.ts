/**
 * app/api/partner/reports/route.ts
 * GET ?type=pg|revenue|renewal|earnings|monthly&format=csv|xlsx|pdf
 *
 * Streams a partnerId-scoped report as a real download in the requested format:
 *   csv  — UTF-8 with BOM (Excel reads ₹ correctly)
 *   xlsx — a genuine Excel workbook (exceljs)
 *   pdf  — a genuine PDF table (pdfkit)
 */
import { NextRequest, NextResponse } from "next/server";
import { requirePartnerApi } from "@/lib/partner-auth";
import { can, PERMISSIONS } from "@/lib/permissions";
import { buildReport, toCsv, type ReportType, type ReportData } from "@/lib/partner-reports";

// Node runtime: exceljs and pdfkit are Node libraries, not edge-compatible.
export const runtime = "nodejs";

const VALID: ReportType[] = ["pg", "revenue", "renewal", "earnings", "monthly"];

async function toXlsx(data: ReportData, partnerCode: string): Promise<Buffer> {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "PGSathi";
  wb.created = new Date();
  const ws = wb.addWorksheet(data.title.slice(0, 30));

  // Title row
  ws.mergeCells(1, 1, 1, Math.max(1, data.columns.length));
  const titleCell = ws.getCell(1, 1);
  titleCell.value = `${data.title} — Partner ${partnerCode}`;
  titleCell.font = { size: 14, bold: true };
  titleCell.alignment = { vertical: "middle" };
  ws.getRow(1).height = 24;

  // Header row
  const header = ws.addRow(data.columns);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF8B5CF6" } };
    cell.alignment = { vertical: "middle" };
    cell.border = { bottom: { style: "thin", color: { argb: "FFDDDDDD" } } };
  });
  header.height = 20;

  data.rows.forEach((r) => ws.addRow(r));

  // Auto-fit columns to their widest value (capped so one long cell can't
  // stretch the sheet off-screen).
  ws.columns.forEach((col, i) => {
    const widest = Math.max(
      String(data.columns[i] ?? "").length,
      ...data.rows.map((r) => String(r[i] ?? "").length)
    );
    col.width = Math.min(42, Math.max(12, widest + 2));
  });
  ws.views = [{ state: "frozen", ySplit: 2 }];

  return Buffer.from(await wb.xlsx.writeBuffer());
}

async function toPdf(data: ReportData, partnerCode: string): Promise<Buffer> {
  const PDFDocument = (await import("pdfkit")).default;

  return new Promise((resolve, reject) => {
    // Landscape gives wide tables room; PDFKit's built-in Helvetica avoids
    // shipping a font file.
    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 36 });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageW = doc.page.width - 72;
    const colW = pageW / Math.max(1, data.columns.length);

    doc.fontSize(16).fillColor("#171717").text(data.title, { continued: false });
    doc.moveDown(0.2);
    doc.fontSize(9).fillColor("#737373")
      .text(`Partner ${partnerCode}  ·  ${data.rows.length} rows  ·  ${new Date().toLocaleDateString("en-IN")}`);
    doc.moveDown(0.8);

    const drawHeader = () => {
      const y = doc.y;
      doc.rect(36, y - 2, pageW, 18).fill("#8b5cf6");
      doc.fillColor("#ffffff").fontSize(8);
      data.columns.forEach((c, i) => {
        doc.text(String(c), 40 + i * colW, y + 3, { width: colW - 6, ellipsis: true });
      });
      doc.y = y + 20;
      doc.fillColor("#171717");
    };

    drawHeader();
    doc.fontSize(8);

    data.rows.forEach((row, idx) => {
      // New page when we run out of room — repeat the header there.
      if (doc.y > doc.page.height - 60) {
        doc.addPage();
        drawHeader();
        doc.fontSize(8);
      }
      const y = doc.y;
      if (idx % 2 === 1) doc.rect(36, y - 2, pageW, 14).fill("#f5f5f5").fillColor("#171717");
      row.forEach((cell, i) => {
        // ₹ isn't in PDFKit's standard Helvetica encoding — write "Rs." instead
        // of dropping the character silently.
        const text = String(cell ?? "").replace(/₹/g, "Rs.");
        doc.fillColor("#171717").text(text, 40 + i * colW, y + 1, { width: colW - 6, ellipsis: true });
      });
      doc.y = y + 14;
    });

    doc.end();
  });
}

export async function GET(req: NextRequest) {
  const ctx = await requirePartnerApi();
  if (!ctx) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  if (!(await can("PARTNER", PERMISSIONS.REPORTS_EXPORT))) {
    return NextResponse.json({ success: false, message: "Export ki permission nahi hai" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as ReportType;
  const format = (searchParams.get("format") ?? "csv").toLowerCase();

  if (!VALID.includes(type)) {
    return NextResponse.json({ success: false, message: "Invalid report type" }, { status: 400 });
  }
  if (!["csv", "xlsx", "pdf"].includes(format)) {
    return NextResponse.json({ success: false, message: "Invalid format" }, { status: 400 });
  }

  const data = await buildReport(ctx.partnerId, type);
  const stamp = new Date().toISOString().slice(0, 10);
  const base = `PGSathi_${type}_report_${stamp}`;

  try {
    if (format === "xlsx") {
      const buf = await toXlsx(data, ctx.partnerCode);
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${base}.xlsx"`,
          "Cache-Control": "no-store",
        },
      });
    }

    if (format === "pdf") {
      const buf = await toPdf(data, ctx.partnerCode);
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${base}.pdf"`,
          "Cache-Control": "no-store",
        },
      });
    }

    const csv = "﻿" + toCsv(data); // BOM so Excel reads UTF-8 (₹ etc.) correctly
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${base}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[PARTNER_REPORT_EXPORT]", format, err);
    return NextResponse.json({ success: false, message: "Export generate nahi hua" }, { status: 500 });
  }
}
