type TourItem = {
  id: number;
  title: string;
  destination: string;
  time: string;
  quantity: string;
  rating: number;
  price: string;
  image: string;
};

type TourGridProps = {
  tours: TourItem[];
  hidePagination?: boolean;
};

export default function TourGrid({ tours, hidePagination = false }: TourGridProps) {
  return (
    <div className="tour-grid-wrap">
      <div className="loader"></div>
      <div className="row" id="tours-container">
        {tours.map((tour) => (
          <div className="col-xl-4 col-md-6" style={{ marginBottom: 30 }} key={tour.id}>
            <div
              className="destination-item tour-grid style-three bgc-lighter block_tours equal-block-fix"
              data-aos="fade-up"
              data-aos-duration="1500"
              data-aos-offset="50"
            >
              <div className="image">
                <span className="badge bgc-pink">Featured</span>
                <a href="#" className="heart">
                  <i className="fas fa-heart"></i>
                </a>
                <img src={tour.image} alt="Tour List" />
              </div>
              <div className="content equal-content-fix">
                <div className="destination-header">
                  <span className="location">
                    <i className="fal fa-map-marker-alt"></i>
                    {tour.destination}
                  </span>
                  <div className="ratting">
                    {[...Array(5)].map((_, index) => (
                      <i
                        className={index < tour.rating ? "fas fa-star" : "far fa-star"}
                        key={`${tour.id}-${index}`}
                      ></i>
                    ))}
                  </div>
                </div>
                <h6>
                  <a href={`/tours/${tour.id}`}>{tour.title}</a>
                </h6>
                <ul className="blog-meta">
                  <li>
                    <i className="far fa-clock"></i>
                    {tour.time}
                  </li>
                  <li>
                    <i className="far fa-user"></i>
                    {tour.quantity}
                  </li>
                </ul>
                <div className="destination-footer">
                  <span className="price">
                    <span>{tour.price}</span> VND / nguoi
                  </span>
                  <a href={`/tours/${tour.id}`} className="theme-btn style-two style-three">
                    <i className="fal fa-arrow-right"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}

        {!hidePagination && (
          <div className="col-lg-12">
            <ul
              className="pagination justify-content-center pt-15 flex-wrap pagination-tours"
              data-aos="fade-up"
              data-aos-duration="1500"
              data-aos-offset="50"
            >
              <li className="page-item disabled">
                <span className="page-link">
                  <i className="far fa-chevron-left"></i>
                </span>
              </li>
              <li className="page-item active">
                <a className="page-link" href="#">
                  1
                </a>
              </li>
              <li className="page-item">
                <a className="page-link" href="#">
                  2
                </a>
              </li>
              <li className="page-item">
                <a className="page-link" href="#">
                  3
                </a>
              </li>
              <li className="page-item">
                <a className="page-link" href="#">
                  <i className="far fa-chevron-right"></i>
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
