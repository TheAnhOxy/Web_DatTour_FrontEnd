type ReviewItem = {
  id: number;
  name: string;
  rating: number;
  comment: string;
  avatar: string;
};

type ReviewsSectionProps = {
  averageRating: number;
  reviewCount: number;
  reviews: ReviewItem[];
  timeLabel: string;
};

export default function ReviewsSection({ averageRating, reviewCount, reviews, timeLabel }: ReviewsSectionProps) {
  return (
    <>
      <h3>Danh gia cua khach hang</h3>
      <div className="clients-reviews bgc-black mt-30 mb-60">
        <div className="left">
          <b>{averageRating.toFixed(1)}</b>
          <span>({reviewCount} danh gia)</span>
          <div className="ratting">
            {[...Array(5)].map((_, index) => (
              <i
                className={index < averageRating ? "fas fa-star" : "far fa-star"}
                key={`avg-${index}`}
              ></i>
            ))}
          </div>
        </div>
        <div className="right"></div>
      </div>

      <h3>Y kien cua khach hang</h3>
      <div className="comments mt-30 mb-60">
        {reviews.map((review) => (
          <div className="comment-body" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50" key={review.id}>
            <div className="author-thumb">
              <img src={review.avatar} alt="" />
            </div>
            <div className="content">
              <h6>{review.name}</h6>
              <div className="ratting">
                {[...Array(5)].map((_, index) => (
                  <i
                    className={index < review.rating ? "fas fa-star" : "far fa-star"}
                    key={`review-${review.id}-${index}`}
                  ></i>
                ))}
              </div>
              <span className="time">{timeLabel}</span>
              <p>{review.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
