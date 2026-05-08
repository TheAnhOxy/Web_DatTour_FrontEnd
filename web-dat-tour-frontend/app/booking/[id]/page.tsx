"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDepartureDetails } from "../../../api/coreApi";
import { createBooking } from "../../../api/bookingApi";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [tourDetail, setTourDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [contactInfo, setContactInfo] = useState({
    fullName: "",
    email: "",
    tel: "",
    address: "",
  });

  const [numAdults, setNumAdults] = useState(1);
  const [numChildren, setNumChildren] = useState(0);

  const [passengers, setPassengers] = useState<any[]>([
    { id: Date.now(), fullName: "", dob: "", gender: "MALE", ageGroup: "ADULT", idCardNumber: "" },
  ]);

  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("office-payment");

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      const res = await getDepartureDetails(id);
      if (res.data) {
        setTourDetail(res.data);
        if (res.data.packages && res.data.packages.length > 0) {
            setSelectedPackage(res.data.packages[0].id);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const totalCount = numAdults + numChildren;
    setPassengers((prev) => {
      const newList = [...prev];
      if (newList.length > totalCount) {
        return newList.slice(0, totalCount);
      }
      while (newList.length < totalCount) {
        const isAdult = newList.length < numAdults;
        newList.push({
          id: Date.now() + Math.random(),
          fullName: "",
          dob: "",
          gender: "MALE",
          ageGroup: isAdult ? "ADULT" : "CHILD",
          idCardNumber: "",
        });
      }
      return newList.map((p, idx) => ({
        ...p,
        ageGroup: idx < numAdults ? "ADULT" : "CHILD",
      }));
    });
  }, [numAdults, numChildren]);

  const handlePassengerChange = (index: number, field: string, value: string) => {
    setPassengers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const getPackageExtraPrice = () => {
      if (!tourDetail || !tourDetail.packages) return 0;
      const pkg = tourDetail.packages.find((p: any) => p.id === selectedPackage);
      return pkg ? pkg.extraPrice : 0;
  };

  const calculateTotal = () => {
    if (!tourDetail?.priceConfig) return 0;
    const extraPrice = getPackageExtraPrice();
    const adultTotal = numAdults * ((tourDetail.priceConfig.adultPrice || 0) + extraPrice);
    const childTotal = numChildren * ((tourDetail.priceConfig.child1014Price || 0) + extraPrice);
    return adultTotal + childTotal;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requestData = {
      userId: 1, 
      departureId: Number(id),
      note: `Liên hệ: ${contactInfo.tel} - ${contactInfo.address} | Gói: ${selectedPackage}`,
      passengers: passengers.map((p) => ({
        fullName: p.fullName || contactInfo.fullName,
        dob: p.dob || "2000-01-01",
        gender: p.gender,
        ageGroup: p.ageGroup,
        idCardNumber: p.idCardNumber || "000000000000",
      })),
    };

    try {
      const res = await createBooking(requestData);
      if (res.status === 201 || res.status === 200) {
        alert("Giữ chỗ thành công! Mã đơn hàng: " + (res.data?.bookingCode || "N/A"));
      } else {
        alert("Lỗi khi đặt tour: " + res.message);
      }
    } catch (error) {
      alert("Có lỗi xảy ra khi kết nối server!");
    }
  };

  if (loading) {
    return <div className="text-center py-50">Đang tải thông tin chuyến đi...</div>;
  }

  if (!tourDetail) {
    return <div className="text-center py-50">Không tìm thấy thông tin chuyến đi.</div>;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  return (
    <>
      <section
        className="page-banner-area pt-50 pb-35 rel z-1 bgs-cover"
        style={{ backgroundImage: "url(/clients/assets/images/banner/banner.jpg)" }}
      >
        <div className="container">
          <div className="banner-inner text-white">
            <h2 className="page-title mb-10">Chi Tiết Đặt Tour</h2>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb justify-content-center mb-20">
                <li className="breadcrumb-item"><a href="/">Trang chủ</a></li>
                <li className="breadcrumb-item active">Đặt Tour</li>
              </ol>
            </nav>
          </div>
        </div>
      </section>

      <section className="container" style={{ marginTop: 50, marginBottom: 100 }}>
        <div className="row">
            {/* Cột trái: Thông tin Tour & Lịch trình */}
            <div className="col-lg-7">
                <div className="tour-info-wrapper bg-white p-4 rounded shadow-sm border mb-4">
                    {tourDetail.image && (
                        <img src={tourDetail.image} alt={tourDetail.title} className="img-fluid rounded mb-4 w-100" style={{maxHeight: "350px", objectFit: "cover"}} />
                    )}
                    <h3 className="mb-3 text-primary">{tourDetail.title}</h3>
                    <div className="d-flex mb-3 text-secondary">
                        <div className="mr-4"><i className="fal fa-calendar-alt mr-2 text-primary"></i> <strong>Khởi hành:</strong> {new Date(tourDetail.startDate).toLocaleString('vi-VN')}</div>
                        <div><i className="fal fa-clock mr-2 text-primary"></i> <strong>Chỗ trống:</strong> {tourDetail.maxSlots - tourDetail.bookedSlots}</div>
                    </div>
                    
                    <hr />

                    {/* Lịch trình */}
                    {tourDetail.itinerary && tourDetail.itinerary.length > 0 && (
                        <div className="mt-4">
                            <h4 className="mb-3">Lịch trình chi tiết</h4>
                            <div className="timeline-section">
                                {tourDetail.itinerary.map((item: any, idx: number) => (
                                    <div key={idx} className="mb-3 d-flex">
                                        <div className="mr-3 text-primary" style={{minWidth: "80px", fontWeight: "bold"}}>{item.time}</div>
                                        <div>
                                            <h6 className="mb-1">{item.title}</h6>
                                            <p className="text-secondary small">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <hr />

                    {/* Bao gồm / Không bao gồm */}
                    <div className="row mt-4">
                        <div className="col-md-6">
                            <h5 className="mb-3 text-success"><i className="fas fa-check-circle mr-2"></i> Bao gồm</h5>
                            <ul className="list-unstyled">
                                {tourDetail.inclusions?.map((inc: string, idx: number) => (
                                    <li key={idx} className="mb-2 text-secondary small"><i className="fas fa-check text-success mr-2"></i> {inc}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="col-md-6">
                            <h5 className="mb-3 text-danger"><i className="fas fa-times-circle mr-2"></i> Không bao gồm</h5>
                            <ul className="list-unstyled">
                                {tourDetail.exclusions?.map((exc: string, idx: number) => (
                                    <li key={idx} className="mb-2 text-secondary small"><i className="fas fa-times text-danger mr-2"></i> {exc}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cột phải: Form Đặt Tour & Thanh Toán */}
            <div className="col-lg-5">
                <form onSubmit={handleSubmit} className="booking-form-wrapper bg-white p-4 rounded shadow-sm border sticky-top" style={{top: "100px", zIndex: 10}}>
                    
                    <h4 className="mb-4 pb-2 border-bottom">1. Tùy chọn Gói Dịch Vụ</h4>
                    <div className="packages-selection mb-4">
                        {tourDetail.packages?.map((pkg: any) => (
                            <label key={pkg.id} className="d-block mb-3 p-3 border rounded cursor-pointer" style={{backgroundColor: selectedPackage === pkg.id ? "#f0f8ff" : "white", borderColor: selectedPackage === pkg.id ? "#007bff" : "#ddd"}}>
                                <div className="d-flex align-items-center">
                                    <input type="radio" name="package" value={pkg.id} checked={selectedPackage === pkg.id} onChange={(e) => setSelectedPackage(e.target.value)} className="mr-3" />
                                    <div>
                                        <h6 className="mb-1">{pkg.name}</h6>
                                        <span className="text-success small font-weight-bold">
                                            {pkg.extraPrice === 0 ? "Tiêu chuẩn" : `+ ${formatPrice(pkg.extraPrice)} đ / khách`}
                                        </span>
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>

                    <h4 className="mb-4 pb-2 border-bottom">2. Số Lượng Hành Khách</h4>
                    <div className="d-flex justify-content-between mb-3 align-items-center">
                        <div>
                            <h6 className="mb-0">Người lớn</h6>
                            <small className="text-muted">&ge; 15 tuổi</small>
                        </div>
                        <div className="d-flex align-items-center border rounded p-1">
                            <button type="button" className="btn btn-sm btn-light border-0" style={{width: 35}} onClick={() => setNumAdults(Math.max(1, numAdults - 1))}>-</button>
                            <span className="mx-3 font-weight-bold">{numAdults}</span>
                            <button type="button" className="btn btn-sm btn-light border-0" style={{width: 35}} onClick={() => setNumAdults(numAdults + 1)}>+</button>
                        </div>
                    </div>
                    <div className="d-flex justify-content-between mb-4 align-items-center">
                        <div>
                            <h6 className="mb-0">Trẻ em</h6>
                            <small className="text-muted">10-14 tuổi</small>
                        </div>
                        <div className="d-flex align-items-center border rounded p-1">
                            <button type="button" className="btn btn-sm btn-light border-0" style={{width: 35}} onClick={() => setNumChildren(Math.max(0, numChildren - 1))}>-</button>
                            <span className="mx-3 font-weight-bold">{numChildren}</span>
                            <button type="button" className="btn btn-sm btn-light border-0" style={{width: 35}} onClick={() => setNumChildren(numChildren + 1)}>+</button>
                        </div>
                    </div>

                    <h4 className="mb-4 pb-2 border-bottom">3. Thông Tin Liên Hệ & Hành Khách</h4>
                    <div className="mb-3">
                        <label className="font-weight-bold small text-muted">Họ và tên người đại diện *</label>
                        <input type="text" className="form-control" placeholder="Nhập Họ và tên" required value={contactInfo.fullName} onChange={(e) => setContactInfo({...contactInfo, fullName: e.target.value})} />
                    </div>
                    <div className="mb-3">
                        <label className="font-weight-bold small text-muted">Số điện thoại *</label>
                        <input type="number" className="form-control" placeholder="Nhập số điện thoại" required value={contactInfo.tel} onChange={(e) => setContactInfo({...contactInfo, tel: e.target.value})} />
                    </div>

                    {/* Danh sách hành khách */}
                    <div className="accordion mb-4" id="passengerAccordion">
                        <div className="card border-0">
                            <div className="card-header bg-light p-0 border-0" id="headingOne">
                                <button className="btn btn-link btn-block text-left text-dark font-weight-bold text-decoration-none py-3" type="button" data-toggle="collapse" data-target="#collapsePassengers">
                                    <i className="fas fa-users mr-2 text-primary"></i> Xem chi tiết danh sách hành khách ({passengers.length})
                                </button>
                            </div>
                            <div id="collapsePassengers" className="collapse" data-parent="#passengerAccordion">
                                <div className="card-body p-0 pt-3">
                                    {passengers.map((p, index) => (
                                        <div key={p.id} className="p-3 mb-3 bg-light rounded border-left border-primary" style={{borderLeftWidth: "4px !important"}}>
                                            <h6 className="mb-3 text-primary">{p.ageGroup === "ADULT" ? "Người lớn" : "Trẻ em"} {index + 1}</h6>
                                            <input type="text" className="form-control form-control-sm mb-2" placeholder="Họ và tên" value={p.fullName} onChange={(e) => handlePassengerChange(index, 'fullName', e.target.value)} required />
                                            <div className="row">
                                                <div className="col-6">
                                                    <input type="date" className="form-control form-control-sm" value={p.dob} onChange={(e) => handlePassengerChange(index, 'dob', e.target.value)} required />
                                                </div>
                                                <div className="col-6">
                                                    <select value={p.gender} onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)} className="form-control form-control-sm h-100">
                                                        <option value="MALE">Nam</option>
                                                        <option value="FEMALE">Nữ</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <h4 className="mb-4 pb-2 border-bottom">4. Phương Thức Thanh Toán</h4>
                    <label className="d-flex align-items-center mb-3 p-2 border rounded cursor-pointer">
                        <input type="radio" name="payment" value="office-payment" checked={paymentMethod === 'office-payment'} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-3" />
                        <span className="font-weight-bold">Thanh toán tại văn phòng</span>
                    </label>
                    <label className="d-flex align-items-center mb-4 p-2 border rounded cursor-pointer">
                        <input type="radio" name="payment" value="momo-payment" checked={paymentMethod === 'momo-payment'} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-3" />
                        <span className="font-weight-bold">Thanh toán bằng MoMo</span>
                    </label>

                    {/* Tổng tiền */}
                    <div className="bg-light p-3 rounded mb-4 border">
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Giá vé ({numAdults + numChildren} khách)</span>
                            <span className="font-weight-bold">{formatPrice(calculateTotal() - (getPackageExtraPrice() * (numAdults + numChildren)))} đ</span>
                        </div>
                        {getPackageExtraPrice() > 0 && (
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Phụ phí gói dịch vụ</span>
                                <span className="font-weight-bold text-success">+{formatPrice(getPackageExtraPrice() * (numAdults + numChildren))} đ</span>
                            </div>
                        )}
                        <hr />
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="font-weight-bold text-uppercase">Tổng Cộng</span>
                            <span className="text-danger font-weight-bold" style={{fontSize: "26px"}}>{formatPrice(calculateTotal())} đ</span>
                        </div>
                    </div>

                    <button type="submit" className="theme-btn w-100 py-3 font-weight-bold" style={{borderRadius: "8px", fontSize: "16px"}}>
                        HOÀN TẤT ĐẶT TOUR
                    </button>
                    <p className="text-center text-muted small mt-3">Bằng việc tiếp tục, bạn đồng ý với <a href="#" className="text-primary text-decoration-underline">Điều khoản & Chính sách</a> của chúng tôi.</p>
                </form>
            </div>
        </div>
      </section>
    </>
  );
}
