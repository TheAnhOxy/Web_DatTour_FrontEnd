/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createTourQuestion,
  getTourDetails,
  getTourQuestions,
  getTourReviews,
  getTourSchedules,
} from "../../../api/coreApi_new";
import ReviewsSection from "../../components/ReviewsSection";
import { useAuthStore } from "../../../store/authStore";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toNum = (val: any): number => {
  if (val === null || val === undefined) return 0;
  const n = typeof val === "object" ? Number(val.toString()) : Number(val);
  return isNaN(n) ? 0 : n;
};

const safeParse = (data: any) => {
  if (typeof data === "string") {
    try { return JSON.parse(data); } catch { return data; }
  }
  return data;
};

const apiList = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const normalizeReview = (item: any, index: number) => ({
  id: item.id ?? item.reviewId ?? `review-${index}`,
  name: item.name ?? item.customerName ?? item.userName ?? item.fullName ?? "Khách hàng",
  rating: toNum(item.rating ?? item.stars ?? item.score),
  comment: item.comment ?? item.content ?? item.message ?? item.review ?? "",
  avatar: item.avatar ?? item.avatarUrl ?? item.imageUrl,
  createdAt: item.createdAt ?? item.created_at ?? item.createdDate,
});

const normalizeQuestion = (item: any, index: number) => ({
  id: item.id ?? item.questionId ?? `question-${index}`,
  question: item.question ?? item.content ?? item.message ?? "",
  answer: item.answer ?? item.reply ?? item.response,
  name: item.name ?? item.customerName ?? item.userName ?? item.fullName,
  createdAt: item.createdAt ?? item.created_at ?? item.createdDate,
});

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN").format(price) + "đ";

const formatFullDate = (dateInput: any) => {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (!d || isNaN(d.getTime())) return "Ngày chưa xác định";
  const days = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${days[d.getDay()]}, ${dd}/${mm}/${yyyy}`;
};

// ─── Page Component ───────────────────────────────────────────────────────────
export default function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [tour, setTour] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePolicyTab, setActivePolicyTab] = useState("inclusions");
  const [selectedDepId, setSelectedDepId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPriceConfig, setSelectedPriceConfig] = useState<any>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [numAdults, setNumAdults] = useState(2);
  const [numChildren1014, setNumChildren1014] = useState(0);
  const [numChildren49, setNumChildren49] = useState(0);
  const [numBabies, setNumBabies] = useState(0);
  const [visibleRows, setVisibleRows] = useState(8);
  const [reviews, setReviews] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionText, setQuestionText] = useState("");
  const [questionStatus, setQuestionStatus] = useState("");
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);

  // ─── Fetch data ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tourRes, schedulesRes, reviewsRes, questionsRes] = await Promise.all([
          getTourDetails(id),
          getTourSchedules(id),
          getTourReviews(id),
          getTourQuestions(id),
        ]);

        if (tourRes?.data) {
          const t = tourRes.data;
          const parsed = {
            ...t,
            itinerary: safeParse(t.itinerary),
            inclusions: safeParse(t.inclusions),
            exclusions: safeParse(t.exclusions),
            policies: safeParse(t.policies),
            images: t.images || [],
            packages: Array.isArray(t.packages) ? t.packages : [],
          };
          setTour(parsed);
          setSelectedPackageId(parsed.packages[0]?.id ?? "");
        }

        if (schedulesRes?.data && Array.isArray(schedulesRes.data)) {
          const mapped = schedulesRes.data
            .map((s: any) => {
              const dateStr = s.startDate || s.date || s.departureDate;
              const pc = s.priceConfig || {};
              const adultP = toNum(pc.adultPrice) || toNum(pc.adult_price);
              
              const maxS = toNum(s.maxSlots);
              const bookedS = toNum(s.bookedSlots);
              const remaining = maxS - bookedS;
              
              let compStatus = "Hết chỗ";
              if (s.status === "OPEN" && remaining > 0) {
                if (remaining <= 5) {
                  compStatus = "Chỉ còn chỗ";
                } else {
                  compStatus = "Còn chỗ";
                }
              }

              return {
                ...s,
                date: dateStr ? new Date(dateStr) : null,
                price: adultP || toNum(tourRes?.data?.basePrice) || 0,
                status: compStatus,
              };
            })
            .filter((s: any) => s.date !== null && !isNaN(s.date.getTime()))
            .sort((a: any, b: any) => a.date.getTime() - b.date.getTime());

          setSchedules(mapped);

          // Pre-select first available departure
          const first = mapped.find((s: any) => s.status === "Còn chỗ" || s.status === "Chỉ còn chỗ");
          if (first) {
            setSelectedDepId(String(first.id));
            setSelectedDate(first.date);
            setSelectedPriceConfig(first.priceConfig || null);
          }
        }

        const reviewSource = apiList(reviewsRes?.data).length > 0
          ? apiList(reviewsRes?.data)
          : apiList(tourRes?.data?.reviews);
        setReviews(
          reviewSource
            .map(normalizeReview)
            .filter((review) => review.comment)
        );

        const questionSource = apiList(questionsRes?.data).length > 0
          ? apiList(questionsRes?.data)
          : apiList(tourRes?.data?.questions);
        setQuestions(
          questionSource
            .map(normalizeQuestion)
            .filter((question) => question.question)
        );
      } catch (err) {
        console.error("Lỗi khi tải thông tin tour:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // ─── Computed prices ─────────────────────────────────────────────────────
  const packageExtraPrice = useMemo(() => {
    if (!tour?.packages) return 0;
    const pkg = tour.packages.find((p: any) => p.id === selectedPackageId);
    return pkg ? toNum(pkg.extraPrice) : 0;
  }, [tour, selectedPackageId]);

  const baseAdultPrice = useMemo(() => {
    if (!selectedPriceConfig) return toNum(tour?.basePrice);
    return toNum(selectedPriceConfig.adultPrice) || toNum(selectedPriceConfig.adult_price) || toNum(tour?.basePrice);
  }, [selectedPriceConfig, tour]);

  const baseChild1014Price = useMemo(() => {
    if (!selectedPriceConfig) return Math.round(baseAdultPrice * 0.75);
    return toNum(selectedPriceConfig.child1014Price) || toNum(selectedPriceConfig.child_10_14_price) || Math.round(baseAdultPrice * 0.75);
  }, [selectedPriceConfig, baseAdultPrice]);

  const baseChild49Price = useMemo(() => {
    if (!selectedPriceConfig) return Math.round(baseAdultPrice * 0.5);
    return toNum(selectedPriceConfig.child49Price) || toNum(selectedPriceConfig.child_4_9_price) || Math.round(baseAdultPrice * 0.5);
  }, [selectedPriceConfig, baseAdultPrice]);

  const baseBabyPrice = useMemo(() => {
    if (!selectedPriceConfig) return 0;
    return toNum(selectedPriceConfig.babyPrice) || toNum(selectedPriceConfig.baby_price) || 0;
  }, [selectedPriceConfig]);

  const adultPrice = baseAdultPrice + packageExtraPrice;
  const child1014Price = baseChild1014Price + packageExtraPrice;
  const child49Price = baseChild49Price + packageExtraPrice;
  const babyPrice = baseBabyPrice;

  const estimatedTotal =
    numAdults * adultPrice +
    numChildren1014 * child1014Price +
    numChildren49 * child49Price +
    numBabies * babyPrice;

  const selectedDep = useMemo(() => {
    return schedules.find((s) => String(s.id) === String(selectedDepId));
  }, [schedules, selectedDepId]);

  const remainingSlots = useMemo(() => {
    if (!selectedDep) return 999;
    const maxS = toNum(selectedDep.maxSlots);
    const bookedS = toNum(selectedDep.bookedSlots);
    return Math.max(0, maxS - bookedS);
  }, [selectedDep]);

  const totalSeatsSelected = useMemo(() => {
    return numAdults + numChildren1014 + numChildren49;
  }, [numAdults, numChildren1014, numChildren49]);

  const isBookingDisabled = useMemo(() => {
    if (!selectedDepId) return true;
    if (selectedDep?.status === "Hết chỗ") return true;
    if (totalSeatsSelected > remainingSlots) return true;
    return false;
  }, [selectedDepId, selectedDep, totalSeatsSelected, remainingSlots]);

  // ─── Departure table rows ─────────────────────────────────────────────────
  const displayedSchedules = schedules.slice(0, visibleRows);

  const handleSelectDeparture = (dep: any) => {
    if (dep.status === "Hết chỗ") return;
    setSelectedDepId(String(dep.id));
    setSelectedDate(dep.date);
    setSelectedPriceConfig(dep.priceConfig || null);
  };

  const handleBookNow = () => {
    if (!selectedDepId) {
      alert("Vui lòng chọn ngày khởi hành!");
      return;
    }
    const params = new URLSearchParams({
      adults: String(numAdults),
      children1014: String(numChildren1014),
      children49: String(numChildren49),
      babies: String(numBabies),
      package: selectedPackageId,
    });

    // Bắt buộc đăng nhập ngay khi nhấn "Đặt tour ngay"
    const isLoggedIn = useAuthStore.getState().isLoggedIn || !!(typeof window !== "undefined" && localStorage.getItem("token"));
    if (!isLoggedIn) {
      const targetUrl = `/booking/${selectedDepId}?${params.toString()}`;
      const returnUrl = encodeURIComponent(targetUrl);
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }

    router.push(`/booking/${selectedDepId}?${params.toString()}`);
  };

  const handleSubmitQuestion = async () => {
    const text = questionText.trim();
    if (!text) return;

    setIsSubmittingQuestion(true);
    setQuestionStatus("");
    try {
      const res = await createTourQuestion(id, text);
      if (res?.status === 200 || res?.status === 201) {
        const savedQuestion = normalizeQuestion(res.data || { question: text }, questions.length);
        setQuestions((current) => [savedQuestion, ...current].filter((question) => question.question));
        setQuestionText("");
        setQuestionStatus("Đã gửi câu hỏi. Bộ phận tư vấn sẽ phản hồi sớm.");
        return;
      }

      setQuestionStatus(res?.message || "Chưa gửi được câu hỏi. Vui lòng thử lại sau.");
    } catch {
      setQuestionStatus("Chưa gửi được câu hỏi. Vui lòng thử lại sau.");
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "system-ui", background: "#FAFAFA",
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          border: "5px solid #F0E0D0", borderTopColor: "#FF6B00",
          animation: "spin 0.9s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ marginTop: 20, color: "#888", fontSize: 16 }}>Đang tải thông tin tour...</p>
      </div>
    );
  }

  if (!tour) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <h3>Không tìm thấy tour</h3>
        <Link href="/tours" style={{ color: "#FF6B00", marginTop: 12 }}>← Quay lại danh sách tour</Link>
      </div>
    );
  }

  const coverImage = tour.images?.find((img: any) => img.isCover)?.imageUrl
    || tour.images?.[0]?.imageUrl
    || tour.coverImageUrl
    || "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200&auto=format&fit=crop";

  const getStatusBadge = (status: string) => {
    if (status === "Còn chỗ") return <span className="td-badge td-badge-success">Còn chỗ</span>;
    if (status === "Chỉ còn chỗ") return <span className="td-badge td-badge-warning">Chỉ còn chỗ</span>;
    return <span className="td-badge td-badge-disabled">Hết chỗ</span>;
  };

  return (
    <>
      <style>{`
        /* ── Tour Detail Page Styles ── */
        .td-container {
          font-family: system-ui, -apple-system, sans-serif;
          color: #333;
          background: #F7F8FA;
          padding-bottom: 80px;
        }

        /* Gallery */
        .td-gallery {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          grid-template-rows: 200px 200px;
          gap: 8px;
          border-radius: 0 0 16px 16px;
          overflow: hidden;
          max-height: 408px;
        }
        .td-gallery-main { grid-column: 1 / 2; grid-row: 1 / 3; position: relative; overflow: hidden; }
        .td-gallery-sub { position: relative; overflow: hidden; }
        .td-gallery img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.4s ease; cursor: pointer;
        }
        .td-gallery-main:hover img, .td-gallery-sub:hover img { transform: scale(1.07); }
        .td-gallery-overlay {
          position: absolute; inset: 0; background: rgba(0,0,0,0.4);
          display: flex; align-items: center; justify-content: center;
          color: white; font-weight: 700; font-size: 1.1rem;
        }
        @media (max-width: 768px) {
          .td-gallery { grid-template-columns: 1fr 1fr; grid-template-rows: 220px 120px; }
          .td-gallery-main { grid-column: 1 / 3; grid-row: 1 / 2; }
          .td-gallery-sub:nth-child(n+4) { display: none; }
        }

        /* Card */
        .td-card {
          background: white; border-radius: 16px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.07);
          padding: 28px; margin-bottom: 20px;
        }
        .td-card-title {
          font-size: 1.2rem; font-weight: 700; margin-bottom: 20px;
          color: #1A1A1A; border-left: 4px solid #FF6B00; padding-left: 12px;
        }

        /* Sticky sidebar */
        .td-sidebar { position: sticky; top: 100px; }

        /* Package radio cards */
        .td-pkg-card {
          border: 1.5px solid #E8E8E8; border-radius: 12px;
          padding: 14px 16px; cursor: pointer;
          transition: all 0.2s; margin-bottom: 10px; background: white;
        }
        .td-pkg-card.selected { border-color: #FF6B00; background: #FFF8F0; }
        .td-pkg-card:hover:not(.selected) { border-color: #FFB57A; }

        /* Date tabs */
        .td-date-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
        .td-date-tab {
          padding: 7px 16px; border-radius: 20px; font-weight: 600; font-size: 13px;
          cursor: pointer; border: 1.5px solid #E0E0E0; background: white; color: #666;
          transition: all 0.2s; white-space: nowrap;
        }
        .td-date-tab.active { background: #FF6B00; color: white; border-color: #FF6B00; }
        .td-date-tab:hover:not(.active) { border-color: #FF6B00; color: #FF6B00; }

        /* Counter */
        .td-counter { display: flex; align-items: center; gap: 10px; }
        .td-counter-btn {
          width: 34px; height: 34px; border-radius: 50%;
          border: 1.5px solid #DDD; background: white; cursor: pointer;
          font-size: 18px; font-weight: 600; color: #333;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; padding: 0;
        }
        .td-counter-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .td-counter-btn:not(:disabled):hover { border-color: #FF6B00; color: #FF6B00; }
        .td-counter-val { width: 28px; text-align: center; font-weight: 700; font-size: 15px; }

        /* Book CTA */
        .td-cta {
          width: 100%; padding: 15px; border: none; border-radius: 14px;
          background: linear-gradient(135deg, #FF6B00 0%, #E55A00 100%);
          color: white; font-weight: 700; font-size: 16px;
          cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(229,90,0,0.3);
        }
        .td-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(229,90,0,0.4); }
        .td-cta:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* Timeline */
        .td-timeline { position: relative; padding-left: 24px; }
        .td-timeline::before {
          content: ''; position: absolute; left: 0; top: 8px; bottom: 0;
          width: 2px; background: linear-gradient(to bottom, #FF6B00, #FFD1B3);
        }
        .td-timeline-item { position: relative; margin-bottom: 28px; }
        .td-timeline-item::before {
          content: ''; position: absolute; left: -29px; top: 5px;
          width: 12px; height: 12px; border-radius: 50%;
          background: #FF6B00; border: 2px solid white;
          box-shadow: 0 0 0 2px #FF6B00;
        }
        .td-timeline-day { color: #FF6B00; font-weight: 700; margin-bottom: 4px; font-size: 0.88rem; }
        .td-timeline-title { font-weight: 700; font-size: 1.05rem; margin-bottom: 6px; }
        .td-timeline-desc { color: #555; line-height: 1.65; font-size: 0.95rem; }

        /* Policy tabs */
        .td-policy-tabs {
          display: flex; border-bottom: 2px solid #EEE; margin-bottom: 20px;
          overflow-x: auto; white-space: nowrap; scrollbar-width: thin;
        }
        .td-policy-tab {
          padding: 11px 18px; cursor: pointer; font-weight: 600;
          color: #666; border-bottom: 3px solid transparent; font-size: 13.5px;
          transition: all 0.2s; flex-shrink: 0;
        }
        .td-policy-tab.active { color: #FF6B00; border-bottom-color: #FF6B00; }

        /* Inclusions / Exclusions */
        .td-list-check li, .td-list-cross li {
          position: relative; padding-left: 28px; margin-bottom: 10px;
          color: #444; font-size: 0.95rem; line-height: 1.55;
        }
        .td-list-check li::before { content: '✓'; position: absolute; left: 0; top: 0; color: #2E7D32; font-weight: 700; font-size: 17px; line-height: 1.2; }
        .td-list-cross li::before { content: '✕'; position: absolute; left: 0; top: 0; color: #D32F2F; font-weight: 700; font-size: 17px; line-height: 1.2; }

        /* Schedule table */
        .td-table { width: 100%; border-collapse: collapse; }
        .td-table th { color: #888; font-weight: 600; font-size: 13px; border-bottom: 2px solid #EEE; padding: 10px 8px; text-align: left; }
        .td-table td { padding: 14px 8px; border-bottom: 1px solid #F0F0F0; vertical-align: middle; font-size: 14px; }
        .td-table tr:last-child td { border-bottom: none; }
        .td-table tr.selected-row { background: #FFF8F0; }
        .td-table tr.selected-row td:first-child { border-left: 3px solid #FF6B00; }

        /* Badges */
        .td-badge { padding: 5px 11px; border-radius: 6px; font-size: 12.5px; font-weight: 600; display: inline-block; }
        .td-badge-success { background: #E8F5E9; color: #2E7D32; }
        .td-badge-warning { background: #FFF3E0; color: #E65100; }
        .td-badge-disabled { background: #EEEEEE; color: #9E9E9E; }

        /* Select btn */
        .td-select-btn {
          border: 1.5px solid #FF6B00; color: #FF6B00; background: white;
          padding: 5px 16px; border-radius: 20px; font-weight: 600; font-size: 13px;
          cursor: pointer; transition: all 0.2s;
        }
        .td-select-btn.selected-dep { background: #FF6B00; color: white; }
        .td-select-btn:disabled { border-color: #DDD; color: #999; background: #F5F5F5; cursor: not-allowed; }

        /* Summary price row */
        .td-summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.93rem; }
        .td-summary-total { display: flex; justify-content: space-between; padding-top: 12px; margin-top: 12px; border-top: 1px solid #EEE; font-weight: 700; font-size: 1.2rem; color: #D32F2F; }
      `}</style>

      <div className="td-container">

        {/* ── HERO BANNER ── */}
        <section className="page-banner-two rel z-1">
          <div className="container-fluid">
            <hr className="mt-0" />
            <div className="container">
              <div className="banner-inner pt-15 pb-25">
                <h2 className="page-title mb-10" data-aos="fade-left" data-aos-duration="1500" data-aos-offset="50">
                  {tour.destinationName || tour.categoryName || "Tour Du Lịch"}
                </h2>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb justify-content-center mb-20" data-aos="fade-right" data-aos-delay="200" data-aos-duration="1500" data-aos-offset="50">
                    <li className="breadcrumb-item"><Link href="/">Trang chủ</Link></li>
                    <li className="breadcrumb-item"><Link href="/tours">Tours</Link></li>
                    <li className="breadcrumb-item active">Chi tiết tour</li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </section>

        {/* ── GALLERY ── */}
        <div className="container-fluid px-0">
          <div className="td-gallery">
            <div className="td-gallery-main">
              <img src={coverImage} alt={tour.title} />
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="td-gallery-sub">
                <img
                  src={tour.images?.[i]?.imageUrl || `https://images.unsplash.com/photo-${1528127269322 + i * 100000}-?q=80&w=800&auto=format&fit=crop`}
                  alt={tour.images?.[i]?.altText || `Ảnh ${i + 1}`}
                />
                {i === 4 && tour.images?.length > 5 && (
                  <div className="td-gallery-overlay">+{tour.images.length - 5} ảnh</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="container mt-5">
          {/* Tour Title + Meta */}
          <div className="mb-4">
            <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#1A1A1A", marginBottom: 8 }}>
              {tour.title}
            </h1>
            <div className="d-flex flex-wrap align-items-center" style={{ gap: 16 }}>
              {tour.destinationName && (
                <span style={{ color: "#888", fontSize: 14 }}>
                  <i className="fal fa-map-marker-alt mr-1" style={{ color: "#FF6B00" }} />
                  {tour.destinationName}
                </span>
              )}
              {tour.durationDays && (
                <span style={{ color: "#888", fontSize: 14 }}>
                  <i className="fal fa-clock mr-1" style={{ color: "#FF6B00" }} />
                  {tour.durationDays} ngày {Math.max(0, (tour.durationDays || 1) - 1)} đêm
                </span>
              )}
              <div style={{ color: "#FFB800", display: "flex", gap: 2, alignItems: "center" }}>
                {[...Array(5)].map((_, i) => (
                  <i key={i} className={i < Math.round(toNum(tour.rating)) ? "fas fa-star" : "far fa-star"} style={{ fontSize: 14 }} />
                ))}
                <span style={{ color: "#333", marginLeft: 6, fontWeight: 700, fontSize: 14 }}>
                  {toNum(tour.rating).toFixed(1)}/5
                </span>
              </div>
            </div>
          </div>

          <div className="row">
            {/* ── LEFT COLUMN ── */}
            <div className="col-lg-8">

              {/* Overview */}
              {(tour.overview || tour.description) && (
                <div className="td-card">
                  <div className="td-card-title">Tổng quan chuyến đi</div>
                  <p style={{ color: "#555", lineHeight: 1.75, marginBottom: 0 }}>
                    {tour.overview || tour.description}
                  </p>
                </div>
              )}

              {/* Itinerary */}
              {Array.isArray(tour.itinerary) && tour.itinerary.length > 0 && (
                <div className="td-card">
                  <div className="td-card-title">Lịch trình chi tiết</div>
                  <div className="td-timeline">
                    {tour.itinerary.map((item: any, idx: number) => (
                      <div key={idx} className="td-timeline-item">
                        {item.time && <div className="td-timeline-day">Ngày {idx + 1}{item.time ? ` — ${item.time}` : ""}</div>}
                        {!item.time && <div className="td-timeline-day">Ngày {idx + 1}</div>}
                        <div className="td-timeline-title">{item.title}</div>
                        <div className="td-timeline-desc">{item.description || item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Policies */}
              <div className="td-card">
                <div className="td-card-title">Điều kiện & Chính sách</div>
                <div className="td-policy-tabs">
                  {[
                    { key: "inclusions", label: "Tour bao gồm" },
                    { key: "exclusions", label: "Không bao gồm" },
                    { key: "children", label: "Điều kiện trẻ em" },
                    { key: "cancel", label: "Quy định hủy" },
                    { key: "notes", label: "Lưu ý" },
                  ].map((tab) => (
                    <div
                      key={tab.key}
                      className={`td-policy-tab ${activePolicyTab === tab.key ? "active" : ""}`}
                      onClick={() => setActivePolicyTab(tab.key)}
                    >
                      {tab.label}
                    </div>
                  ))}
                </div>

                <div>
                  {activePolicyTab === "inclusions" && (
                    <ul className="list-unstyled td-list-check mb-0">
                      {Array.isArray(tour.inclusions)
                        ? tour.inclusions.map((inc: string, i: number) => <li key={i}>{inc}</li>)
                        : <li>{tour.inclusions || "Đang cập nhật thông tin..."}</li>}
                    </ul>
                  )}
                  {activePolicyTab === "exclusions" && (
                    <ul className="list-unstyled td-list-cross mb-0">
                      {Array.isArray(tour.exclusions)
                        ? tour.exclusions.map((exc: string, i: number) => <li key={i}>{exc}</li>)
                        : <li>{tour.exclusions || "Đang cập nhật thông tin..."}</li>}
                    </ul>
                  )}
                  {activePolicyTab === "children" && (
                    <p style={{ color: "#555", lineHeight: 1.7, marginBottom: 0 }}>
                      {tour.policies?.childPolicy || tour.childPolicy || "Trẻ em từ 5-11 tuổi: 75% giá người lớn. Trẻ em dưới 5 tuổi: miễn phí (không chiếm chỗ ngồi)."}
                    </p>
                  )}
                  {activePolicyTab === "cancel" && (
                    <p style={{ color: "#555", lineHeight: 1.7, marginBottom: 0 }}>
                      {tour.policies?.cancellationPolicy || tour.cancellationPolicy || "Hủy trước 15 ngày: hoàn 80%. Hủy trước 7 ngày: hoàn 50%. Hủy dưới 7 ngày: không hoàn tiền."}
                    </p>
                  )}
                  {activePolicyTab === "notes" && (
                    <p style={{ color: "#555", lineHeight: 1.7, marginBottom: 0 }}>
                      {tour.policies?.notes || tour.notes || "Vui lòng mang theo CCCD/Passport khi khởi hành. Tập hợp trước giờ khởi hành 30 phút tại điểm đón."}
                    </p>
                  )}
                </div>
              </div>

              {/* Departure Schedule Table */}
              <div className="td-card">
                <div className="td-card-title">Lịch khởi hành & Giá tour</div>
                <p style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>
                  {schedules.length} lịch khởi hành khả dụng
                </p>

                {schedules.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#888" }}>
                    <i className="fal fa-calendar-times" style={{ fontSize: 32, marginBottom: 12 }} />
                    <p>Chưa có lịch khởi hành nào đang mở.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="td-table">
                      <thead>
                        <tr>
                          <th>Ngày khởi hành</th>
                          <th>Tình trạng</th>
                          <th>Giá từ</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedSchedules.map((dep: any) => {
                          const isSelected = String(dep.id) === String(selectedDepId);
                          return (
                            <tr key={dep.id} className={isSelected ? "selected-row" : ""}>
                              <td style={{ fontWeight: 600 }}>
                                {formatFullDate(dep.date)}
                                {isSelected && (
                                  <span style={{ marginLeft: 8, color: "#FF6B00", fontSize: 11, fontWeight: 700 }}>
                                    ● Đang chọn
                                  </span>
                                )}
                              </td>
                              <td>
                                {getStatusBadge(dep.status)}
                                {dep.maxSlots != null && dep.bookedSlots != null && (
                                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                                    Còn {Math.max(0, dep.maxSlots - dep.bookedSlots)} chỗ
                                  </div>
                                )}
                              </td>
                              <td style={{ fontWeight: 700, color: "#FF6B00" }}>
                                {dep.price ? formatPrice(dep.price) : "Liên hệ"}
                              </td>
                              <td>
                                <button
                                  className={`td-select-btn ${isSelected ? "selected-dep" : ""}`}
                                  disabled={dep.status === "Hết chỗ"}
                                  onClick={() => {
                                    handleSelectDeparture(dep);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                  }}
                                >
                                  {isSelected ? "✓ Đã chọn" : "Chọn"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {schedules.length > visibleRows && (
                  <div style={{ textAlign: "center", marginTop: 16 }}>
                    <button
                      onClick={() => setVisibleRows((v) => v + 8)}
                      style={{
                        border: "1.5px solid #DDD", background: "white", borderRadius: 20,
                        padding: "8px 24px", cursor: "pointer", fontWeight: 600, color: "#555",
                      }}
                    >
                      Xem thêm
                    </button>
                  </div>
                )}
              </div>

              {/* Reviews */}
              <div className="td-card">
                <ReviewsSection
                  averageRating={toNum(tour.rating)}
                  reviewCount={tour.reviewCount || 0}
                  reviews={reviews}
                  questions={questions}
                  timeLabel={tour.durationDays ? `${tour.durationDays} ngày` : ""}
                  questionText={questionText}
                  questionStatus={questionStatus}
                  isSubmittingQuestion={isSubmittingQuestion}
                  onQuestionChange={setQuestionText}
                  onQuestionSubmit={handleSubmitQuestion}
                />
              </div>

            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <div className="col-lg-4">
              <div className="td-sidebar">
                <div className="td-card">
                  {/* Package selection */}
                  <div className="mb-4">
                    <div className="td-card-title" style={{ marginBottom: 14 }}>1. Chọn gói tour</div>
                    {(tour.packages || []).length === 0 && (
                      <div style={{ color: "#888", fontSize: 13 }}>
                        Tour chưa có gói dịch vụ riêng từ hệ thống.
                      </div>
                    )}
                    {(tour.packages || []).map((pkg: any) => (
                      <div
                        key={pkg.id}
                        className={`td-pkg-card ${selectedPackageId === pkg.id ? "selected" : ""}`}
                        onClick={() => setSelectedPackageId(pkg.id)}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{pkg.name}</span>
                          {pkg.extraPrice === 0 && (
                            <span style={{
                              background: "#FFE0CC", color: "#D65A00", fontSize: 11,
                              fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                            }}>Tiêu chuẩn</span>
                          )}
                          {pkg.extraPrice > 0 && (
                            <span style={{ color: "#FF6B00", fontWeight: 700, fontSize: 13 }}>
                              +{formatPrice(pkg.extraPrice)}
                            </span>
                          )}
                        </div>
                        {pkg.description && (
                          <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>{pkg.description}</div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Date selection */}
                  <div className="mb-4">
                    <div className="td-card-title" style={{ marginBottom: 14 }}>2. Ngày khởi hành</div>
                    {selectedDate && (
                      <div style={{ fontSize: 13, color: "#FF6B00", fontWeight: 600, marginBottom: 10 }}>
                        <i className="far fa-calendar-check mr-1" />
                        {formatFullDate(selectedDate)}
                      </div>
                    )}
                    {schedules.length > 0 ? (
                      <div className="td-date-tabs">
                        {schedules.slice(0, 12).map((dep: any) => {
                          const dd = String(dep.date.getDate()).padStart(2, "0");
                          const mm = String(dep.date.getMonth() + 1).padStart(2, "0");
                          const isHetCho = dep.status === "Hết chỗ";
                          return (
                            <div
                              key={dep.id}
                              className={`td-date-tab ${String(dep.id) === String(selectedDepId) ? "active" : ""}`}
                              onClick={() => {
                                if (!isHetCho) {
                                  handleSelectDeparture(dep);
                                }
                              }}
                              style={isHetCho ? { opacity: 0.4, cursor: "not-allowed", borderColor: "#E0E0E0", color: "#999" } : {}}
                            >
                              {dd}/{mm}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ color: "#888", fontSize: 13 }}>Đang tải lịch khởi hành...</div>
                    )}
                  </div>

                  {/* Passenger selection */}
                  <div className="mb-4">
                    <div className="td-card-title" style={{ marginBottom: 14 }}>3. Số hành khách</div>

                    {/* Warning if total seats exceeds remaining slots */}
                    {selectedDepId && totalSeatsSelected > remainingSlots && (
                      <div style={{
                        background: "#FFF0F0", border: "1px solid #FFC1C1", borderRadius: 8,
                        padding: "10px 12px", color: "#D32F2F", fontSize: 13,
                        fontWeight: 600, display: "flex", alignItems: "flex-start", gap: 8,
                        marginBottom: 16
                      }}>
                        <i className="fas fa-exclamation-triangle" style={{ marginTop: 2, fontSize: 14 }} />
                        <div>
                          Số lượng khách ({totalSeatsSelected} ghế) vượt quá số chỗ còn trống của chuyến đi ({remainingSlots} chỗ).
                        </div>
                      </div>
                    )}
                    
                    {/* Info if remaining slots is small but not exceeded */}
                    {selectedDepId && totalSeatsSelected <= remainingSlots && remainingSlots <= 5 && (
                      <div style={{
                        background: "#FFF8F0", border: "1px solid #FFE0C2", borderRadius: 8,
                        padding: "10px 12px", color: "#E65100", fontSize: 13,
                        fontWeight: 600, display: "flex", alignItems: "flex-start", gap: 8,
                        marginBottom: 16
                      }}>
                        <i className="fas fa-info-circle" style={{ marginTop: 2, fontSize: 14 }} />
                        <div>
                          Lịch này chỉ còn {remainingSlots} chỗ trống. Vui lòng nhanh tay đặt chỗ!
                        </div>
                      </div>
                    )}

                    {[
                      { label: "Người lớn (NL)", sublabel: "Từ 15 tuổi: " + formatPrice(adultPrice), value: numAdults, min: 1, isSeat: true, onChange: (n: number) => setNumAdults(n) },
                      { label: "Trẻ em lớn (TE)", sublabel: "10-14 tuổi: " + formatPrice(child1014Price), value: numChildren1014, min: 0, isSeat: true, onChange: (n: number) => setNumChildren1014(n) },
                      { label: "Trẻ em nhỏ (TE)", sublabel: "4-9 tuổi: " + formatPrice(child49Price), value: numChildren49, min: 0, isSeat: true, onChange: (n: number) => setNumChildren49(n) },
                      { label: "Em bé (EB)", sublabel: "Dưới 4 tuổi: " + (babyPrice > 0 ? formatPrice(babyPrice) : "Miễn phí"), value: numBabies, min: 0, isSeat: false, onChange: (n: number) => setNumBabies(n) },
                    ].map((row) => (
                      <div key={row.label} className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{row.label}</div>
                          <div style={{ color: "#888", fontSize: 12 }}>{row.sublabel}</div>
                        </div>
                        <div className="td-counter">
                          <button className="td-counter-btn" disabled={row.value <= row.min} onClick={() => row.onChange(Math.max(row.min, row.value - 1))}>−</button>
                          <div className="td-counter-val">{row.value}</div>
                          <button
                            className="td-counter-btn"
                            disabled={row.isSeat && totalSeatsSelected >= remainingSlots}
                            onClick={() => row.onChange(row.value + 1)}
                          >+</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Price summary */}
                  <div style={{ background: "#F7F8FA", borderRadius: 12, padding: "14px 16px", marginBottom: 18 }}>
                    {numAdults > 0 && (
                      <div className="td-summary-row">
                        <span>{numAdults} Người lớn</span>
                        <span style={{ fontWeight: 600 }}>{formatPrice(numAdults * adultPrice)}</span>
                      </div>
                    )}
                    {numChildren1014 > 0 && (
                      <div className="td-summary-row">
                        <span>{numChildren1014} Trẻ em (10-14T)</span>
                        <span style={{ fontWeight: 600 }}>{formatPrice(numChildren1014 * child1014Price)}</span>
                      </div>
                    )}
                    {numChildren49 > 0 && (
                      <div className="td-summary-row">
                        <span>{numChildren49} Trẻ em (4-9T)</span>
                        <span style={{ fontWeight: 600 }}>{formatPrice(numChildren49 * child49Price)}</span>
                      </div>
                    )}
                    {numBabies > 0 && (
                      <div className="td-summary-row">
                        <span>{numBabies} Em bé</span>
                        <span style={{ fontWeight: 600 }}>{babyPrice > 0 ? formatPrice(numBabies * babyPrice) : "Miễn phí"}</span>
                      </div>
                    )}
                    <div className="td-summary-total">
                      <span>Dự tính</span>
                      <span>{formatPrice(estimatedTotal)}</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    className="td-cta"
                    onClick={handleBookNow}
                    disabled={isBookingDisabled}
                  >
                    <i className="fas fa-bolt mr-2" />
                    {!selectedDepId
                      ? "Chọn ngày khởi hành"
                      : selectedDep?.status === "Hết chỗ"
                      ? "HẾT CHỖ"
                      : totalSeatsSelected > remainingSlots
                      ? "VƯỢT QUÁ SỐ CHỖ TRỐNG"
                      : "ĐẶT TOUR NGAY"}
                  </button>

                  <div style={{ textAlign: "center", marginTop: 12 }}>
                    <a href="/contact" style={{ color: "#888", fontSize: 13 }}>
                      <i className="far fa-phone-volume mr-1" /> Cần tư vấn? Gọi ngay
                    </a>
                  </div>
                </div>

                {/* Contact widget */}
                <div className="td-card">
                  <div className="td-card-title" style={{ marginBottom: 14 }}>Hỗ trợ & Liên hệ</div>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2" style={{ fontSize: 14 }}>
                      <i className="far fa-envelope mr-2" style={{ color: "#FF6B00" }} />
                      <a href="mailto:support@htravel.vn">support@htravel.vn</a>
                    </li>
                    <li style={{ fontSize: 14 }}>
                      <i className="far fa-phone-volume mr-2" style={{ color: "#FF6B00" }} />
                      <a href="tel:+84909000000">+84 909 000 000</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
