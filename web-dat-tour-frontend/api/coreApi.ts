import client from "../utils/apiClient";

const wrap = (res: any) => {
  if (
    res &&
    res.data &&
    typeof res.data === "object" &&
    (res.data.status !== undefined ||
      res.data.message !== undefined ||
      res.data.data !== undefined)
  ) {
    return res.data;
  }
  return { status: res?.status || 200, message: null, data: res?.data ?? null };
};

export const getDepartureDetails = async (id: string | number) => {
  try {
    const res = await client.get(`/core/departures/${id}`);
    
    // Nếu API backend chưa chạy, ta dùng mock data để xử lý giao diện
    const apiData = wrap(res);
    if (apiData.status !== 200 || !apiData.data) {
        console.warn("Dùng mock data do không gọi được API backend (hoặc dữ liệu rỗng)");
        
        // Map data để tương ứng với các ID từ trang Destination
        const mockDestinations: Record<string, {title: string, adultPrice: number, image: string}> = {
          "1": { title: "Hạ Long", adultPrice: 2900000, image: "/clients/assets/images/gallery-tours/tour-mien-bac-4n3d-ha-noi-ninh-binh-ha-long-yen-tu-1.png" },
          "2": { title: "Ninh Bình", adultPrice: 2500000, image: "/clients/assets/images/gallery-tours/tour-mien-bac-4n3d-ha-noi-ninh-binh-ha-long-yen-tu-2.png" },
          "3": { title: "Đà Nẵng", adultPrice: 3500000, image: "/clients/assets/images/gallery-tours/mien-trung-4n3d-da-nang-hoi-an-ba-na-hue-1.png" },
          "4": { title: "Hội An", adultPrice: 3200000, image: "/clients/assets/images/gallery-tours/mien-trung-4n3d-da-nang-hoi-an-ba-na-hue-2.png" },
          "5": { title: "Phú Quốc", adultPrice: 4500000, image: "/clients/assets/images/gallery-tours/bien-dao-3n2d-phu-quoc-1.jpg" },
          "6": { title: "Côn Đảo", adultPrice: 5000000, image: "/clients/assets/images/gallery-tours/bien-dao-3n2d-con-dao-1.jpg" },
        };
        
        const tourInfo = mockDestinations[String(id)] || { title: "Khám phá Tour Đặc Biệt", adultPrice: 3000000, image: "/clients/assets/images/gallery-tours/bien-dao-3n2d-phu-quoc-1.jpg" };

        return {
            status: 200,
            message: "Success (Mock)",
            data: {
                id: Number(id),
                tourId: `T-2026-00${id}`,
                title: tourInfo.title,
                image: tourInfo.image,
                startDate: "2026-05-12T08:00:00",
                endDate: "2026-05-14T17:00:00",
                maxSlots: 20,
                bookedSlots: 5,
                priceConfig: {
                    adultPrice: tourInfo.adultPrice,
                    child1014Price: tourInfo.adultPrice * 0.7,
                    child49Price: tourInfo.adultPrice * 0.5,
                    babyPrice: 500000
                },
                packages: [
                    { id: "pkg-standard", name: "Trọn gói tham quan + Suất ăn trưa 5 món", extraPrice: 0 },
                    { id: "pkg-premium", name: "Trọn gói tham quan + Ăn sáng + Ăn trưa 5 món", extraPrice: 150000 }
                ],
                itinerary: [
                    { time: "Buổi sáng", title: "Đón khách & Tham quan", description: "Đón khách lúc 07h00. Tham quan các điểm du lịch nổi bật, khám phá văn hóa địa phương." },
                    { time: "Buổi trưa", title: "Ăn trưa & Nghỉ ngơi", description: "Thưởng thức đặc sản vùng miền với thực đơn 5 món phong phú." },
                    { time: "Buổi chiều", title: "Khám phá tự do & Trở về", description: "Tự do chụp ảnh, mua sắm đặc sản và lên xe trở về điểm đón ban đầu." }
                ],
                inclusions: [
                    "Xe du lịch đời mới máy lạnh",
                    "Hướng dẫn viên nhiệt tình suốt tuyến",
                    "Vé tham quan các điểm trong chương trình",
                    "Nước suối 1 chai/người/ngày",
                    "Bảo hiểm du lịch 20.000.000 VNĐ/vụ"
                ],
                exclusions: [
                    "Chi phí cá nhân ngoài chương trình",
                    "Tiền tip cho HDV và tài xế",
                    "Thuế VAT 8%"
                ]
            }
        };
    }

    return apiData;
  } catch (err: any) {
    return { status: 500, message: err.message, data: null };
  }
};

export default {
    getDepartureDetails
};
