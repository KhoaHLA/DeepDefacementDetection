"use client";
import {
  Box,
  InputAdornment,
  TextField,
  Typography,
  Button,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import styled from "styled-components";
import { Fleur_De_Leah } from "next/font/google";
import StarIcon from "@mui/icons-material/Star";
import EmployeeCountChart from "./EmployeeCountChart";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useInView } from "react-intersection-observer";
import { SxProps, Theme } from "@mui/system";

interface SectionProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>; // sx là optional, kiểu theo MUI
}

const AnimatedBoxOnScroll = styled(Box)`
  opacity: 0;
  transform: translateY(-200px);
  transition: opacity 0.6s ease, transform 0.6s ease;

  &.visible {
    opacity: 1;
    transform: translateY(0);
  }
`;

function Section({ children, sx }: SectionProps) {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <AnimatedBoxOnScroll ref={ref} className={inView ? "visible" : ""} sx={sx}>
      {children}
    </AnimatedBoxOnScroll>
  );
}

const sections = [
  { label: "Trang chủ", scrollPercentage: 0 },
  { label: "Giới thiệu", scrollPercentage: 24 },
  { label: "Kiểm tra", scrollPercentage: 51 },
  { label: "Thống kê", scrollPercentage: 77 },
  { label: "Liên hệ", scrollPercentage: 100 },
];

const Navbar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      setIsVisible(currentScrollPos <= prevScrollPos);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  const handleScrollToSection = (percentage: number) => {
    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const targetScrollPos = (scrollHeight * percentage) / 100;
    window.scrollTo({
      top: targetScrollPos,
      behavior: "smooth",
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        top: isVisible ? "30px" : "-100px",
        left: "700px",
        width: "50%",
        height: "80px",
        backgroundColor: "white",
        padding: "20px 40px",
        zIndex: 1000,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: "100px",
        background: "white",
        boxShadow: "0 0 15px 5px rgba(3, 215, 148, 0.3)",
        transition: "top 0.3s ease-in-out",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontWeight: "bold",
          fontSize: "24px",
        }}
      >
        <img
          src="/images/logo.png"
          alt="Logo"
          style={{
            width: 100,
            marginRight: "10px",
            objectFit: "contain",
          }}
        />
      </div>

      <ul
        style={{
          listStyle: "none",
          display: "flex",
          gap: "30px",
        }}
      >
        {sections.map((section, index) => (
          <li key={index}>
            <a
              style={{
                textDecoration: "none",
                color: "#333",
                fontSize: "16px",
                fontWeight: "500",
                borderRadius: "8px",
                cursor: "pointer",
                fontFamily: "NunitoSans",
              }}
              onClick={() => handleScrollToSection(section.scrollPercentage)}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>

      <div
        style={{
          display: "flex",
          gap: "20px",
          paddingRight: "20px",
        }}
      >
        <button
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            fontWeight: "500",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            backgroundColor: "#00b049",
            color: "white",
            fontFamily: "NunitoSans",
          }}
          onClick={() => handleScrollToSection(51)}
        >
          Kiểm tra
        </button>
      </div>
    </div>
  );
};

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const handleSearchKeyword = () => {};
  const [isCleaned, setIsCleaned] = useState(false);
  const [url, setUrl] = useState("");
  const [screenshot, setScreenshot] = useState("");
  const [confidence, setConfidence] = useState(0);

  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);

  const { ref, inView } = useInView({
    threshold: 0.1, // Khi 10% phần tử vào viewport sẽ active
    triggerOnce: true, // Chỉ chạy 1 lần
  });

  const handlePredict = async () => {
    setIsLoading(true);
    setIsVisible(false);
    try {
      const res = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      setIsCleaned(data.prediction === 1 ? false : true);
      setConfidence(data.confidence);
      setScreenshot(`data:image/png;base64,${data.screenshot_base64}`);

      addInformation(data.confidence, data.url, data.screenshot_base64);

      setIsLoading(false);
      setIsVisible(true);
    } catch (err) {
      //alert("Lỗi: Không thể phân tích website");
    } finally {
      setIsLoading(false);
    }
  };

  const addInformation = async (
    confidence: any,
    link_url: any,
    image_url: any
  ) => {
    try {
      const payload = {
        link_url: link_url || "", // Bắt buộc
        image_url: image_url || null, // Có thể null
        confidence: Number(confidence), // Đảm bảo là số
      };

      const res = await fetch("http://localhost:8000/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Server error:", error);
        throw new Error(error.detail || "Unknown error");
      }
      setReloadKey((prev) => prev + 1);
    } catch (err) {
      //alert("Lỗi: Không thể lưu thông tin vào database");
    }
  };

  return (
    <Box
      sx={{
        backgroundImage: "url(/images/bg_1.jpg)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        width: "100%",
        height: "100vh",
      }}
    >
      <Navbar />
      <Section
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "stretch",
          gap: "24px",
          height: "100vh",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "calc(100% / 2 - 8px)",
            flexDirection: "column",
            gap: "3vh",
          }}
        >
          <Box
            sx={{
              width: "calc(100% / 3 * 2 - 8px)",
            }}
          >
            <Typography
              style={{
                color: "white",
                fontSize: 50,
                fontFamily: "NunitoSans",
              }}
            >
              DeepDeface Detector{" "}
            </Typography>
          </Box>
          <Box
            sx={{
              width: "calc(100% / 5 * 3 - 8px)",
            }}
          >
            {" "}
            <Typography
              style={{ color: "white", fontSize: 20, fontFamily: "NunitoSans" }}
            >
              Hệ thống bao gồm giao diện website trực quan cho phép người dùng
              tải lên dữ liệu và nhận kết quả phân loại (bị tấn công hoặc bình
              thường) theo thời gian thực{" "}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "calc(100% / 2 - 8px)",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "row", gap: "24px" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                mt: "50px",
              }}
            >
              <Box>
                <Image
                  src="/images/16406598_rm373batch3-socialmediapost-05.jpg"
                  alt="Ảnh đại diện"
                  width={200}
                  height={200}
                  style={{
                    height: "250px",
                    width: "200px",
                    borderRadius: "15px",
                  }}
                />
              </Box>
              <Box>
                <Image
                  src="/images/hacker_2.jpg"
                  alt="Ảnh đại diện"
                  width={200}
                  height={200}
                  style={{
                    height: "250px",
                    width: "200px",
                    borderRadius: "15px",
                  }}
                />
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                src="/images/129788.jpg"
                alt="Ảnh đại diện"
                width={200}
                height={200}
                style={{
                  height: "300px",
                  width: "200px",
                  borderRadius: "15px",
                }}
              />
            </Box>
          </Box>
        </Box>
      </Section>
      <Box
        sx={{
          height: "400vh",
          background:
            "linear-gradient(45deg,rgb(255, 255, 255),rgb(221, 249, 252))",
        }}
      >
        <Section sx={{ height: "100vh" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <Typography
              sx={{
                fontSize: "50px",
                background:
                  "linear-gradient(45deg,rgb(87, 241, 234),rgb(30, 219, 204))",
                WebkitBackgroundClip: "text",
                color: "transparent",
                fontFamily: "NunitoSans",
              }}
            >
              Giới thiệu
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "100px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                width: "calc(100% / 4 - 16px)",
                height: "100vh",
                borderTopLeftRadius: "15px",
                borderTopRightRadius: "15px",
                alignItems: "center",
                flexDirection: "column",
                backgroundColor: "white",
                borderRadius: "15px",
              }}
            >
              <Image
                src="/images/introduction.jpg"
                alt="Ảnh đại diện"
                width={200}
                height={200}
                style={{
                  height: "40vh",
                  width: "100%",
                  borderTopLeftRadius: "15px",
                  borderTopRightRadius: "15px",
                }}
              />
              <Typography
                sx={{
                  fontSize: "30px",
                  background:
                    "linear-gradient(45deg,rgb(87, 241, 234),rgb(30, 219, 204))",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                Giới thiệu vấn đề
              </Typography>
              <Box
                sx={{
                  padding: "10px",
                  width: "calc(100% / 10 * 9 - 16px)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <Typography
                  sx={{
                    color: "black",
                    fontSize: "20px",
                    fontFamily: "NunitoSans",
                  }}
                >
                  - Web defacement là hình thức tấn công thay đổi giao diện
                  trang web, gây ảnh hưởng đến uy tín và tài chính sản phẩm.
                </Typography>
                <Typography
                  sx={{
                    color: "black",
                    fontSize: "20px",
                    fontFamily: "NunitoSans",
                  }}
                >
                  - Website đề xuất phát hiện defacement bằng mô hình học sâu
                  phân loại trang web “Cleaned” và “Defaced”.
                </Typography>
              </Box>
              <Box
                sx={{
                  mt: "10px",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "30px",
                    color: "rgb(248, 120, 0)",
                    fontFamily: "NunitoSans",
                  }}
                >
                  5.0
                </Typography>
                <StarIcon sx={{ color: "rgb(248, 120, 0)", fontSize: 30 }} />
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                width: "calc(100% / 4 - 16px)",
                height: "100vh",
                borderTopLeftRadius: "15px",
                borderTopRightRadius: "15px",
                alignItems: "center",
                flexDirection: "column",
                backgroundColor: "white",
                borderRadius: "15px",
              }}
            >
              <Image
                src="/images/data_model.jpg"
                alt="Ảnh đại diện"
                width={200}
                height={200}
                style={{
                  height: "40vh",
                  width: "100%",
                  borderTopLeftRadius: "15px",
                  borderTopRightRadius: "15px",
                }}
              />
              <Typography
                sx={{
                  fontSize: "30px",
                  background:
                    "linear-gradient(45deg,rgb(87, 241, 234),rgb(30, 219, 204))",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  fontFamily: "NunitoSans",
                }}
              >
                Dữ liệu và mô hình
              </Typography>
              <Box
                sx={{
                  padding: "10px",
                  width: "calc(100% / 10 * 9 - 16px)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <Typography
                  sx={{
                    color: "black",
                    fontSize: "20px",
                    fontFamily: "NunitoSans",
                  }}
                >
                  - Dữ liệu gồm HTML (xử lý bằng BiLSTM) và ảnh chụp màn hình
                  (xử lý bằng ResNet50).
                </Typography>
                <Typography
                  sx={{
                    color: "black",
                    fontSize: "20px",
                    fontFamily: "NunitoSans",
                  }}
                >
                  - Hai mô hình con hoạt động song song và được kết hợp bằng
                  phương pháp Soft Voting.
                </Typography>
              </Box>
              <Box
                sx={{
                  mt: "10px",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "30px",
                    color: "rgb(248, 120, 0)",
                    fontFamily: "NunitoSans",
                  }}
                >
                  5.0
                </Typography>
                <StarIcon sx={{ color: "rgb(248, 120, 0)", fontSize: 30 }} />
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                width: "calc(100% / 4 - 16px)",
                height: "100vh",
                borderTopLeftRadius: "15px",
                borderTopRightRadius: "15px",
                alignItems: "center",
                flexDirection: "column",
                backgroundColor: "white",
                borderRadius: "15px",
              }}
            >
              <Image
                src="/images/development.jpg"
                alt="Ảnh đại diện"
                width={200}
                height={200}
                style={{
                  height: "40vh",
                  width: "100%",
                  borderTopLeftRadius: "15px",
                  borderTopRightRadius: "15px",
                }}
              />
              <Typography
                sx={{
                  fontSize: "30px",
                  background:
                    "linear-gradient(45deg,rgb(87, 241, 234),rgb(30, 219, 204))",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  fontFamily: "NunitoSans",
                }}
              >
                Hướng phát triển
              </Typography>
              <Box
                sx={{
                  padding: "10px",
                  width: "calc(100% / 10 * 9 - 16px)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <Typography
                  sx={{
                    color: "black",
                    fontSize: "20px",
                    fontFamily: "NunitoSans",
                  }}
                >
                  - Kết hợp đặc trưng văn bản và hình ảnh giúp giảm cảnh báo
                  sai, hoạt động tốt trên cả trang tĩnh và động.
                </Typography>
                <Typography
                  sx={{
                    color: "black",
                    fontSize: "20px",
                    fontFamily: "NunitoSans",
                  }}
                >
                  - Tối ưu mô hình để giảm chi phí tính toán và nâng cao độ
                  chính xác trong các hệ thống real-time.
                </Typography>
              </Box>
              <Box
                sx={{
                  mt: "10px",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "30px",
                    color: "rgb(248, 120, 0)",
                    fontFamily: "NunitoSans",
                  }}
                >
                  5.0
                </Typography>
                <StarIcon sx={{ color: "rgb(248, 120, 0)", fontSize: 30 }} />
              </Box>
            </Box>
          </Box>
        </Section>
        <Section sx={{ height: "100vh", marginTop: 20 }}>
          <Box
            display="flex"
            alignItems="center"
            gap="24px"
            margin="100px"
            flexDirection={"row"}
          >
            <Box
              sx={{
                position: "relative",
                width: "45%",
                height: "55px",
              }}
            >
              <TextField
                id="location-search"
                type="search"
                placeholder={"Tìm kiếm"}
                variant="outlined"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                sx={{
                  color: "var(--text-color)",
                  padding: "0px",
                  width: "100%",
                  "& fieldset": {
                    borderRadius: "10px",
                    borderColor: "var(--border-color)",
                  },
                  "& .MuiInputBase-root": {
                    paddingLeft: "0px",
                    paddingRight: "12px",
                  },
                  "& .MuiInputBase-input": {
                    padding: "15px 0px",
                    color: "var(--text-color)",
                    fontSize: "16px",
                    "&::placeholder": {
                      color: "var(--placeholder-color)",
                      opacity: 1,
                    },
                  },
                  "& .MuiOutlinedInput-root:hover fieldset": {
                    borderColor: "var(--hover-field-color)",
                  },
                  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                    borderColor: "var(--selected-field-color)",
                  },
                }}
                onKeyDown={() => {
                  handleSearchKeyword();
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{
                          mr: 0,
                        }}
                      >
                        <Box
                          sx={{
                            height: "100%",
                            color: "#a5bed4",
                            padding: "10.5px",
                            zIndex: 100,
                          }}
                        >
                          <SearchIcon />
                        </Box>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>
            <Button
              onClick={handlePredict}
              sx={{
                backgroundColor: "#00b049",
                width: "100px",
                height: "50px",
                borderRadius: "10px",
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
              }}
            >
              <Typography
                sx={{
                  color: "white",
                  fontWeight: "bold",
                  fontFamily: "NunitoSans",
                }}
              >
                Kiểm tra
              </Typography>
            </Button>
            {isLoading && (
              <Typography
                sx={{
                  color: "#00b049",
                  fontWeight: "bold",
                  fontFamily: "NunitoSans",
                }}
              >
                Vui lòng chờ...
              </Typography>
            )}
            {isVisible && (
              <>
                <Typography
                  sx={{
                    color: isCleaned ? "#00b049" : "red",
                    fontWeight: "bold",
                    fontFamily: "NunitoSans",
                  }}
                >
                  {isCleaned
                    ? "Trang web này không bị tấn công(CLEAN)"
                    : "Trang web này đã bị tấn công(DEFACE)"}
                </Typography>
                <Typography
                  sx={{ fontStyle: "italic", fontFamily: "NunitoSans" }}
                >
                  {"Độ tin cậy: " + confidence}
                </Typography>
              </>
            )}
            {/* <Box
              sx={{
                display: "flex",
                marginLeft: "auto",
                borderColor: "black",
                borderWidth: 2,
                borderRadius: "10px",
              }}
            >
              <Button
                onClick={() => setIsModalOpen(true)}
                sx={{
                  width: "100px",
                  height: "50px",
                  justifyContent: "center",
                  alignItems: "center",
                  display: "flex",
                }}
              >
                <Typography
                  sx={{
                    color: "black",
                    fontWeight: "bold",
                    fontFamily: "NunitoSans",
                  }}
                >
                  Lịch sử
                </Typography>
              </Button>
            </Box> */}
          </Box>
          <Box
            sx={{
              borderColor: "black",
              borderWidth: 1,
              width: "calc(100% / 9 * 8)",
              height: "80vh",
              marginLeft: "100px",
              borderRadius: "15px",
            }}
          >
            {!screenshot ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 40,
                }}
              >
                <Image
                  src="/images/empty_image.png"
                  alt="Ảnh đại diện"
                  width={200}
                  height={200}
                  style={{
                    height: "10%",
                    width: "10%",
                    borderRadius: "15px",
                  }}
                />
              </Box>
            ) : (
              <img
                src={screenshot}
                alt="Ảnh phân tích"
                style={{
                  height: "100%",
                  width: "100%",
                  borderRadius: "15px",
                }}
              />
            )}
          </Box>
        </Section>
        <Section sx={{ height: "100vh", marginTop: 5 }}>
          {" "}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Typography
              sx={{
                fontSize: "50px",
                background:
                  "linear-gradient(45deg,rgb(87, 241, 234),rgb(30, 219, 204))",
                WebkitBackgroundClip: "text",
                color: "transparent",
                fontFamily: "NunitoSans",
              }}
            >
              Thống kê
            </Typography>
          </Box>
          <Box
            sx={{
              width: "calc(100%)",
              display: "flex",
              justifyContent: "center",
              alignItems: "stretch",
              gap: "24px",
              height: "100vh",
              paddingLeft: 10,
              paddingRight: 10,
            }}
          >
            <Box
              sx={{
                width: "calc(100%/10*9)",
                boxShadow: "var(--box-shadow-paper)",
                borderRadius: "15px",
                overflow: "hidden",
              }}
            >
              <EmployeeCountChart reloadTrigger={reloadKey} />
            </Box>
          </Box>
        </Section>

        <Section sx={{ height: "100vh" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              marginLeft: "10vh",
              height: "60vh",
              alignItems: "center",
              background:
                "linear-gradient(45deg,rgb(128, 236, 220),rgb(40, 172, 161))",
              borderTopLeftRadius: 360,
              borderBottomLeftRadius: 360,
            }}
          >
            <Box
              sx={{
                display: "flex",
                width: "calc(100% / 4 - 16px)",
                height: "100%",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 5,
                marginLeft: 10,
              }}
            >
              <Image
                src="/images/logo.png"
                alt="Ảnh đại diện"
                width={200}
                height={200}
                style={{
                  height: "10vh",
                  width: "calc(100%/3*2)",
                  borderRadius: "15px",
                }}
              />
              <Typography
                sx={{
                  width: "calc(100%/3 * 2)",
                  fontSize: "20px",
                  fontFamily: "NunitoSans",
                }}
              >
                {" "}
                Cảm ơn bạn đã sử dụng sản phẩm của chúng tôi, mọi thắc mắc xin
                liên hệ với chúng tôi để được xử lý kịp thời!
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                width: "calc(100% / 4 - 16px)",
                height: "100%",
                flexDirection: "column",
                justifyContent: "center",
                gap: 5,
              }}
            >
              <Typography
                sx={{
                  fontSize: "25px",
                  fontWeight: "bold",
                  fontFamily: "NunitoSans",
                }}
              >
                Full Name
              </Typography>
              <Typography sx={{ fontSize: "20px", fontFamily: "NunitoSans" }}>
                Hoàng Lê Anh Khoa
              </Typography>
              <Typography sx={{ fontSize: "20px", fontFamily: "NunitoSans" }}>
                Ngô Nhất Khánh
              </Typography>
              <Typography sx={{ fontSize: "20px", fontFamily: "NunitoSans" }}>
                Trần Văn Minh
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                width: "calc(100% / 4 - 16px)",
                height: "100%",
                flexDirection: "column",
                justifyContent: "center",
                gap: 5,
              }}
            >
              <Typography
                sx={{
                  fontSize: "25px",
                  fontWeight: "bold",
                  fontFamily: "NunitoSans",
                }}
              >
                Email
              </Typography>
              <Typography sx={{ fontSize: "20px", fontFamily: "NunitoSans" }}>
                22520667@gm.uit.edu.vn
              </Typography>
              <Typography sx={{ fontSize: "20px", fontFamily: "NunitoSans" }}>
                22520640@gm.uit.edu.vn
              </Typography>
              <Typography sx={{ fontSize: "20px", fontFamily: "NunitoSans" }}>
                22520892@gm.uit.edu.vn
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                width: "calc(100% / 4 - 16px)",
                height: "100%",
                flexDirection: "column",
                justifyContent: "center",
                gap: 5,
              }}
            >
              <Typography
                sx={{
                  fontSize: "25px",
                  fontWeight: "bold",
                  fontFamily: "NunitoSans",
                }}
              >
                Role
              </Typography>
              <Typography sx={{ fontSize: "20px", fontFamily: "NunitoSans" }}>
                Leader
              </Typography>
              <Typography sx={{ fontSize: "20px", fontFamily: "NunitoSans" }}>
                Member
              </Typography>
              <Typography sx={{ fontSize: "20px", fontFamily: "NunitoSans" }}>
                Member
              </Typography>
            </Box>
          </Box>
        </Section>
      </Box>
    </Box>
  );
}
