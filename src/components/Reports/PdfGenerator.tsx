import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/types";
import { format } from "date-fns";
import { Button } from "../../@/components/ui/button";
import config from "../../config";
function PdfGenerator() {
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [pdfData, setPdfData] = useState<any[]>([]); // Initialize pdfData as an empty

  const fetchData = async () => {
    try {
      const response = await fetch(
        `${config.API_URL}/v1/data/${formattedDate}`
      );
      if (response.ok) {
        const data = await response.json();
        setPdfData(data.dataForPDF);
      } else {
        console.error("Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [formattedDate]);

  // const generatePDF = async () => {
  //   const doc = new jsPDF();
  //   doc.text("Report Heading", 10, 10);

  //   const columns = [
  //     "Total Hour",
  //     "Machine On Time",
  //     "Rejection Quantity",
  //     "Actual Production",
  //     "part_2055566_3rd",
  //     "Production",
  //     "Target Production",
  //     "First Cycle",
  //     "Last Cycle",
  //     "part_8PEE027000161N_2ND",
  //     "Average Cycle Time",
  //     "Production Time",
  //     "Ideal Time",
  //     "Mhr Loss",
  //   ];
  //   const rows = pdfData.map(
  //     (
  //       item: {
  //         totalHour: number;
  //         machineOnTime: number;
  //         rejectionQuantity: number;
  //         actualProduction: number;
  //         part_2055566_3rd: number;
  //         production: number;
  //         targetProduction: number;
  //         firstCycle: number;
  //         lastCycle: number;
  //         part_8PEE027000161N_2ND: number;
  //         avgCycleTime: number;
  //         productionTime: number;
  //         idealTime: number;
  //         mhrLoss: number;
  //       },
  //       index: number
  //     ) => [
  //       // index + 1,
  //       item.totalHour,
  //       item.machineOnTime,
  //       item.rejectionQuantity,
  //       item.actualProduction,
  //       item.part_2055566_3rd,
  //       item.production,
  //       item.targetProduction,
  //       item.firstCycle,
  //       item.lastCycle,
  //       item.part_8PEE027000161N_2ND,
  //       item.avgCycleTime,
  //       item.productionTime,
  //       item.idealTime,
  //       item.mhrLoss,
  //     ]
  //   );

  //   autoTable(doc, {
  //     head: [columns],
  //     body: rows,
  //     startY: 20,
  //     theme: "grid",

  //     didDrawPage: (data) => {
  //       doc.text("Production Summary : ", data.settings.margin.left, 15);
  //     },
  //   });

  //   doc.save(`${formattedDate}Report.pdf`);
  // };

  const generatePDF = async () => {
    const doc = new jsPDF();
    doc.text("Report Heading", 10, 10);

    const columns = [
      ["Total Hour", "Machine On Time", "Rejection Quantity"],
      ["Actual Production", "part_2055566_3rd", "Production"],
      ["Target Production", "First Cycle", "Last Cycle"],
      ["part_8PEE027000161N_2ND", "Average Cycle Time", "Production Time"],
      ["Ideal Time", "Mhr Loss"],
    ];

    const rows = pdfData.map(
      (
        item: {
          totalHour: number;
          machineOnTime: number;
          rejectionQuantity: number;
          actualProduction: number;
          part_2055566_3rd: number;
          production: number;
          targetProduction: number;
          firstCycle: number;
          lastCycle: number;
          part_8PEE027000161N_2ND: number;
          avgCycleTime: number;
          productionTime: number;
          idealTime: number;
          mhrLoss: number;
        },
        index: number
      ) => [
        item.totalHour,
        item.machineOnTime,
        item.rejectionQuantity,
        item.actualProduction,
        item.part_2055566_3rd,
        item.production,
        item.targetProduction,
        item.firstCycle,
        item.lastCycle,
        item.part_8PEE027000161N_2ND,
        item.avgCycleTime,
        item.productionTime,
        item.idealTime,
        item.mhrLoss,
      ]
    );

    let startY = 20;
    let maxY = startY;

    columns.forEach((group) => {
      const estimatedTableHeight = (rows.length + 1) * 10;
      maxY = startY + estimatedTableHeight;

      autoTable(doc, {
        head: [group],
        body: rows,
        startY,
        theme: "grid",
        didDrawPage: (data) => {
          doc.text("Production Summary : ", data.settings.margin.left, 15);
        },
      });

      startY = maxY + 1;
    });

    doc.save(`${formattedDate}Report.pdf`);
  };

  return (
    <div>
      <Button variant={"outline"} onClick={generatePDF}>
        Export as PDF
      </Button>
    </div>
  );
}

export default PdfGenerator;
