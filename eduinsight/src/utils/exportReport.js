// /src/utils/exportReport.js
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Exports a dashboard section to PDF with header/footer branding
 * @param {string} elementId - The DOM element id to capture (e.g. 'analytics-dashboard')
 * @param {string} filename - The base name for the downloaded PDF
 */
export const exportDashboardToPDF = async (elementId, filename) => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error("❌ Element not found for export:", elementId);
    return;
  }

  try {
    // Capture the dashboard visually
    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#0b1220",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    // Define margins & scaling
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // 🧭 Header details
    const headerTitle = "EduInsight — School of Computing & Informatics";
    const headerSubtitle = "Course Analytics Dashboard Report";
    const dateStr = new Date().toLocaleString("en-MY", {
      dateStyle: "long",
      timeStyle: "short",
    });

    // 🧭 Footer details
    const footerText = `Generated on: ${dateStr} | © 2025 Albukhary International University`;

    // Add header
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text(headerTitle, 10, 15);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.text(headerSubtitle, 10, 22);

    // Horizontal separator
    pdf.setDrawColor(200, 200, 200);
    pdf.line(10, 25, pageWidth - 10, 25);

    // Add captured dashboard image
    pdf.addImage(imgData, "PNG", 10, 30, imgWidth, imgHeight);

    // Add footer at bottom
    const footerY = pdf.internal.pageSize.getHeight() - 10;
    pdf.setFontSize(9);
    pdf.setTextColor(120, 120, 120);
    pdf.text(footerText, 10, footerY);

    // Save file
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("❌ Error exporting dashboard:", error);
  }
};
