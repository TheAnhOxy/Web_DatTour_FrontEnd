const user = {
  fullName: "Nguyen Duc Hau",
  address: "Phạm Văn chiêu, Phường 9, Gò Vấp, Hồ Chí Minh",
  email: "duchaunguyen131@gmail.com",
  phoneNumber: "0900000000",
  avatar: "/clients/assets/images/user-profile/user_avatar.jpg",
};

export default function UserProfilePage() {
  return (
    

    <>
      <div className="user-profile">
        <div className="container-xl px-4 mt-4">
          <div className="row">
            <div className="col-xl-4">
              <div className="card mb-4 mb-xl-0">
                <div className="card-header">Anh dai dien</div>
                <div className="card-body text-center">
                  <img
                    id="avatarPreview"
                    className="img-account-profile rounded-circle mb-2"
                    src={user.avatar}
                    style={{ width: 160, height: 160 }}
                    alt={`Anh dai dien ${user.fullName}`}
                  />

                  <div className="small font-italic text-muted mb-4">JPG hoac PNG khong lon hon 5 MB</div>
                  <input type="file" name="avatar" id="avatar" style={{ display: "none" }} accept="image/*" />
                  <label htmlFor="avatar" className="btn btn-primary">
                    Tai anh len
                  </label>
                </div>
              </div>

              <div className="card mb-4 mb-xl-0">
                <button className="btn btn-primary" id="update_password_profile">
                  Doi mat khau
                </button>
              </div>
            </div>
            <div className="col-xl-8">
              <div className="card mb-4">
                <div className="card-header">Thong tin tai khoan</div>
                <div className="card-body">
                  <form action="#" method="POST" name="updateUser" className="updateUser">
                    <div className="row gx-3 mb-3">
                      <div className="col-md-12">
                        <label className="small mb-1" htmlFor="inputFullName">
                          Ho va ten
                        </label>
                        <input
                          className="form-control"
                          id="inputFullName"
                          type="text"
                          placeholder="Ho va ten"
                          defaultValue={user.fullName}
                          required
                        />
                      </div>
                    </div>
                    <div className="row gx-3 mb-3">
                      <div className="col-md-12">
                        <label className="small mb-1" htmlFor="inputLocation">
                          Dia chi
                        </label>
                        <input
                          className="form-control"
                          id="inputLocation"
                          type="text"
                          placeholder="Dia chi"
                          defaultValue={user.address}
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="small mb-1" htmlFor="inputEmailAddress">
                        Email
                      </label>
                      <input
                        className="form-control"
                        id="inputEmailAddress"
                        type="email"
                        placeholder="Email"
                        defaultValue={user.email}
                        required
                      />
                    </div>
                    <div className="row gx-3 mb-3">
                      <div className="col-md-6">
                        <label className="small mb-1" htmlFor="inputPhone">
                          Phone number
                        </label>
                        <input
                          className="form-control"
                          id="inputPhone"
                          type="number"
                          placeholder="So dien thoai"
                          defaultValue={user.phoneNumber}
                          required
                        />
                      </div>
                    </div>

                    <button className="btn btn-primary" type="submit" id="update_profile">
                      Luu thong tin
                    </button>
                  </form>
                </div>
              </div>
              <div className="card mb-4">
                <div className="card-body" id="card_change_password">
                  <div className="invalid-feedback" style={{ marginTop: -15 }} id="validate_password"></div>
                  <form action="#" method="post" className="change_password_profile">
                    <div className="row gx-3">
                      <div className="col-md-4">
                        <input
                          className="form-control"
                          id="inputOldPass"
                          type="text"
                          placeholder="Nhap mat khau cu"
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <input
                          className="form-control"
                          id="inputNewPass"
                          type="text"
                          placeholder="Nhap mat khau moi"
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <button className="btn btn-primary" type="submit">
                          Thay doi
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
