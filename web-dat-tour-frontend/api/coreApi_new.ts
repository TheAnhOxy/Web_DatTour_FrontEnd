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
        const mockDestinations: Record<string, any> = {
          "1": { 
              title: "Hạ Long", 
              adultPrice: 2900000, 
              image: "/clients/assets/images/gallery-tours/tour-mien-bac-4n3d-ha-noi-ninh-binh-ha-long-yen-tu-1.png",
              images: [
                "/clients/assets/images/gallery-tours/tour-mien-bac-4n3d-ha-noi-ninh-binh-ha-long-yen-tu-1.png",
                "https://images.unsplash.com/photo-1524230507669-5ff97982bb5e?q=80&w=800",
                "https://images.unsplash.com/photo-1555502575-5cb391e63a32?q=80&w=800",
                "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800",
                "https://images.unsplash.com/photo-1506527632616-65e3170757af?q=80&w=800"
              ],
              overview: "Khám phá Vịnh Hạ Long - di sản thiên nhiên thế giới với hàng ngàn hòn đảo kỳ vĩ. Trải nghiệm ngủ đêm trên du thuyền hạng sang, thưởng thức hải sản tươi ngon và tham quan những hang động nhũ đá tuyệt đẹp.",
              itinerary: [
                  { time: "Ngày 1", title: "Hà Nội - Vịnh Hạ Long", description: "Đón khách tại Hà Nội, di chuyển đến Hạ Long. Lên du thuyền, dùng bữa trưa. Chiều tham quan Hang Sửng Sốt và chèo Kayak." },
                  { time: "Ngày 2", title: "Khám phá Vịnh - Về Hà Nội", description: "Ngắm bình minh trên vịnh, tập Thái Cực Quyền. Thăm đảo Ti Tốp. Dùng bữa trưa sớm và tàu cập bến khởi hành về Hà Nội." }
              ],
              rating: 4.9,
              reviewCount: 320,
              childPolicy: [
                  "Hạ Long - Trẻ em < 4 tuổi: Miễn phí",
                  "Hạ Long - Trẻ em 4-9 tuổi: 50%",
                  "Hạ Long - Trẻ em >= 10 tuổi: 100%"
              ],
              cancellationPolicy: [
                  "Hạ Long - Hủy trước 15 ngày: Miễn phí",
                  "Hạ Long - Hủy 7-14 ngày: 50%",
                  "Hạ Long - Hủy < 7 ngày: 100%"
              ],
              notes: [
                  "Hạ Long - Mang theo CCCD",
                  "Hạ Long - Mang đồ bơi"
              ]
          },
          "2": { 
              title: "Ninh Bình", 
              adultPrice: 2500000, 
              image: "/clients/assets/images/gallery-tours/tour-mien-bac-4n3d-ha-noi-ninh-binh-ha-long-yen-tu-2.png",
              images: [
                "/clients/assets/images/gallery-tours/tour-mien-bac-4n3d-ha-noi-ninh-binh-ha-long-yen-tu-2.png",
                "https://images.unsplash.com/photo-1599240331000-08d4b31c9a62?q=80&w=800",
                "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800",
                "https://images.unsplash.com/photo-1599423300746-b62533397364?q=80&w=800",
                "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800"
              ],
              overview: "Trải nghiệm vẻ đẹp nên thơ của Tràng An - Bái Đính. Du thuyền qua các hang động xuyên thủy, khám phá vùng đất cố đô Hoa Lư lịch sử.",
              itinerary: [
                  { time: "Buổi sáng", title: "Hà Nội - Bái Đính", description: "Khởi hành đi Ninh Bình. Tham quan chùa Bái Đính - ngôi chùa lớn nhất Việt Nam với nhiều kỷ lục." },
                  { time: "Buổi chiều", title: "Tràng An - Hà Nội", description: "Lên thuyền tham quan khu du lịch sinh thái Tràng An. Thưởng ngoạn cảnh quan đồi núi và hang động tuyệt đẹp. Trở về Hà Nội." }
              ],
              rating: 4.7,
              reviewCount: 215,
              childPolicy: [
                  "Ninh Bình - Trẻ em < 4 tuổi: Miễn phí",
                  "Ninh Bình - Trẻ em 4-9 tuổi: 50%",
                  "Ninh Bình - Trẻ em >= 10 tuổi: 100%"
              ],
              cancellationPolicy: [
                  "Ninh Bình - Hủy trước 10 ngày: Miễn phí",
                  "Ninh Bình - Hủy 5-9 ngày: 50%",
                  "Ninh Bình - Hủy < 5 ngày: 100%"
              ],
              notes: [
                  "Ninh Bình - Giày thể thao",
                  "Ninh Bình - Nước uống"
              ]
          },
          "3": { 
              title: "Đà Nẵng", 
              adultPrice: 3500000, 
              image: "/clients/assets/images/gallery-tours/mien-trung-4n3d-da-nang-hoi-an-ba-na-hue-1.png",
              images: [
                "/clients/assets/images/gallery-tours/mien-trung-4n3d-da-nang-hoi-an-ba-na-hue-1.png",
                "https://images.unsplash.com/photo-1559592413-7cea8378179b?q=80&w=800",
                "https://images.unsplash.com/photo-1534441085368-6abc3966952d?q=80&w=800",
                "https://images.unsplash.com/photo-1551041777-ed770433a6d5?q=80&w=800",
                "https://images.unsplash.com/photo-1512100356956-c1227c3464d1?q=80&w=800"
              ],
              overview: "Hành trình khám phá thành phố đáng sống nhất Việt Nam. Tham quan Bà Nà Hills, cầu Vàng, bán đảo Sơn Trà và tắm biển Mỹ Khê.",
              itinerary: [
                  { time: "Ngày 1", title: "Đón sân bay - Sơn Trà", description: "Đón khách tại sân bay Đà Nẵng. Buổi chiều tham quan bán đảo Sơn Trà, viếng chùa Linh Ứng." },
                  { time: "Ngày 2", title: "Bà Nà Hills - Cầu Vàng", description: "Lên cáp treo khám phá Bà Nà Hills, check-in Cầu Vàng, Làng Pháp và vui chơi tại Fantasy Park." },
                  { time: "Ngày 3", title: "Mua sắm - Tiễn khách", description: "Tự do mua sắm đặc sản Miền Trung tại chợ Hàn. Tiễn khách ra sân bay." }
              ],
              rating: 4.8,
              reviewCount: 450,
              childPolicy: [
                  "Đà Nẵng - Trẻ em < 4 tuổi: Miễn phí",
                  "Đà Nẵng - Trẻ em 4-9 tuổi: 50% giá tour",
                  "Đà Nẵng - Trẻ em >= 10 tuổi: 100% giá tour"
              ],
              cancellationPolicy: [
                  "Đà Nẵng - Hủy trước 15 ngày: Miễn phí",
                  "Đà Nẵng - Hủy 7-14 ngày: 50%",
                  "Đà Nẵng - Hủy < 7 ngày: 100%"
              ],
              notes: [
                  "Đà Nẵng - Mang theo đồ bơi",
                  "Đà Nẵng - Mang kem chống nắng"
              ]
          },
          "4": { 
              title: "Hội An", 
              adultPrice: 3200000, 
              image: "/clients/assets/images/gallery-tours/mien-trung-4n3d-da-nang-hoi-an-ba-na-hue-2.png",
              images: [
                "/clients/assets/images/gallery-tours/mien-trung-4n3d-da-nang-hoi-an-ba-na-hue-2.png",
                "https://images.unsplash.com/photo-1599507591144-660da42d6a54?q=80&w=800",
                "https://images.unsplash.com/photo-1589139459345-5d9c24098693?q=80&w=800",
                "https://images.unsplash.com/photo-1570737197214-38600109117f?q=80&w=800",
                "https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?q=80&w=800"
              ],
              overview: "Đắm chìm trong không gian cổ kính của Phố cổ Hội An. Thưởng thức đặc sản địa phương, dạo bước dưới ánh đèn lồng rực rỡ và ngồi thuyền thả hoa đăng trên sông Hoài.",
              itinerary: [
                  { time: "Buổi chiều", title: "Đà Nẵng - Hội An", description: "Di chuyển từ Đà Nẵng vào Hội An. Tham quan Chùa Cầu, hội quán Phước Kiến, nhà cổ Tân Ký." },
                  { time: "Buổi tối", title: "Phố cổ về đêm", description: "Thưởng thức Cao Lầu, Cơm Gà. Dạo phố đèn lồng, thả hoa đăng trên sông Hoài và xem hát Bài Chòi." }
              ],
              rating: 4.6,
              reviewCount: 180,
              childPolicy: [
                  "Hội An - Trẻ em < 4 tuổi: Miễn phí",
                  "Hội An - Trẻ em 4-9 tuổi: 50% giá tour",
                  "Hội An - Trẻ em >= 10 tuổi: 100% giá tour"
              ],
              cancellationPolicy: [
                  "Hội An - Hủy trước 15 ngày: Miễn phí",
                  "Hội An - Hủy 7-14 ngày: 50%",
                  "Hội An - Hủy < 7 ngày: 100%"
              ],
              notes: [
                  "Hội An - Mang theo máy ảnh",
                  "Hội An - Thử món Cao Lầu"
              ]
          },
          "5": { 
              title: "Phú Quốc", 
              adultPrice: 4500000, 
              image: "/clients/assets/images/gallery-tours/bien-dao-3n2d-phu-quoc-1.jpg",
              images: [
                "/clients/assets/images/gallery-tours/bien-dao-3n2d-phu-quoc-1.jpg",
                "https://images.unsplash.com/photo-1589779267440-4bc3922d4f8a?q=80&w=800",
                "https://images.unsplash.com/photo-1506929662033-75d6210b64d1?q=80&w=800",
                "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=800",
                "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=800"
              ],
              overview: "Tận hưởng kỳ nghỉ dưỡng tại Đảo Ngọc Phú Quốc. Tham gia các hoạt động tắm biển, lặn ngắm san hô, tham quan VinWonders và Safari.",
              itinerary: [
                  { time: "Ngày 1", title: "Đón khách - Đông Đảo", description: "Đón sân bay. Buổi chiều tham quan Suối Tranh, Làng chài Hàm Ninh và thưởng thức hải sản." },
                  { time: "Ngày 2", title: "Nam Đảo - Câu cá lặn san hô", description: "Lên tàu du lịch khám phá các đảo nhỏ, câu cá, lặn ngắm san hô. Chiều tham quan nhà tù Phú Quốc." },
                  { time: "Ngày 3", title: "Mua sắm - Tiễn sân bay", description: "Tham quan vườn tiêu, cơ sở sản xuất nước mắm, ngọc trai. Tiễn khách ra sân bay." }
              ],
              rating: 4.9,
              reviewCount: 520,
              childPolicy: [
                  "Phú Quốc - Trẻ em < 4 tuổi: Miễn phí",
                  "Phú Quốc - Trẻ em 4-9 tuổi: 50% giá tour",
                  "Phú Quốc - Trẻ em >= 10 tuổi: 100% giá tour"
              ],
              cancellationPolicy: [
                  "Phú Quốc - Hủy trước 15 ngày: Miễn phí",
                  "Phú Quốc - Hủy 7-14 ngày: 50%",
                  "Phú Quốc - Hủy < 7 ngày: 100%"
              ],
              notes: [
                  "Phú Quốc - Mang theo đồ bơi",
                  "Phú Quốc - Mang kem chống nắng"
              ]
          },
          "6": { 
              title: "Côn Đảo", 
              adultPrice: 5000000, 
              image: "/clients/assets/images/gallery-tours/bien-dao-3n2d-con-dao-1.jpg",
              images: [
                "/clients/assets/images/gallery-tours/bien-dao-3n2d-con-dao-1.jpg",
                "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=800",
                "https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?q=80&w=800",
                "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?q=80&w=800",
                "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?q=80&w=800"
              ],
              overview: "Hành trình linh thiêng và khám phá thiên nhiên hoang sơ tại Côn Đảo. Viếng nghĩa trang Hàng Dương, mộ cô Sáu và các di tích lịch sử nổi tiếng.",
              itinerary: [
                  { time: "Ngày 1", title: "Đón khách - Di tích lịch sử", description: "Tham quan Trại giam Phú Hải, Chuồng Cọp Pháp/Mỹ. Buổi tối viếng mộ cô Sáu tại Nghĩa trang Hàng Dương." },
                  { time: "Ngày 2", title: "Khám phá thiên nhiên", description: "Tắm biển bãi Đầm Trầu, ngắm máy bay hạ cánh. Thăm miếu Bà Phi Yến." }
              ],
              rating: 4.8,
              reviewCount: 95,
              childPolicy: [
                  "Côn Đảo - Trẻ em < 4 tuổi: Miễn phí",
                  "Côn Đảo - Trẻ em 4-9 tuổi: 50% giá tour",
                  "Côn Đảo - Trẻ em >= 10 tuổi: 100% giá tour"
              ],
              cancellationPolicy: [
                  "Côn Đảo - Hủy trước 15 ngày: Miễn phí",
                  "Côn Đảo - Hủy 7-14 ngày: 50%",
                  "Côn Đảo - Hủy < 7 ngày: 100%"
              ],
              notes: [
                  "Côn Đảo - Mang theo đồ bơi",
                  "Côn Đảo - Mang kem chống nắng"
              ]
          },
        };
        
        const defaultMekong = {
            images: [
              "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200",
              "https://images.unsplash.com/photo-1555502575-5cb391e63a32?q=80&w=800",
              "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800",
              "https://images.unsplash.com/photo-1506527632616-65e3170757af?q=80&w=800",
              "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=800"
            ],
            overview: "Tour Mỹ Tho - Bến Tre 1 ngày sẽ đưa quý khách đi du lịch miền Tây với những nét văn hóa đặc trưng của vùng sông nước Cửu Long. Quý Khách sẽ có cơ hội đắm chìm vào giai điệu đờn ca tài tử da diết, chèo xuồng nhỏ len lỏi giữa hai hàng dừa nước xanh mát...",
            itinerary: [
                { time: "Buổi sáng", title: "Đón khách & Tham quan Mỹ Tho", description: "Đón khách lúc 07h00. Ghé trạm dừng chân Mekong Rest Stop. Khởi hành đi Mỹ Tho - Bến Tre. Lên thuyền ngoạn cảnh sông Tiền, thưởng thức trà mật ong, kẹo dừa, đi xe ngựa và chèo xuồng ba lá len lỏi trong rạch dừa nước." },
                { time: "Buổi trưa", title: "Ăn trưa Cồn Phụng", description: "Dùng bữa trưa tại nhà hàng sinh thái Cồn Phụng với các món đặc sản miền Tây như cá tai tượng chiên xù. Tự do dạo quanh cù lao và tìm hiểu di tích đạo Dừa." },
                { time: "Buổi chiều", title: "Chùa Vĩnh Tràng & Trở về", description: "Đoàn tham quan chùa Vĩnh Tràng - ngôi chùa cổ lớn nhất Tiền Giang với kiến trúc Đông - Tây. Sau đó khởi hành về lại TP.HCM, kết thúc hành trình." }
            ]
        };

        const tourInfo = mockDestinations[String(id)] || { 
            title: "Khám phá Tour Đặc Biệt", 
            adultPrice: 3000000, 
            image: "/clients/assets/images/gallery-tours/bien-dao-3n2d-phu-quoc-1.jpg",
            rating: 4.5,
            reviewCount: 100,
            childPolicy: [
                "Tour đặc biệt - Trẻ em < 4 tuổi: Miễn phí",
                "Tour đặc biệt - Trẻ em 4-9 tuổi: 50%",
                "Tour đặc biệt - Trẻ em >= 10 tuổi: 100%"
            ],
            cancellationPolicy: [
                "Tour đặc biệt - Hủy trước 20 ngày: Miễn phí",
                "Tour đặc biệt - Hủy 10-19 ngày: 50%",
                "Tour đặc biệt - Hủy < 10 ngày: 100%"
            ],
            notes: [
                "Tour đặc biệt - Liên hệ hỗ trợ",
                "Tour đặc biệt - Kiểm tra thời tiết"
            ],
            ...defaultMekong
        };

        return {
            status: 200,
            message: "Success (Mock)",
            data: {
                id: Number(id),
                tourId: `T-2026-00${id}`,
                title: tourInfo.title,
                image: tourInfo.image,
                images: tourInfo.images || defaultMekong.images,
                overview: tourInfo.overview || defaultMekong.overview,
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
                    { id: "pkg-standard", name: "Trọn gói tham quan tiêu chuẩn", extraPrice: 0 },
                    { id: "pkg-premium", name: "Trọn gói nâng cao (thêm bữa sáng)", extraPrice: 150000 }
                ],
                itinerary: tourInfo.itinerary || defaultMekong.itinerary,
                inclusions: [
                    "Xe du lịch đời mới máy lạnh 16 - 45 chỗ",
                    "HDV song ngữ Anh - Việt chuyên nghiệp suốt tuyến",
                    "Vé tham quan các điểm trong chương trình",
                    "Bảo hiểm du lịch 20.000.000 VNĐ/vụ"
                ],
                exclusions: [
                    "Chi phí cá nhân ngoài chương trình",
                    "Tiền tip cho HDV và tài xế",
                    "Thuế VAT 8%"
                ],
                rating: tourInfo.rating,
                reviewCount: tourInfo.reviewCount,
                childPolicy: tourInfo.childPolicy || [
                    "Trẻ em dưới 4 tuổi: Miễn phí (gia đình tự túc ăn uống, chỗ ngồi cho bé)",
                    "Trẻ em từ 4 - 9 tuổi: Tính 50% giá tour người lớn (có suất ăn, chỗ ngồi riêng)",
                    "Trẻ em từ 10 tuổi trở lên: Tính như người lớn"
                ],
                cancellationPolicy: tourInfo.cancellationPolicy || [
                    "Hủy tour trước 15 ngày khởi hành: Miễn phí hủy tour",
                    "Hủy tour từ 7 - 14 ngày: Phí hủy 50% tổng giá trị tour",
                    "Hủy tour trong vòng 7 ngày: Phí hủy 100% tổng giá trị tour"
                ],
                notes: tourInfo.notes || [
                    "Quý khách vui lòng mang theo CMND/CCCD hoặc Hộ chiếu gốc",
                    "Nên mang theo trang phục gọn nhẹ, giày thể thao, mũ nón, kem chống nắng",
                    "Lịch trình có thể thay đổi thứ tự các điểm tham quan tùy theo điều kiện thời tiết thực tế"
                ]
            }
        };
    }

    return apiData;
  } catch (err: any) {
    return { status: 500, message: err.message, data: null };
  }
};

export const getTourSchedules = async (id: string | number) => {
    try {
        const tourId = String(id);
        const now = new Date();
        const schedules = [];
        const seed = parseInt(tourId) || 1;
        
        for (let i = 0; i < 10; i++) {
            const date = new Date(now);
            date.setDate(now.getDate() + (i * (seed % 3 + 1)) + (seed % 5));
            let status = "Còn chỗ";
            if (i % 3 === 0) status = "Chỉ còn chỗ";
            if (i % 5 === 0 && i !== 0) status = "Hết chỗ";
            
            schedules.push({
                id: `${tourId}-dep-${i}`,
                date: date.toISOString(),
                status: status,
                price: 2000000 + (seed * 100000) + (i * 50000)
            });
        }
        
        return {
            status: 200,
            message: "Success (Mock Schedules)",
            data: schedules
        };
    } catch (err: any) {
        return { status: 500, message: err.message, data: [] };
    }
};

export const getTourDetails = async (id: string | number) => {
    try {
        const tourId = String(id);
        const mockTours: Record<string, any> = {
            "T-2026-001": {
                childPolicy: [
                    "Hạ Long - Trẻ em < 4 tuổi: Miễn phí",
                    "Hạ Long - Trẻ em 4-9 tuổi: 50%",
                    "Hạ Long - Trẻ em >= 10 tuổi: 100%"
                ],
                cancellationPolicy: [
                    "Hạ Long - Hủy trước 15 ngày: Miễn phí",
                    "Hạ Long - Hủy 7-14 ngày: 50%",
                    "Hạ Long - Hủy < 7 ngày: 100%"
                ],
                notes: [
                    "Hạ Long - Mang theo CCCD",
                    "Hạ Long - Mang đồ bơi"
                ]
            },
            "T-2026-002": {
                childPolicy: [
                    "Ninh Bình - Trẻ em < 4 tuổi: Miễn phí",
                    "Ninh Bình - Trẻ em 4-9 tuổi: 50%",
                    "Ninh Bình - Trẻ em >= 10 tuổi: 100%"
                ],
                cancellationPolicy: [
                    "Ninh Bình - Hủy trước 10 ngày: Miễn phí",
                    "Ninh Bình - Hủy 5-9 ngày: 50%",
                    "Ninh Bình - Hủy < 5 ngày: 100%"
                ],
                notes: [
                    "Ninh Bình - Giày thể thao",
                    "Ninh Bình - Nước uống"
                ]
            }
        };

        const tourData = mockTours[tourId] || {
            childPolicy: ["Liên hệ để biết thêm chi tiết"],
            cancellationPolicy: ["Theo quy định chung"],
            notes: ["Mang theo giấy tờ tùy thân"]
        };

        return {
            status: 200,
            message: "Success (Mock Tour)",
            data: tourData
        };
    } catch (err: any) {
        return { status: 500, message: err.message, data: null };
    }
};

export default {
    getDepartureDetails,
    getTourSchedules,
    getTourDetails
};
