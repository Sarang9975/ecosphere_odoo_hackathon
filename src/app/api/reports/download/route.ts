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

    // Default JSON fallback
    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
  } catch (error: any) {
    console.error("Report Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate report" }, { status: 500 });
  }
}
