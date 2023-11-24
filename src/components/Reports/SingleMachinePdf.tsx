import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/types";
import { differenceInHours, format, parseISO } from "date-fns";
import { Button } from "../../@/components/ui/button";
import axios from "axios";
import Top_Logo from "../../assets/images/pdfReport/topbrand.jpg";
import html2canvas from "html2canvas";
import config from "../../config";
interface PdfData {
  startDate: string;
  endDate: string;
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
  idleTime: number;
  mhrLoss: number;
  reportTime: number;
}

function SingleMachinePdf(props: {
  Name: any;
  utilizationTrendRef: React.RefObject<any>;
}) {
  const Name = props.Name;
  const utilizationTrendRef = props.utilizationTrendRef;

  const [pdfData, setPdfData] = useState<PdfData | null>(null);
  const [formattedDate, setFormattedDate] = useState<string>("");
  const from = useSelector((state: RootState) => state.app.startDate);
  const to = useSelector((state: RootState) => state.app.endDate);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    if (from) {
      setStartDate(format(from, "yyyy-MM-dd'T'HH:mm:ss'Z'"));
    }
    if (to) {
      setEndDate(format(to, "yyyy-MM-dd'T'HH:mm:ss'Z'"));
    }
  }, [from, to]);

  useEffect(() => {
    console.log("Pdf API called");
    console.log(Name);

    const requestData = {
      startDate: startDate,
      endDate: endDate,
      machineName: Name,
    };

    const fetchData = async () => {
      try {
        const response = await axios.post(
          `${config.API_URL}/v1/controllerdata/pdf`,
          requestData
        );

        const { data } = response;

        console.log(data);

        if (data && data.machineData) {
          console.log("The response contains", data.machineData);

          setPdfData(data.machineData);
          console.log(pdfData);
        } else {
          console.error("Response does not contain dataForPDF");
        }
      } catch (error) {
        console.error("Error making POST request:", error);
      }
    };

    fetchData();
  }, [startDate, endDate, Name]);

  const generatePdf = async () => {
    const doc = new jsPDF({ format: "a4", compress: true });

    if (Top_Logo) {
      let logo = new Image();
      logo.src = Top_Logo;
      doc.addImage(logo, "PNG", 0, 0, 210, 0);
      let summaryColumns = [
        "MacID",
        "Starting Time",
        "Ending Time",
        "Total Time (hr)",
      ];
      let summaryRows = [
        [
          Name,
          pdfData ? pdfData.startDate : "",
          pdfData ? pdfData.endDate : "",
          pdfData ? pdfData.reportTime / 3600 : "00:00",
        ],
      ];
      autoTable(doc, {
        startY: 70, // Adjust the Y position as needed
        head: [summaryColumns],
        body: summaryRows,
        theme: "grid",
      });
    }

    if (pdfData) {
      const rows = [
        [
          "Total Hour :",
          pdfData.reportTime / 3600,
          "Machine On Time :",
          (pdfData.machineOnTime / 3600).toFixed(2),
          "Rejection Quantity :",
          pdfData.rejectionQuantity,
        ],
        [
          "Actual Production :",
          pdfData.actualProduction.toString(),
          "Part 2055566 3rd :",
          pdfData.part_2055566_3rd.toString(),
          "Production Count :",
          pdfData.production.toString(),
        ],
        [
          "Target Production",
          pdfData.targetProduction.toString(),
          "First Cycle",
          pdfData.firstCycle.toString(),
          "Last Cycle",
          pdfData.lastCycle.toString(),
        ],
        [
          "Production Time(hr) :",
          (pdfData.productionTime / 3600).toFixed(2).toString(),
          "Idle Time(hr) :",
          (pdfData.idleTime / 3600).toFixed(2).toString(),
          "Mhr Loss",
          pdfData.mhrLoss.toString(),
        ],
        [
          "Part 8PEE027000161N 2ND",
          pdfData.part_8PEE027000161N_2ND.toString(),
          "Average Cycle Time",
          pdfData.avgCycleTime.toString(),
        ],
      ];

      autoTable(doc, {
        startY: 90, // Adjust the Y position as needed
        head: [],
        body: rows,
      });
    }

    if (utilizationTrendRef.current) {
      doc.addPage();
      let utilizationTrendChart = await html2canvas(
        utilizationTrendRef.current
      );
      doc.addImage(utilizationTrendChart, "PNG", 0, 0, 210, 74.25);
    }

    doc.save(`machine_report${Name}.pdf`);
  };

  return (
    <div style={{ marginLeft: "2vw" }}>
      <Button variant={"outline"} onClick={generatePdf}>
        Export as PDF
      </Button>
    </div>
  );
}

export default SingleMachinePdf;
