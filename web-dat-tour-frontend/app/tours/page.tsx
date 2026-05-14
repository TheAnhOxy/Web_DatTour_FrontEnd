"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getTours, getDestinations } from "@/api/coreApi_new";

interface TourItem {
  id: number;
  title: string;
  region: string;
  durationDays: number;
  basePrice: number;
  coverImageUrl: string;
  rating: number;
  reviewCount: number;
  isHot: boolean;
}

interface Destination {
  id: number;
  cityName: string;
  region?: string;
  imageUrl?: string;
}

interface PageInfo {
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

const PAGE_SIZE = 9;

function formatPrice(price: number): string {
  if (!price || price === 0) return "Liên hệ";
  return price.toLocaleString("vi-VN") + " VND";
}

export default function ToursPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const destIdParam = searchParams.get("destinationId") || "";
  const pageParam   = parseInt(searchParams.get("page") || "0", 10);

  const [tours, setTours]             = useState<TourItem[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [pageInfo, setPageInfo]       = useState<PageInfo | null>(null);
  const [loading, setLoading]         = useState(true);
  const [selectedDestId, setSelectedDestId] = useState<string>(destIdParam);

  // Load destinations cho sidebar
  useEffect(() => {
    getDestinations(0, 50).then((res) => {
      if (res?.status === 200 && res.data?.content) {
        setDestinations(res.data.content);
      }
    });
  }, []);

  // Fetch tours khi filter/page thay đổi
  const fetchTours = useCallback(async (destId: string, page: number) => {
    setLoading(true);
    try {
      const res = await getTours(
        undefined,
        undefined,
        destId ? Number(destId) : undefined,
        page,
        PAGE_SIZE
      );
      if (res?.status === 200 && res.data) {
        setTours(res.data.content || []);
        setPageInfo({
          totalElements: res.data.totalElements,
          totalPages:    res.data.totalPages,
          number:        res.data.number,
          size:          res.data.size,
        });
      }
    } catch {
      setTours([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setSelectedDestId(destIdParam);
    fetchTours(destIdParam, pageParam);
  }, [destIdParam, pageParam, fetchTours]);

  const applyFilter = (destId: string) => {
    setSelectedDestId(destId);
    const params = new URLSearchParams();
    if (destId) params.set("destinationId", destId);
    params.set("page", "0");
    router.push(`/tours?${params.toString()}`);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams();
    if (selectedDestId) params.set("destinationId", selectedDestId);
    params.set("page", String(page));
    router.push(`/tours?${params.toString()}`);
  };

  const clearFilter = () => {
    setSelectedDestId("");
    router.push("/tours");
  };

  return (
    <>
      <section
        className="page-banner-area pt-50 pb-35 rel z-1 bgs-cover"
        style={{ backgroundImage: "url(/clients/assets/images/banner/banner.jpg)" }}
      >
        <div className="container">
          <div className="banner-inner text-white">
            <h2 className="page-title mb-10">Tours</h2>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb justify-content-center mb-20">
                <li className="breadcrumb-item">
                  <Link href="/">Trang chủ</Link>
                </li>
                <li className="breadcrumb-item active">Tours</li>
              </ol>
            </nav>
          </div>
        </div>
      </section>

      <section className="tour-grid-page py-100 rel z-1">
        <div className="container">
          <div className="row">
            {/* ── SIDEBAR ── */}
            <div className="col-lg-3 col-md-6 col-sm-10 rmb-75">
              <div className="shop-sidebar">
                <div className="div_filter_clear">
                  <button className="clear_filter" onClick={clearFilter}>
                    Xóa bộ lọc
                  </button>
                </div>

                {/* Lọc theo điểm đến (từ API) */}
                <div className="widget widget-activity">
                  <h6 className="widget-title">Điểm đến</h6>
                  <ul className="radio-filter">
                    <li>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="destination"
                        id="dest_all"
                        value=""
                        checked={selectedDestId === ""}
                        onChange={() => applyFilter("")}
                      />
                      <label htmlFor="dest_all">Tất cả</label>
                    </li>
                    {destinations.map((d) => (
                      <li key={d.id}>
                        <input
                          className="form-check-input"
                          type="radio"
                          name="destination"
                          id={`dest_${d.id}`}
                          value={String(d.id)}
                          checked={selectedDestId === String(d.id)}
                          onChange={() => applyFilter(String(d.id))}
                        />
                        <label htmlFor={`dest_${d.id}`}>{d.cityName}</label>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA widget */}
                <div className="widget widget-cta mt-30">
                  <div className="content text-white">
                    <span className="h6">Khám Phá Việt Nam</span>
                    <h3>Địa điểm du lịch tốt nhất</h3>
                    <Link href="/tours" className="theme-btn style-two bgc-secondary">
                      <span data-hover="Khám phá ngay">Khám phá ngay</span>
                      <i className="fal fa-arrow-right"></i>
                    </Link>
                  </div>
                  <div className="image">
                    <img src="/clients/assets/images/widgets/cta-widget.png" alt="CTA" />
                  </div>
                  <div className="cta-shape">
                    <img src="/clients/assets/images/widgets/cta-shape2.png" alt="Shape" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── DANH SÁCH TOUR ── */}
            <div className="col-lg-9">
              <div className="shop-shorter rel z-3 mb-20">
                <div className="sort-text mb-15 me-4 me-xl-auto">
                  {pageInfo
                    ? `${pageInfo.totalElements} tour tìm thấy`
                    : "Đang tải..."}
                </div>
                {selectedDestId && (
                  <div className="sort-text mb-15 me-4" style={{ color: "#28a745" }}>
                    Lọc: {destinations.find((d) => String(d.id) === selectedDestId)?.cityName}
                  </div>
                )}
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                </div>
              ) : tours.length === 0 ? (
                <div className="text-center py-5">
                  <p>Không tìm thấy tour phù hợp.</p>
                  <button className="theme-btn style-two mt-3" onClick={clearFilter}>
                    Xem tất cả tour
                  </button>
                </div>
              ) : (
                <div className="tour-grid-wrap">
                  <div className="row" id="tours-container">
                    {tours.map((tour) => (
                      <div className="col-xl-4 col-md-6" style={{ marginBottom: 30 }} key={tour.id}>
                        <div className="destination-item tour-grid style-three bgc-lighter block_tours">
                          <div className="image" style={{ position: "relative", height: 200, overflow: "hidden" }}>
                            {tour.isHot && <span className="badge bgc-pink">Hot</span>}
                            <a href="#" className="heart"><i className="fas fa-heart"></i></a>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={tour.coverImageUrl || "/clients/assets/images/gallery-tours/mien-trung-4n3d-da-nang-hoi-an-ba-na-hue-1.png"}
                              alt={tour.title}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </div>
                          <div className="content">
                            <div className="destination-header">
                              <span className="location">
                                <i className="fal fa-map-marker-alt"></i>
                                {tour.region || "Việt Nam"}
                              </span>
                              {tour.rating > 0 && (
                                <div className="ratting">
                                  <i className="fas fa-star"></i>
                                  <span>{Number(tour.rating).toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                            <h6>
                              <Link href={`/tours/${tour.id}`}>{tour.title}</Link>
                            </h6>
                            <ul className="blog-meta">
                              <li>
                                <i className="far fa-clock"></i>
                                {tour.durationDays} ngày
                              </li>
                            </ul>
                            <div className="destination-footer">
                              <span className="price">
                                {tour.basePrice > 0 ? (
                                  <><span>{formatPrice(tour.basePrice)}</span> / người</>
                                ) : (
                                  <span style={{ color: "#f97316" }}>Liên hệ</span>
                                )}
                              </span>
                              <Link href={`/tours/${tour.id}`} className="theme-btn style-two style-three">
                                <i className="fal fa-arrow-right"></i>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pageInfo && pageInfo.totalPages > 1 && (
                    <div className="col-lg-12">
                      <ul className="pagination justify-content-center pt-15 flex-wrap pagination-tours">
                        <li className={`page-item ${pageInfo.number === 0 ? "disabled" : ""}`}>
                          <button className="page-link" onClick={() => goToPage(pageInfo.number - 1)}>
                            <i className="far fa-chevron-left"></i>
                          </button>
                        </li>
                        {Array.from({ length: pageInfo.totalPages }, (_, i) => (
                          <li key={i} className={`page-item ${pageInfo.number === i ? "active" : ""}`}>
                            <button className="page-link" onClick={() => goToPage(i)}>
                              {i + 1}
                            </button>
                          </li>
                        ))}
                        <li className={`page-item ${pageInfo.number >= pageInfo.totalPages - 1 ? "disabled" : ""}`}>
                          <button className="page-link" onClick={() => goToPage(pageInfo.number + 1)}>
                            <i className="far fa-chevron-right"></i>
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        className="newsletter-three bgc-primary py-100 rel z-1"
        style={{ backgroundImage: "url(/clients/assets/images/newsletter/newsletter-bg-lines.png)" }}
      >
        <div className="container container-1500">
          <div className="row">
            <div className="col-lg-6">
              <div className="newsletter-content-part text-white rmb-55">
                <div className="section-title mb-45">
                  <h2>Đăng ký nhận bản tin để nhận thêm nhiều ưu đãi</h2>
                </div>
                <form className="newsletter-form mb-15" action="#">
                  <input id="news-email" type="email" placeholder="Địa chỉ Email" required />
                  <button type="submit" className="theme-btn bgc-secondary style-two">
                    <span data-hover="Đăng ký">Đăng ký</span>
                    <i className="fal fa-arrow-right"></i>
                  </button>
                </form>
                <p>Không yêu cầu thẻ tín dụng. Không cam kết</p>
              </div>
            </div>
            <div className="col-lg-6">
              <div
                className="newsletter-image-part bgs-cover"
                style={{ backgroundImage: "url(/clients/assets/images/newsletter/newsletter-two-right.jpg)" }}
              ></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
