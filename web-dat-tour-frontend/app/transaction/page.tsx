export default function TransactionPage() {
  return (
    

    <>
      <section
        className="page-banner-area pt-50 pb-35 rel z-1 bgs-cover"
        style={{ backgroundImage: "url(/clients/assets/images/banner/banner.jpg)" }}
      >
        <div className="container">
          <div className="banner-inner text-white">
            <h2
              className="page-title mb-10"
              data-aos="fade-left"
              data-aos-duration="1500"
              data-aos-offset="50"
            >
              Transaction
            </h2>
            <nav aria-label="breadcrumb">
              <ol
                className="breadcrumb justify-content-center mb-20"
                data-aos="fade-right"
                data-aos-delay="200"
                data-aos-duration="1500"
                data-aos-offset="50"
              >
                <li className="breadcrumb-item">
                  <a href="/">Trang chu</a>
                </li>
                <li className="breadcrumb-item active">Transaction</li>
              </ol>
            </nav>
          </div>
        </div>
      </section>

      <section className="container" style={{ marginTop: 50, marginBottom: 100 }}>
        <div className="card p-4">
          <h1 className="mb-4">Process Transaction</h1>
          <form action="#" method="GET">
            <div className="mb-3">
              <label htmlFor="amount" className="form-label">
                Amount (USD)
              </label>
              <input type="number" className="form-control" id="amount" name="amount" required />
            </div>
            <button type="submit" className="btn btn-primary">
              Pay Now
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
