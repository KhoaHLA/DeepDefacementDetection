// src/components/EmployeeCountChart.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import ReactECharts from "echarts-for-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { SelectChangeEvent } from "@mui/material"; // Import SelectChangeEvent
import axios from "axios";

interface Props {
  reloadTrigger: number; // số sẽ tăng khi cần reload
}

const EmployeeCountChart = ({ reloadTrigger }: Props) => {
  const { t } = useTranslation("common");
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [chartData, setChartData] = useState({
    defaced: Array(12).fill(0),
    cleaned: Array(12).fill(0),
  });

  const handleYearChange = (event: SelectChangeEvent<number>) => {
    setSelectedYear(event.target.value as number);
  };

  useEffect(() => {
    axios
      .get(`http://localhost:8000/stats`, {
        params: { year: selectedYear },
      })
      .then((response) => {
        setChartData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching chart data:", error);
      });
  }, [selectedYear, reloadTrigger]);

  const [percent, setPercent] = useState(0);
  const [totalCleanedSelectedYear, setTotalCleanedSelectedYear] = useState(0);
  const [totalDefacedSelectedYear, setTotalDefacedSelectedYear] = useState(0);

  useEffect(() => {
    axios
      .get("http://localhost:8000/count-by-year", {
        params: { year: selectedYear },
      })
      .then((res) => {
        setTotalCleanedSelectedYear(res.data.cleaned);
        setTotalDefacedSelectedYear(res.data.defaced);
      })
      .catch((err) => {
        console.error("Lỗi khi gọi API growth-rate:", err);
      });
  }, [selectedYear, reloadTrigger]);

  useEffect(() => {
    const currentYear = new Date().getFullYear();

    axios
      .get("http://localhost:8000/growth-rate", {
        params: { year: currentYear },
      })
      .then((res) => {
        setPercent(res.data.percent_change);
      })
      .catch((err) => {
        console.error("Lỗi khi gọi API growth-rate:", err);
      });
  }, [reloadTrigger]);

  const option = {
    animation: true,
    animationDuration: 700,
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(250, 250, 250, 0.98)",
      borderColor: "rgba(250, 250, 250, 0.98)",
      textStyle: {
        color: "rgba(20, 26, 25, 0.98)",
      },
    },
    legend: {
      data: [
        t("Cleaned") + " " + selectedYear.toString(),
        t("Defaced") + " " + selectedYear.toString(),
      ],
      textStyle: {
        color: "#000000",
        fontFamily: "Arial, sans-serif",
      },
      formatter: (name: string) => {
        const name2 = name.split(" ")[0];
        const total =
          name2 === "Cleaned"
            ? totalCleanedSelectedYear
            : totalDefacedSelectedYear;
        return `${name} (${t("Tổng")}: ${total})`;
      },
      itemGap: 30,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: true,
      axisLine: {
        lineStyle: {
          color: "#637381",
        },
      },
      splitLine: {
        lineStyle: {
          type: "dashed",
          color: "#e9ecee",
        },
      },
      data: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    },
    yAxis: {
      type: "value",
      axisLine: {
        lineStyle: {
          color: "#637381",
        },
      },
      splitLine: {
        lineStyle: {
          type: "dashed",
          color: "#e9ecee",
        },
      },
    },
    series: [
      {
        name: t("Cleaned") + " " + selectedYear.toString(),
        type: "bar",
        data: chartData.cleaned,
        barWidth: "27%",
        itemStyle: {
          color: "#00a76f",
          borderRadius: [6, 6, 0, 0],
        },
      },
      {
        name: t("Defaced") + " " + selectedYear.toString(),
        type: "bar",
        data: chartData.defaced,
        barWidth: "27%",
        itemStyle: {
          color: "#d24c2f",
          borderRadius: [6, 6, 0, 0],
        },
      },
    ],
  };

  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        width: "100%",
        padding: "24px 5px 15px",
        borderRadius: "15px",
        backgroundColor: "var(--background-item)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          padding: "0 20px",
          mb: "24px",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "var(--text-color)",
              fontFamily: "NunitoSans",
            }}
          >
            {t("TỔNG SỐ LƯỢNG KIỂM TRA THEO THÁNG")}
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
              mt: "4px",
              color: theme === "dark" ? "#919EAB" : "#637381",
              fontFamily: "NunitoSans",
            }}
          >
            {"(" +
              (percent > 0 ? "+" : "") +
              percent +
              "%) " +
              t("SO VỚI NĂM NGOÁI", { year: selectedYear - 1 })}
          </Typography>
        </Box>

        <FormControl sx={{ width: "90px" }}>
          <Select
            defaultValue={currentYear}
            onChange={handleYearChange}
            sx={{
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "var(--border-color)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                border: "1px solid var(--border-color)", // Đặt border cho trạng thái focus
              },
              "& fieldset": {
                borderRadius: "8px",
                borderColor: "var(--border-color)",
              },
              "& .MuiSelect-icon": {
                color: "var(--text-color)",
              },
              "& .MuiInputBase-input": {
                color: "var(--text-color)",
                padding: "10px",
              },
            }}
            MenuProps={{
              PaperProps: {
                elevation: 0,
                sx: {
                  width: "120px",
                  mt: "2px",
                  borderRadius: "8px",
                  padding: "0 8px",
                  backgroundImage:
                    "url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSJ1cmwoI3BhaW50MF9yYWRpYWxfMjc0OV8xNDUxODYpIiBmaWxsLW9wYWNpdHk9IjAuMTIiLz4KPGRlZnM+CjxyYWRpYWxHcmFkaWVudCBpZD0icGFpbnQwX3JhZGlhbF8yNzQ5XzE0NTE4NiIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSgxMjAgMS44MTgxMmUtMDUpIHJvdGF0ZSgtNDUpIHNjYWxlKDEyMy4yNSkiPgo8c3RvcCBzdG9wLWNvbG9yPSIjMDBCOEQ5Ii8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzAwQjhEOSIgc3RvcC1vcGFjaXR5PSIwIi8+CjwvcmFkaWFsR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==), url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSJ1cmwoI3BhaW50MF9yYWRpYWxfMjc0OV8xNDUxODcpIiBmaWxsLW9wYWNpdHk9IjAuMTIiLz4KPGRlZnM+CjxyYWRpYWxHcmFkaWVudCBpZD0icGFpbnQwX3JhZGlhbF8yNzQ5XzE0NTE4NyIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSgwIDEyMCkgcm90YXRlKDEzNSkgc2NhbGUoMTIzLjI1KSI+CjxzdG9wIHN0b3AtY29sb3I9IiNGRjU2MzAiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRkY1NjMwIiBzdG9wLW9wYWNpdHk9IjAiLz4KPC9yYWRpYWxHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K)",
                  backgroundPosition: "top right, bottom left",
                  backgroundSize: "50%, 50%",
                  backgroundRepeat: "no-repeat",
                  backdropFilter: "blur(20px)",
                  backgroundColor: "var(--background-item)",
                  color: "var(--text-color)",
                  border: "1px solid var(--border-color)",
                  "& .MuiMenuItem-root": {
                    "&:hover": { backgroundColor: "var(--hover-color)" },
                    "&.Mui-selected": {
                      backgroundColor: "var(--background-selected-item)",
                      "&:hover": { backgroundColor: "var(--hover-color)" },
                    },
                  },
                },
              },
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "right", // Căn chỉnh bên phải
              },
              transformOrigin: {
                vertical: "top",
                horizontal: "right", // Căn chỉnh bên phải
              },
            }}
          >
            {[...Array(currentYear - 2022)].map((_, index) => {
              const year = currentYear - index;
              return (
                <MenuItem
                  key={year}
                  value={year}
                  sx={{
                    borderRadius: "6px",
                    "&:last-child": {
                      mt: "3px",
                    },
                  }}
                >
                  {year}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Box>
      <ReactECharts option={option} style={{ height: 500 }} />
    </Paper>
  );
};

export default EmployeeCountChart;
