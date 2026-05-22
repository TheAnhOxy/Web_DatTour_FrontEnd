type ReviewItem = {
  id: number | string;
  name: string;
  rating: number;
  comment: string;
  avatar?: string;
  createdAt?: string;
};

type QuestionItem = {
  id: number | string;
  question: string;
  answer?: string;
  name?: string;
  createdAt?: string;
};

type ReviewsSectionProps = {
  averageRating: number;
  reviewCount: number;
  reviews: ReviewItem[];
  questions: QuestionItem[];
  timeLabel: string;
  questionText: string;
  questionStatus?: string;
  isSubmittingQuestion: boolean;
  onQuestionChange: (value: string) => void;
  onQuestionSubmit: () => void;
};

const formatDate = (date?: string) => {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN");
};

export default function ReviewsSection({
  averageRating,
  reviewCount,
  reviews,
  questions,
  timeLabel,
  questionText,
  questionStatus,
  isSubmittingQuestion,
  onQuestionChange,
  onQuestionSubmit,
}: ReviewsSectionProps) {
  return (
    <>
      <h3>Đánh giá của khách hàng</h3>
      <div className="clients-reviews bgc-black mt-30 mb-60">
        <div className="left">
          <b>{averageRating.toFixed(1)}</b>
          <span>({reviewCount} đánh giá)</span>
          <div className="ratting">
            {[...Array(5)].map((_, index) => (
              <i
                className={index < Math.round(averageRating) ? "fas fa-star" : "far fa-star"}
                key={`avg-${index}`}
              ></i>
            ))}
          </div>
        </div>
        <div className="right"></div>
      </div>

      <h3>Ý kiến của khách hàng</h3>
      <div className="comments mt-30 mb-60">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div className="comment-body" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50" key={review.id}>
              {review.avatar && (
                <div className="author-thumb">
                  <img src={review.avatar} alt={review.name} />
                </div>
              )}
              <div className="content">
                <h6>{review.name}</h6>
                <div className="ratting">
                  {[...Array(5)].map((_, index) => (
                    <i
                      className={index < Math.round(review.rating) ? "fas fa-star" : "far fa-star"}
                      key={`review-${review.id}-${index}`}
                    ></i>
                  ))}
                </div>
                <span className="time">{formatDate(review.createdAt) || timeLabel}</span>
                <p>{review.comment}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="mb-0" style={{ color: "#777" }}>Chưa có ý kiến khách hàng từ hệ thống.</p>
        )}
      </div>

      <h3>Hỏi đáp</h3>
      <div className="comment-form bgc-lighter z-1 rel mb-30">
        <div className="form-group">
          <textarea
            className="form-control"
            rows={4}
            value={questionText}
            onChange={(event) => onQuestionChange(event.target.value)}
            placeholder="Nhập câu hỏi của bạn để được tư vấn nhanh hơn..."
          />
        </div>
        <p style={{ color: "#777", fontSize: 13, marginTop: -10 }}>
          Viết lịch sự, không chia sẻ thông tin nhạy cảm.
        </p>
        <button
          type="button"
          className="theme-btn style-two"
          disabled={isSubmittingQuestion || !questionText.trim()}
          onClick={onQuestionSubmit}
        >
          <span data-hover={isSubmittingQuestion ? "Đang gửi..." : "Gửi câu hỏi"}>
            {isSubmittingQuestion ? "Đang gửi..." : "Gửi câu hỏi"}
          </span>
          <i className="fal fa-arrow-right"></i>
        </button>
        {questionStatus && (
          <p style={{ color: "#666", marginTop: 12, marginBottom: 0 }}>{questionStatus}</p>
        )}
      </div>

      <div className="comments mt-30 mb-0">
        {questions.length > 0 ? (
          questions.map((item) => (
            <div className="comment-body" key={item.id}>
              <div className="content">
                <h6>{item.name || "Khách hàng"}</h6>
                <span className="time">{formatDate(item.createdAt)}</span>
                <p>{item.question}</p>
                {item.answer && (
                  <p style={{ background: "#F7F8FA", borderLeft: "3px solid #FF6B00", padding: "10px 12px" }}>
                    <strong>Trả lời: </strong>{item.answer}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="mb-0" style={{ color: "#777" }}>Chưa có câu hỏi nào từ hệ thống.</p>
        )}
      </div>
    </>
  );
}
