import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminClientUI.css";

const BASE_URL = "https://grateful-warmth-production-b64e.up.railway.app";

const CATEGORY_OPTIONS = [
  "Shopping",
  "Food",
  "Travel",
  "Fashion",
  "Electronics",
  "Entertainment",
  "Beauty",
  "Wallet"
];

const AdminClientUI = () => {
  const [adminConfig, setAdminConfig] = useState({
    adminName: ""
  });

  const [banners, setBanners] = useState({
    banner1: null,
    banner2: null,
    banner3: null,
    banner4: null
  });

  const [bannerPreview, setBannerPreview] = useState({});

  const [themeUpload, setThemeUpload] = useState({
    themeName1: "",
    themeImg1: null,
    themeName2: "",
    themeImg2: null,
    themeName3: "",
    themeImg3: null,
    themeName4: "",
    themeImg4: null,

    img1: null,
    img1Name: "",
    img2: null,
    img2Name: "",
    img3: null,
    img3Name: "",
    img4: null,
    img4Name: "",

    img6: null,
    img6Name: "",
    img7: null,
    img7Name: "",
    img8: null,
    img8Name: "",
    img9: null,
    img9Name: "",

    img11: null,
    img11Name: "",
    img12: null,
    img12Name: "",
    img13: null,
    img13Name: "",
    img14: null,
    img14Name: "",

    img16: null,
    img16Name: "",
    img17: null,
    img17Name: "",
    img18: null,
    img18Name: "",
    img19: null,
    img19Name: ""
  });

  const [themePreview, setThemePreview] = useState({});

  const [clientBrandForm, setClientBrandForm] = useState({
    brandName: "",
    category: "",
    termsAndConditions: "",
    howToRedeem: "",
    brandImg: null
  });

  const [clientBrandPreview, setClientBrandPreview] = useState("");
  const [clientBrandList, setClientBrandList] = useState([]);
  const [brandLoading, setBrandLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const getImageUrl = (imgPath) => {
    if (!imgPath) return "";

    if (imgPath.startsWith("http://") || imgPath.startsWith("https://")) {
      return imgPath;
    }

    if (imgPath.startsWith("/")) {
      return `${BASE_URL}${imgPath}`;
    }

    return `${BASE_URL}/uploads/${imgPath}`;
  };

  const saveAdminName = async () => {
    try {
      await axios.post(`${BASE_URL}/api/admin/config`, {
        adminName: adminConfig.adminName
      });
      alert("Admin Name Saved Successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save admin name");
    }
  };

  const handleBannerChange = (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    setBanners((prev) => ({
      ...prev,
      [key]: file
    }));

    setBannerPreview((prev) => ({
      ...prev,
      [key]: URL.createObjectURL(file)
    }));
  };

  const saveBanners = async () => {
    try {
      const form = new FormData();

      Object.keys(banners).forEach((key) => {
        if (banners[key]) {
          form.append(key, banners[key]);
        }
      });

      await axios.post(`${BASE_URL}/api/admin/banner/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Banners Saved Successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save banners");
    }
  };

  const handleThemeImage = (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    setThemeUpload((prev) => ({
      ...prev,
      [key]: file
    }));

    setThemePreview((prev) => ({
      ...prev,
      [key]: URL.createObjectURL(file)
    }));
  };

  const handleThemeNameChange = (key, value) => {
    setThemeUpload((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const saveTheme = async () => {
    try {
      const form = new FormData();

      for (let i = 1; i <= 4; i++) {
        const nameKey = `themeName${i}`;
        const imgKey = `themeImg${i}`;

        if (themeUpload[nameKey]) form.append(nameKey, themeUpload[nameKey]);
        if (themeUpload[imgKey]) form.append(imgKey, themeUpload[imgKey]);
      }

      const fields = [
        ["img1", "img1Name"],
        ["img2", "img2Name"],
        ["img3", "img3Name"],
        ["img4", "img4Name"],
        ["img6", "img6Name"],
        ["img7", "img7Name"],
        ["img8", "img8Name"],
        ["img9", "img9Name"],
        ["img11", "img11Name"],
        ["img12", "img12Name"],
        ["img13", "img13Name"],
        ["img14", "img14Name"],
        ["img16", "img16Name"],
        ["img17", "img17Name"],
        ["img18", "img18Name"],
        ["img19", "img19Name"]
      ];

      fields.forEach(([fileKey, nameKey]) => {
        if (themeUpload[fileKey]) form.append(fileKey, themeUpload[fileKey]);
        if (themeUpload[nameKey]) form.append(nameKey, themeUpload[nameKey]);
      });

      await axios.post(`${BASE_URL}/api/admin/theme/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Theme Saved Successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save theme");
    }
  };

  const fetchClientBrands = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/client-choose-brand`);
      setClientBrandList(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to fetch client brands:", error);
      setClientBrandList([]);
    }
  };

  useEffect(() => {
    fetchClientBrands();
  }, []);

  const handleClientBrandImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setClientBrandForm((prev) => ({
      ...prev,
      brandImg: file
    }));

    setClientBrandPreview(URL.createObjectURL(file));
  };

  const handleClientBrandChange = (field, value) => {
    setClientBrandForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const saveClientChooseBrand = async () => {
    if (!clientBrandForm.brandName.trim()) {
      alert("Please enter brand name");
      return;
    }

    if (!clientBrandForm.category) {
      alert("Please select category");
      return;
    }

    if (!clientBrandForm.termsAndConditions.trim()) {
      alert("Please enter terms and conditions");
      return;
    }

    if (!clientBrandForm.howToRedeem.trim()) {
      alert("Please enter how to redeem");
      return;
    }

    if (!clientBrandForm.brandImg) {
      alert("Please select brand image");
      return;
    }

    try {
      setBrandLoading(true);

      const form = new FormData();
      form.append("brandName", clientBrandForm.brandName);
      form.append("category", clientBrandForm.category);
      form.append("termsAndConditions", clientBrandForm.termsAndConditions);
      form.append("howToRedeem", clientBrandForm.howToRedeem);
      form.append("image", clientBrandForm.brandImg);

      await axios.post(`${BASE_URL}/api/client-choose-brand/upload`, form, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Client Choose Brand added successfully!");

      setClientBrandForm({
        brandName: "",
        category: "",
        termsAndConditions: "",
        howToRedeem: "",
        brandImg: null
      });
      setClientBrandPreview("");

      await fetchClientBrands();
    } catch (error) {
      console.error(error);
      alert("Failed to add Client Choose Brand");
    } finally {
      setBrandLoading(false);
    }
  };

  const deleteBrand = async (id, name) => {
    const ok = window.confirm(`Delete "${name}" ?`);
    if (!ok) return;

    try {
      setDeleteLoadingId(id);

      await axios.delete(`${BASE_URL}/api/client-choose-brand/${id}`);

      setClientBrandList((prev) => prev.filter((item) => item.id !== id));
      alert("Brand deleted successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to delete brand");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-card big-card">
        <h1 className="admin-title">Admin Configuration Panel</h1>

        <section className="section-block">
          <div className="section-head">
            <h2 className="section-title">Admin Basic Info</h2>
          </div>

          <div className="form-grid single-grid">
            <div className="input-group">
              <label>Admin Name</label>
              <input
                type="text"
                value={adminConfig.adminName}
                onChange={(e) =>
                  setAdminConfig({ adminName: e.target.value })
                }
                placeholder="Enter admin name"
              />
            </div>
          </div>

          <button className="save-btn" onClick={saveAdminName}>
            Save Admin Name
          </button>
        </section>

        <section className="section-block">
          <div className="section-head">
            <h2 className="section-title">Upload Banners</h2>
            <span className="section-badge">4 Banners</span>
          </div>

          <div className="banner-grid">
            {["banner1", "banner2", "banner3", "banner4"].map((key, i) => (
              <div className="upload-card" key={key}>
                <div className="input-group">
                  <label>Banner {i + 1}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleBannerChange(e, key)}
                  />
                </div>

                {bannerPreview[key] ? (
                  <img
                    src={bannerPreview[key]}
                    alt={`banner-${i + 1}`}
                    className="preview-image wide-preview"
                  />
                ) : (
                  <div className="empty-preview">No image selected</div>
                )}
              </div>
            ))}
          </div>

          <button className="save-btn" onClick={saveBanners}>
            Save Banners
          </button>
        </section>

        <section className="section-block">
          <div className="section-head">
            <h2 className="section-title">Theme Setup</h2>
            <span className="section-badge">Desktop Layout</span>
          </div>

          {[1, 2, 3, 4].map((t) => {
            const map = {
              1: ["img1", "img2", "img3", "img4"],
              2: ["img6", "img7", "img8", "img9"],
              3: ["img11", "img12", "img13", "img14"],
              4: ["img16", "img17", "img18", "img19"]
            };

            return (
              <div className="theme-card" key={t}>
                <h3 className="theme-heading">Theme {t}</h3>

                <div className="theme-top-grid">
                  <div className="input-group">
                    <label>Theme Name {t}</label>
                    <input
                      type="text"
                      value={themeUpload[`themeName${t}`]}
                      onChange={(e) =>
                        setThemeUpload((prev) => ({
                          ...prev,
                          [`themeName${t}`]: e.target.value
                        }))
                      }
                      placeholder={`Enter theme ${t} name`}
                    />
                  </div>

                  <div className="input-group">
                    <label>Main Theme Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleThemeImage(e, `themeImg${t}`)}
                    />
                  </div>
                </div>

                {themePreview[`themeImg${t}`] && (
                  <img
                    src={themePreview[`themeImg${t}`]}
                    alt={`theme-main-${t}`}
                    className="preview-image hero-preview"
                  />
                )}

                <div className="theme-grid">
                  {map[t].map((key) => {
                    const nameKey = `${key}Name`;

                    return (
                      <div className="mini-card" key={key}>
                        <label>{key.toUpperCase()}</label>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleThemeImage(e, key)}
                        />

                        <input
                          type="text"
                          placeholder="Image Name"
                          value={themeUpload[nameKey]}
                          onChange={(e) =>
                            handleThemeNameChange(nameKey, e.target.value)
                          }
                        />

                        {themePreview[key] ? (
                          <img
                            src={themePreview[key]}
                            alt={key}
                            className="preview-image square-preview"
                          />
                        ) : (
                          <div className="empty-preview mini-empty">
                            No image
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <button className="save-btn" onClick={saveTheme}>
            Save All Themes
          </button>
        </section>

        <section className="section-block client-brand-section">
          <div className="section-head">
            <h2 className="section-title">Client Choose Brand</h2>
            <span className="section-badge">
              {clientBrandList.length} Added
            </span>
          </div>

          <div className="client-brand-layout">
            <div className="client-brand-form-card">
              <h3 className="sub-title">Add New Brand</h3>

              <div className="form-grid">
                <div className="input-group">
                  <label>Brand Name</label>
                  <input
                    type="text"
                    placeholder="Enter brand name"
                    value={clientBrandForm.brandName}
                    onChange={(e) =>
                      handleClientBrandChange("brandName", e.target.value)
                    }
                  />
                </div>

                <div className="input-group">
                  <label>Category</label>
                  <select
                    value={clientBrandForm.category}
                    onChange={(e) =>
                      handleClientBrandChange("category", e.target.value)
                    }
                  >
                    <option value="">Select category</option>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Terms and Conditions</label>
                <textarea
                  rows="5"
                  placeholder="Enter terms and conditions"
                  value={clientBrandForm.termsAndConditions}
                  onChange={(e) =>
                    handleClientBrandChange(
                      "termsAndConditions",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="input-group">
                <label>How to Redeem</label>
                <textarea
                  rows="5"
                  placeholder="Enter how to redeem"
                  value={clientBrandForm.howToRedeem}
                  onChange={(e) =>
                    handleClientBrandChange("howToRedeem", e.target.value)
                  }
                />
              </div>

              <div className="input-group">
                <label>Brand Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleClientBrandImage}
                />
              </div>

              {clientBrandPreview ? (
                <img
                  src={clientBrandPreview}
                  alt="brand-preview"
                  className="preview-image brand-preview-large"
                />
              ) : (
                <div className="empty-preview brand-empty-preview">
                  Brand image preview will appear here
                </div>
              )}

              <button
                className="save-btn"
                onClick={saveClientChooseBrand}
                disabled={brandLoading}
              >
                {brandLoading ? "Saving..." : "Add Client Brand"}
              </button>
            </div>

            <div className="client-brand-list-card">
              <h3 className="sub-title">Added Brands</h3>

              {clientBrandList.length === 0 ? (
                <p className="empty-text">No brand added yet.</p>
              ) : (
                <div className="brand-grid">
                  {clientBrandList.map((item, index) => (
                    <div className="brand-card" key={item.id || index}>
                      <img
                        src={getImageUrl(item.brandImg)}
                        alt={item.brandName}
                        className="brand-card-img"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />

                      <div className="brand-card-body">
                        <div className="brand-card-top">
                          <h4>{item.brandName}</h4>
                          <span className="brand-tag">{item.category}</span>
                        </div>

                        <div className="brand-info-block">
                          <h5>Terms & Conditions</h5>
                          <p className="brand-card-text multiline-text">
                            {item.termsAndConditions || "No terms added"}
                          </p>
                        </div>

                        <div className="brand-info-block">
                          <h5>How to Redeem</h5>
                          <p className="brand-card-text multiline-text">
                            {item.howToRedeem || "No redeem steps added"}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() => deleteBrand(item.id, item.brandName)}
                          disabled={deleteLoadingId === item.id}
                        >
                          {deleteLoadingId === item.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminClientUI;