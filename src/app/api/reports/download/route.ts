import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { EmissionSource, ApprovalStatus, IssueStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "csv";
    const module = searchParams.get("module") || "all";
    const department = searchParams.get("department") || "all";
    const dateRange = searchParams.get("dateRange") || "all";
    const employee = searchParams.get("employee") || "all";

    // 1. Fetch filtered Environmental Data
    const carbonTransactions = await prisma.carbonTransaction.findMany({
      include: { department: true },
      where: {
        department: department !== "all" ? { name: department } : undefined,
      },
      orderBy: { date: "desc" },
    });

    // 2. Fetch filtered Social Data
    const participations = await prisma.employeeParticipation.findMany({
      include: { user: { include: { department: true } }, activity: true },
      where: {
        user: {
          name: employee !== "all" ? employee : undefined,
          department: department !== "all" ? { name: department } : undefined,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 3. Fetch filtered Governance Data
    const complianceIssues = await prisma.complianceIssue.findMany({
      include: { owner: { include: { department: true } } },
      where: {
        owner: {
          department: department !== "all" ? { name: department } : undefined,
        },
      },
      orderBy: { dueDate: "asc" },
    });

    // Handle CSV Export
    if (format.toLowerCase() === "csv") {
      let csvContent = "";

      if (module === "all" || module === "environmental") {
        csvContent += "--- ENVIRONMENTAL (CARBON TRANSACTIONS) ---\n";
        csvContent += "Source,Department,CO2e (Kg),Quantity,Unit,Date,Description\n";
        carbonTransactions.forEach(t => {
          csvContent += `"${t.source}","${t.department?.name || 'Operations'}",${t.co2eKg},${t.quantity},"${t.unit}","${new Date(t.date).toLocaleDateString()}","${t.description || ''}"\n`;
        });
        csvContent += "\n";
      }

      if (module === "all" || module === "social") {
        csvContent += "--- SOCIAL (CSR PARTICIPATIONS) ---\n";
        csvContent += "Employee,Department,Activity,Status,Points Earned,Date\n";
        participations.forEach(p => {
          csvContent += `"${p.user.name || p.user.email}","${p.user.department?.name || 'Unassigned'}","${p.activity.title}","${p.approvalStatus}",${p.pointsEarned},"${p.completionDate ? new Date(p.completionDate).toLocaleDateString() : ''}"\n`;
        });
        csvContent += "\n";
      }

      if (module === "all" || module === "governance") {
        csvContent += "--- GOVERNANCE (COMPLIANCE ISSUES) ---\n";
        csvContent += "Issue Title,Severity,Owner,Department,Due Date,Status\n";
        complianceIssues.forEach(i => {
          csvContent += `"${i.title}","${i.severity}","${i.owner?.name || 'Unassigned'}","${i.owner?.department?.name || 'Unassigned'}","${new Date(i.dueDate).toLocaleDateString()}","${i.status}"\n`;
        });
      }

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="EcoSphere_ESG_Report_${module}_${Date.now()}.csv"`,
        },
      });
    }

    // Handle Excel Export using xlsx package
    if (format.toLowerCase() === "excel") {
      const wb = XLSX.utils.book_new();

      if (module === "all" || module === "environmental") {
        const envRows = carbonTransactions.map(t => ({
          Source: t.source,
          Department: t.department?.name || "Operations",
          "CO2e (Kg)": t.co2eKg,
          Quantity: t.quantity,
          Unit: t.unit,
          Date: new Date(t.date).toLocaleDateString(),
          Description: t.description || "",
        }));
        const wsEnv = XLSX.utils.json_to_sheet(envRows);
        XLSX.utils.book_append_sheet(wb, wsEnv, "Environmental");
      }

      if (module === "all" || module === "social") {
        const socRows = participations.map(p => ({
          Employee: p.user.name || p.user.email,
          Department: p.user.department?.name || "Unassigned",
          Activity: p.activity.title,
          Status: p.approvalStatus,
          "Points Earned": p.pointsEarned,
          Date: p.completionDate ? new Date(p.completionDate).toLocaleDateString() : "",
        }));
        const wsSoc = XLSX.utils.json_to_sheet(socRows);
        XLSX.utils.book_append_sheet(wb, wsSoc, "Social");
      }

      if (module === "all" || module === "governance") {
        const govRows = complianceIssues.map(i => ({
          Issue: i.title,
          Severity: i.severity,
          Owner: i.owner?.name || "Unassigned",
          Department: i.owner?.department?.name || "Unassigned",
          "Due Date": new Date(i.dueDate).toLocaleDateString(),
          Status: i.status,
        }));
        const wsGov = XLSX.utils.json_to_sheet(govRows);
        XLSX.utils.book_append_sheet(wb, wsGov, "Governance");
      }

      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

      return new NextResponse(excelBuffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="EcoSphere_ESG_Report_${module}_${Date.now()}.xlsx"`,
        },
      });
    }

    // Handle PDF (HTML print layout) Export
    if (format.toLowerCase() === "pdf") {
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>EcoSphere ESG Report - ${module.toUpperCase()}</title>
          <style>
            body { font-family: sans-serif; color: #1e293b; padding: 40px; }
            h1 { font-family: monospace; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
            h2 { font-family: monospace; color: #475569; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background-color: #f1f5f9; text-align: left; padding: 10px; font-size: 12px; border-bottom: 1px solid #cbd5e1; }
            td { padding: 10px; font-size: 11px; border-bottom: 1px solid #f1f5f9; }
            .meta { font-size: 12px; color: #64748b; margin-bottom: 20px; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; margin-bottom: 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 13px;">Report ready for PDF printing. Click print, then choose <b>"Save as PDF"</b>.</span>
            <button onclick="window.print()" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">Print / Save PDF</button>
          </div>
          <h1>ECOSPHERE ESG PLATFORM REPORT</h1>
          <div class="meta">
            <strong>Module:</strong> ${module.toUpperCase()} | 
            <strong>Department:</strong> ${department} | 
            <strong>Date Range:</strong> ${dateRange} | 
            <strong>Generated:</strong> ${new Date().toLocaleString()}
          </div>
      `;

      if (module === "all" || module === "environmental") {
        htmlContent += `
          <h2>Environmental (Carbon Transactions)</h2>
          <table>
            <thead>
              <tr><th>Source</th><th>Department</th><th>CO2e (Kg)</th><th>Quantity</th><th>Unit</th><th>Date</th><th>Description</th></tr>
            </thead>
            <tbody>
        `;
        carbonTransactions.forEach(t => {
          htmlContent += `
            <tr>
              <td><b>${t.source}</b></td>
              <td>${t.department?.name || 'Operations'}</td>
              <td style="color: #f43f5e; font-weight: bold;">${t.co2eKg} kg</td>
              <td>${t.quantity}</td>
              <td>${t.unit}</td>
              <td>${new Date(t.date).toLocaleDateString()}</td>
              <td>${t.description || ''}</td>
            </tr>
          `;
        });
        htmlContent += `</tbody></table>`;
      }

      if (module === "all" || module === "social") {
        htmlContent += `
          <h2>Social (CSR Activity Participations)</h2>
          <table>
            <thead>
              <tr><th>Employee</th><th>Department</th><th>Activity</th><th>Status</th><th>Points</th><th>Date</th></tr>
            </thead>
            <tbody>
        `;
        participations.forEach(p => {
          htmlContent += `
            <tr>
              <td><b>${p.user.name || p.user.email}</b></td>
              <td>${p.user.department?.name || 'Unassigned'}</td>
              <td>${p.activity.title}</td>
              <td><span style="text-transform: uppercase; font-size: 10px; font-weight: bold; color: ${p.approvalStatus === 'APPROVED' ? '#10b981' : '#f59e0b'}">${p.approvalStatus}</span></td>
              <td>+${p.pointsEarned} pts</td>
              <td>${p.completionDate ? new Date(p.completionDate).toLocaleDateString() : ''}</td>
            </tr>
          `;
        });
        htmlContent += `</tbody></table>`;
      }

      if (module === "all" || module === "governance") {
        htmlContent += `
          <h2>Governance (Compliance Issues)</h2>
          <table>
            <thead>
              <tr><th>Issue Title</th><th>Severity</th><th>Owner</th><th>Department</th><th>Due Date</th><th>Status</th></tr>
            </thead>
            <tbody>
        `;
        complianceIssues.forEach(i => {
          htmlContent += `
            <tr>
              <td><b>${i.title}</b></td>
              <td>${i.severity}</td>
              <td>${i.owner?.name || 'Unassigned'}</td>
              <td>${i.owner?.department?.name || 'Unassigned'}</td>
              <td>${new Date(i.dueDate).toLocaleDateString()}</td>
              <td>${i.status}</td>
            </tr>
          `;
        });
        htmlContent += `</tbody></table>`;
      }

      htmlContent += `
        </body>
        </html>
      `;

      return new NextResponse(htmlContent, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    }

    // Default JSON fallback
    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
  } catch (error: any) {
    console.error("Report Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate report" }, { status: 500 });
  }
}
