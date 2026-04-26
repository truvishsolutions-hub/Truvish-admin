import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./AdminClientUI.css";
import truvishLogo from "../assets/LOGO/TV-BG.png";

const BASE_URL = "https://truvish-backend-production.up.railway.app";
const MAX_IMAGE_SIZE_BYTES = 1024 * 1024;

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

const THEME_IMAGE_MAP = {
  1: ["img1", "img2", "img3", "img4"],
  2: ["img6", "img7", "img8", "img9"],
  3: ["img11", "img12", "img13", "img14"],
  4: ["img16", "img17", "img18", "img19"]
};

const IMAGE_REQUIREMENTS = {
  banner: { width: 1200, height: 628, label: "1200 × 628 px" },
  themeMain: { width: 1200, height: 628, label: "1200 × 628 px" },
  themeSub: { width: 600, height: 600, label: "600 × 600 px" },
  brand: { width: 600, height: 400, label: "600 × 400 px" }
};

const MENU_ITEMS = [
  { id: "admin-info", label: "Admin Info", icon: "👤", section: "admin-info-section" },
  { id: "banners", label: "Banners", icon: "🖼️", section: "banners-section" },
  { id: "theme", label: "Theme Setup", icon: "🎨", section: "theme-section" },
  { id: "brands", label: "Client Brands", icon: "🏷️", section: "brands-section" }
];

const AdminClientUI = () => {
  const [adminConfig, setAdminConfig] = useState({ adminName: "" });
  const [existingConfig, setExistingConfig] = useState(null);
  const [savingKey, setSavingKey] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const [banners, setBanners] = useState({
    banner1: null,
    banner2: null,
    banner3: null,
    banner4: null
  });
  const [bannerPreview, setBannerPreview] = useState({});
  const [bannerMeta, setBannerMeta] = useState({});

  const [themeUpload, setThemeUpload] = useState({
    themeName1: "",
    themeImg1: null,
    themeName2: "",
    themeImg2: null,
    themeName3: "",
    themeImg3: null,
    themeName4: "",
    themeImg4: null,
    img1: null, img1Name: "",
    img2: null, img2Name: "",
    img3: null, img3Name: "",
    img4: null, img4Name: "",
    img6: null, img6Name: "",
    img7: null, img7Name: "",
    img8: null, img8Name: "",
    img9: null, img9Name: "",
    img11: null, img11Name: "",
    img12: null, img12Name: "",
    img13: null, img13Name: "",
    img14: null, img14Name: "",
    img16: null, img16Name: "",
    img17: null, img17Name: "",
    img18: null, img18Name: "",
    img19: null, img19Name: ""
  });
  const [themePreview, setThemePreview] = useState({});
  const [themeMeta, setThemeMeta] = useState({});

  const [clientBrandForm, setClientBrandForm] = useState({
    brandName: "",
    category: "",
    termsAndConditions: "",
    howToRedeem: "",
    brandImg: null
  });
  const [clientBrandPreview, setClientBrandPreview] = useState("");
  const [clientBrandMeta, setClientBrandMeta] = useState(null);
  const [clientBrandList, setClientBrandList] = useState([]);
  const [brandLoading, setBrandLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const totalThemeAssets = useMemo(
    () => Object.values(THEME_IMAGE_MAP).reduce((acc, items) => acc + items.length, 0) + 4,
    []
  );

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getRequirementForKey = (key) => {
    if (["banner1", "banner2", "banner3", "banner4"].includes(key)) return IMAGE_REQUIREMENTS.banner;
    if (["themeImg1", "themeImg2", "themeImg3", "themeImg4"].includes(key)) return IMAGE_REQUIREMENTS.themeMain;
    if ([
      "img1", "img2", "img3", "img4",
      "img6", "img7", "img8", "img9",
      "img11", "img12", "img13", "img14",
      "img16", "img17", "img18", "img19"
    ].includes(key)) return IMAGE_REQUIREMENTS.themeSub;
    if (key === "brandImg") return IMAGE_REQUIREMENTS.brand;
    return null;
  };

  const getRequirementText = (key) => {
    const requirement = getRequirementForKey(key);
    if (!requirement) return "Only image files, max 1MB";
    return `Only image files, max 1MB, required size ${requirement.label}`;
  };

  const getImageMeta = (file) =>
    new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        resolve({
          previewUrl: objectUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
          sizeBytes: file.size,
          sizeLabel: formatFileSize(file.size),
          name: file.name
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Invalid image file"));
      };

      img.src = objectUrl;
    });

  const validateImageFile = async (file, label, key) => {
    if (!file) return null;

    if (!file.type?.startsWith("image/")) {
      alert(`Only image files are allowed for ${label}.`);
      return null;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      alert(`${label} must be 1MB or smaller. Selected file: ${formatFileSize(file.size)}`);
      return null;
    }

    try {
      const meta = await getImageMeta(file);
      const requirement = getRequirementForKey(key);

      if (requirement && (meta.width !== requirement.width || meta.height !== requirement.height)) {
        alert(`${label} must be exactly ${requirement.label}. Selected image: ${meta.width} × ${meta.height}px.`);
        return null;
      }

      return meta;
    } catch {
      alert(`Please select a valid image for ${label}.`);
      return null;
    }
  };

  const renderImageMeta = (meta) => {
    if (!meta) return null;

    return (
      <div className="image-meta-box">
        <div className="meta-row">
          <span className="meta-label">File</span>
          <span className="meta-value">{meta.name}</span>
        </div>
        <div className="meta-row">
          <span className="meta-label meta-label-size">Image Size</span>
          <span className="meta-value meta-value-size">{meta.sizeLabel}</span>
        </div>
        <div className="meta-row">
          <span className="meta-label">Width</span>
          <span className="meta-value">{meta.width}px</span>
        </div>
        <div className="meta-row">
          <span className="meta-label">Height</span>
          <span className="meta-value">{meta.height}px</span>
        </div>
        <div className="meta-row">
          <span className="meta-label meta-label-dimensions">Dimensions</span>
          <span className="meta-value meta-value-dimensions">{meta.width} × {meta.height}px</span>
        </div>
      </div>
    );
  };

  const getImageUrl = (imgPath) => {
    if (!imgPath) return "";
    if (imgPath.startsWith("http://") || imgPath.startsWith("https://")) return imgPath;
    if (imgPath.startsWith("/")) return `${BASE_URL}${imgPath}`;
    return `${BASE_URL}/uploads/${imgPath}`;
  };

  const fetchAdminConfig = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/config`);
      const data = res.data || {};
      setExistingConfig(data);
      setAdminConfig({ adminName: data.adminName || "" });

      setThemeUpload((prev) => ({
        ...prev,
        themeName1: data.themeName1 || "",
        themeName2: data.themeName2 || "",
        themeName3: data.themeName3 || "",
        themeName4: data.themeName4 || "",
        img1Name: data.img1Name || "",
        img2Name: data.img2Name || "",
        img3Name: data.img3Name || "",
        img4Name: data.img4Name || "",
        img6Name: data.img6Name || "",
        img7Name: data.img7Name || "",
        img8Name: data.img8Name || "",
        img9Name: data.img9Name || "",
        img11Name: data.img11Name || "",
        img12Name: data.img12Name || "",
        img13Name: data.img13Name || "",
        img14Name: data.img14Name || "",
        img16Name: data.img16Name || "",
        img17Name: data.img17Name || "",
        img18Name: data.img18Name || "",
        img19Name: data.img19Name || ""
      }));
    } catch (error) {
      console.error("Failed to fetch admin config:", error);
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
    fetchAdminConfig();
    fetchClientBrands();
  }, []);

  const saveAdminName = async () => {
    try {
      await axios.post(`${BASE_URL}/api/admin/config`, {
        ...existingConfig,
        adminName: adminConfig.adminName
      });
      alert("Admin Name Saved Successfully!");
      fetchAdminConfig();
    } catch (error) {
      console.error(error);
      alert("Failed to save admin name");
    }
  };

  const handleBannerChange = async (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    const meta = await validateImageFile(file, `Banner ${key.replace("banner", "")}`, key);
    if (!meta) {
      e.target.value = "";
      return;
    }

    setBanners((prev) => ({ ...prev, [key]: file }));
    setBannerPreview((prev) => ({ ...prev, [key]: meta.previewUrl }));
    setBannerMeta((prev) => ({ ...prev, [key]: meta }));
  };

  const saveSingleBanner = async (key) => {
    if (!banners[key]) {
      alert("Please select image first");
      return;
    }

    try {
      setSavingKey(key);
      const form = new FormData();
      form.append(key, banners[key]);

      await axios.post(`${BASE_URL}/api/admin/banner/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert(`${key} saved successfully!`);
      setBanners((prev) => ({ ...prev, [key]: null }));
      await fetchAdminConfig();
    } catch (error) {
      console.error(error);
      alert(`Failed to save ${key}`);
    } finally {
      setSavingKey("");
    }
  };

  const handleThemeImage = async (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    const label = key.startsWith("themeImg")
      ? `Theme ${key.replace("themeImg", "")} Main Image`
      : key.toUpperCase();

    const meta = await validateImageFile(file, label, key);
    if (!meta) {
      e.target.value = "";
      return;
    }

    setThemeUpload((prev) => ({ ...prev, [key]: file }));
    setThemePreview((prev) => ({ ...prev, [key]: meta.previewUrl }));
    setThemeMeta((prev) => ({ ...prev, [key]: meta }));
  };

  const handleThemeNameChange = (key, value) => {
    setThemeUpload((prev) => ({ ...prev, [key]: value }));
  };

  const saveThemeMain = async (themeNo) => {
    const nameKey = `themeName${themeNo}`;
    const imgKey = `themeImg${themeNo}`;

    try {
      setSavingKey(`theme-main-${themeNo}`);
      const form = new FormData();

      if (themeUpload[nameKey] !== undefined) form.append(nameKey, themeUpload[nameKey]);
      if (themeUpload[imgKey]) form.append(imgKey, themeUpload[imgKey]);

      await axios.post(`${BASE_URL}/api/admin/theme/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert(`Theme ${themeNo} saved successfully!`);
      setThemeUpload((prev) => ({ ...prev, [imgKey]: null }));
      await fetchAdminConfig();
    } catch (error) {
      console.error(error);
      alert(`Failed to save Theme ${themeNo}`);
    } finally {
      setSavingKey("");
    }
  };

  const saveThemeSubImage = async (fileKey) => {
    const nameKey = `${fileKey}Name`;

    if (!themeUpload[fileKey] && !themeUpload[nameKey]) {
      alert("Please select image or enter image name");
      return;
    }

    try {
      setSavingKey(fileKey);
      const form = new FormData();

      if (themeUpload[fileKey]) form.append(fileKey, themeUpload[fileKey]);
      if (themeUpload[nameKey] !== undefined) form.append(nameKey, themeUpload[nameKey]);

      await axios.post(`${BASE_URL}/api/admin/theme/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert(`${fileKey} saved successfully!`);
      setThemeUpload((prev) => ({ ...prev, [fileKey]: null }));
      await fetchAdminConfig();
    } catch (error) {
      console.error(error);
      alert(`Failed to save ${fileKey}`);
    } finally {
      setSavingKey("");
    }
  };

  const handleClientBrandImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const meta = await validateImageFile(file, "Brand Image", "brandImg");
    if (!meta) {
      e.target.value = "";
      return;
    }

    setClientBrandForm((prev) => ({ ...prev, brandImg: file }));
    setClientBrandPreview(meta.previewUrl);
    setClientBrandMeta(meta);
  };

  const handleClientBrandChange = (field, value) => {
    setClientBrandForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveClientChooseBrand = async () => {
    if (!clientBrandForm.brandName.trim()) return alert("Please enter brand name");
    if (!clientBrandForm.category) return alert("Please select category");
    if (!clientBrandForm.termsAndConditions.trim()) return alert("Please enter terms and conditions");
    if (!clientBrandForm.howToRedeem.trim()) return alert("Please enter how to redeem");
    if (!clientBrandForm.brandImg) return alert("Please select brand image");

    try {
      setBrandLoading(true);
      const form = new FormData();
      form.append("brandName", clientBrandForm.brandName);
      form.append("category", clientBrandForm.category);
      form.append("termsAndConditions", clientBrandForm.termsAndConditions);
      form.append("howToRedeem", clientBrandForm.howToRedeem);
      form.append("image", clientBrandForm.brandImg);

      await axios.post(`${BASE_URL}/api/client-choose-brand/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" }
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
      setClientBrandMeta(null);
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

  const scrollToSection = (sectionId) => {
    setMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="admin-container-truvish">
      <header className="truvish-header">
        <div className="header-shell">
          <div className="logo-container">
            <div className="brand-logo-wrap">
              <img src={truvishLogo} alt="Truvish logo" className="brand-logo-image" />
            </div>

            <div className="brand-copy">
              <span className="eyebrow-text">Trust • Insight • Partnership</span>
              <h1>TRUVISH</h1>
              <p>A Partner in Reward Marketing</p>
            </div>
          </div>

          <div className="header-actions">
          <button className="burger-menu" onClick={() => setMenuOpen(!menuOpen)}>
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      <div className={`menu-overlay ${menuOpen ? "active" : ""}`} onClick={() => setMenuOpen(false)}></div>

      <nav className={`mobile-nav-drawer ${menuOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <h3>TRUVISH</h3>
          <button className="close-drawer" onClick={() => setMenuOpen(false)}>✕</button>
        </div>

        <ul className="drawer-menu">
          {MENU_ITEMS.map((item) => (
            <li key={item.id} onClick={() => scrollToSection(item.section)}>
              <span className="menu-icon">{item.icon}</span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>

      <main className="truvish-main">
        <section className="hero-strip hero-strip-simple">
          <div className="hero-copy">
            <span className="hero-badge">Truvish Brand System</span>
            <h2>Admin Workspace TRUVISH</h2>
            <p>
                Manage company branding, upload banners and theme images, and organize client brand visuals in one responsive dashboard with clear image size and dimension guidance.
            </p>
          </div>

          <div className="hero-info-panel">
            <div className="info-card">
              <h3>Total Uploaded Brands</h3>
              <strong>{clientBrandList.length}</strong>
              <p>Live count from Client Choose Brand uploads.</p>
            </div>


          </div>
        </section>

        <div className="admin-card-truvish">
          <div className="page-heading">
            <div>
              <p className="page-kicker">Brand Management Workspace</p>
              <h1 className="page-title">Admin Configuration Panel</h1>
            </div>

          </div>

          <section id="admin-info-section" className="section-card">
            <div className="section-header">
              <h2 className="section-title">Admin Basic Info</h2>
              <span className="section-tag">Primary</span>
            </div>

            <div className="form-group">
              <label>Admin Name</label>
              <input
                type="text"
                value={adminConfig.adminName}
                onChange={(e) => setAdminConfig({ adminName: e.target.value })}
                placeholder="Enter admin name"
              />
            </div>

            <button className="btn-primary" onClick={saveAdminName}>
              Save Admin Name
            </button>
          </section>

          <section id="banners-section" className="section-card">
            <div className="section-header">
              <h2 className="section-title">Upload Banners</h2>
              <span className="section-tag">4 Banners</span>
            </div>

            <div className="banners-grid">
              {["banner1", "banner2", "banner3", "banner4"].map((key, i) => {
                const existingImage = existingConfig?.[key];
                const previewImage = bannerPreview[key];
                const imageToShow = previewImage || getImageUrl(existingImage);

                return (
                  <div className="banner-card" key={key}>
                    <label>Banner {i + 1}</label>
                    <p className="upload-note">{getRequirementText(key)}</p>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleBannerChange(e, key)}
                    />

                    {imageToShow ? (
                      <img
                        src={imageToShow}
                        alt={`banner-${i + 1}`}
                        className="preview-img banner-preview"
                      />
                    ) : (
                      <div className="empty-preview">No image selected</div>
                    )}

                    {renderImageMeta(bannerMeta[key])}

                    <button
                      className="btn-primary"
                      onClick={() => saveSingleBanner(key)}
                      disabled={savingKey === key}
                    >
                      {savingKey === key ? "Saving..." : `Save Banner ${i + 1}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <section id="theme-section" className="section-card">
            <div className="section-header">
              <h2 className="section-title">Theme Setup</h2>
              <span className="section-tag">Responsive Layout</span>
            </div>

            {[1, 2, 3, 4].map((t) => {
              const themeMainKey = `themeImg${t}`;
              const themeNameKey = `themeName${t}`;
              const mainPreview = themePreview[themeMainKey];
              const existingMain = existingConfig?.[themeMainKey];
              const mainImageToShow = mainPreview || getImageUrl(existingMain);

              return (
                <div className="theme-block" key={t}>
                  <div className="theme-block-head">
                    <h3 className="theme-title">Theme {t}</h3>
                    <span className="theme-pill">Visual Group {t}</span>
                  </div>

                  <div className="theme-top-row">
                    <div className="form-group">
                      <label>Theme Name {t}</label>
                      <input
                        type="text"
                        value={themeUpload[themeNameKey]}
                        onChange={(e) => handleThemeNameChange(themeNameKey, e.target.value)}
                        placeholder={`Enter theme ${t} name`}
                      />
                    </div>

                    <div className="form-group">
                      <label>Main Theme Image</label>
                      <p className="upload-note">{getRequirementText(themeMainKey)}</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleThemeImage(e, themeMainKey)}
                      />
                    </div>
                  </div>

                  {mainImageToShow ? (
                    <img
                      src={mainImageToShow}
                      alt={`theme-main-${t}`}
                      className="preview-img theme-main-preview"
                    />
                  ) : (
                    <div className="empty-preview">No theme image</div>
                  )}

                  {renderImageMeta(themeMeta[themeMainKey])}

                  <button
                    className="btn-primary theme-main-btn"
                    onClick={() => saveThemeMain(t)}
                    disabled={savingKey === `theme-main-${t}`}
                  >
                    {savingKey === `theme-main-${t}` ? "Saving..." : `Save Theme ${t}`}
                  </button>

                  <div className="theme-images-grid">
                    {THEME_IMAGE_MAP[t].map((key) => {
                      const nameKey = `${key}Name`;
                      const preview = themePreview[key];
                      const existingImage = existingConfig?.[key];
                      const imageToShow = preview || getImageUrl(existingImage);

                      return (
                        <div className="theme-image-card" key={key}>
                          <label>{key.toUpperCase()}</label>
                          <p className="upload-note">{getRequirementText(key)}</p>

                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleThemeImage(e, key)}
                          />

                          <input
                            type="text"
                            placeholder="Image Name"
                            value={themeUpload[nameKey]}
                            onChange={(e) => handleThemeNameChange(nameKey, e.target.value)}
                          />

                          {imageToShow ? (
                            <img
                              src={imageToShow}
                              alt={key}
                              className="preview-img small-preview"
                            />
                          ) : (
                            <div className="empty-preview small-empty">No image</div>
                          )}

                          {renderImageMeta(themeMeta[key])}

                          <button
                            className="btn-primary"
                            onClick={() => saveThemeSubImage(key)}
                            disabled={savingKey === key}
                          >
                            {savingKey === key ? "Saving..." : `Save ${key.toUpperCase()}`}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </section>

          <section id="brands-section" className="section-card">
            <div className="section-header">
              <h2 className="section-title">Client Choose Brand</h2>
              <span className="section-tag">{clientBrandList.length} Added</span>
            </div>

            <div className="brands-layout">
              <div className="brand-form-card">
                <h3 className="card-subtitle">Add New Brand</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Brand Name</label>
                    <input
                      type="text"
                      placeholder="Enter brand name"
                      value={clientBrandForm.brandName}
                      onChange={(e) => handleClientBrandChange("brandName", e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={clientBrandForm.category}
                      onChange={(e) => handleClientBrandChange("category", e.target.value)}
                      className="category-select"
                    >
                      <option value="">Select category</option>
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Terms and Conditions</label>
                  <textarea
                    rows="4"
                    placeholder="Enter terms and conditions"
                    value={clientBrandForm.termsAndConditions}
                    onChange={(e) => handleClientBrandChange("termsAndConditions", e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>How to Redeem</label>
                  <textarea
                    rows="4"
                    placeholder="Enter how to redeem"
                    value={clientBrandForm.howToRedeem}
                    onChange={(e) => handleClientBrandChange("howToRedeem", e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Brand Image</label>
                  <p className="upload-note">{getRequirementText("brandImg")}</p>
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
                    className="preview-img brand-preview"
                  />
                ) : (
                  <div className="empty-preview brand-empty">Brand image preview</div>
                )}

                {renderImageMeta(clientBrandMeta)}

                <button
                  className="btn-primary"
                  onClick={saveClientChooseBrand}
                  disabled={brandLoading}
                >
                  {brandLoading ? "Saving..." : "Add Client Brand"}
                </button>
              </div>

              <div className="brands-list-card">
                <h3 className="card-subtitle">Added Brands</h3>

                {clientBrandList.length === 0 ? (
                  <p className="empty-text">No brand added yet.</p>
                ) : (
                  <div className="brands-grid">
                    {clientBrandList.map((item) => (
                      <div className="brand-item" key={item.id}>
                        <img
                          src={getImageUrl(item.brandImg)}
                          alt={item.brandName}
                          className="brand-image"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />

                        <div className="brand-info">
                          <div className="brand-name-row">
                            <h4>{item.brandName}</h4>
                            <span className="category-badge">{item.category}</span>
                          </div>

                          <div className="brand-detail">
                            <strong>Terms:</strong>
                            <p>{item.termsAndConditions || "No terms added"}</p>
                          </div>

                          <div className="brand-detail">
                            <strong>How to Redeem:</strong>
                            <p>{item.howToRedeem || "No steps added"}</p>
                          </div>

                          <button
                            className="btn-delete"
                            onClick={() => deleteBrand(item.id, item.brandName)}
                            disabled={deleteLoadingId === item.id}
                          >
                            {deleteLoadingId === item.id ? "Deleting..." : "Delete"}
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
      </main>
    </div>
  );
};

export default AdminClientUI;
