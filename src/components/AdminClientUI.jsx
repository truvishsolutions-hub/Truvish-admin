import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminClientUI = () => {

  /* ----------------------------------------------------
          ADMIN BASIC INFO
  ----------------------------------------------------- */

  const [adminConfig, setAdminConfig] = useState({
    adminName: ""
  });

  const saveAdminName = async () => {
    await axios.post("http://localhost:8080/api/admin/config", {
      adminName: adminConfig.adminName
    });

    alert("Admin Name Saved Successfully!");
  };


  /* ----------------------------------------------------
         ADMIN CONFIG (BANNERS + THEMES)
  ----------------------------------------------------- */

  const [banners, setBanners] = useState({
    banner1: null,
    banner2: null,
    banner3: null,
    banner4: null
  });

  const [themeUpload, setThemeUpload] = useState({
    themeName1: "",
    themeName2: "",
    themeName3: "",
    themeName4: "",
    themeName5: "",
    img1: null,
    img2: null,
    img3: null,
    img4: null,
    img5: null
  });

  const [themeImagesPreview, setThemeImagesPreview] = useState({});
  const [bannerPreview, setBannerPreview] = useState({});


  /* ---------------- BANNERS ---------------- */

  const handleBannerChange = (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);

    setBannerPreview(prev => ({ ...prev, [key]: localUrl }));
    setBanners(prev => ({ ...prev, [key]: file }));
  };

  const saveBanners = async () => {
    const form = new FormData();

    form.append("banner1", banners.banner1);
    form.append("banner2", banners.banner2);
    form.append("banner3", banners.banner3);
    form.append("banner4", banners.banner4);

    await axios.post("http://localhost:8080/api/admin/banner/upload", form, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    alert("Banners Saved Successfully!");
  };


  /* ---------------- THEMES ---------------- */

  const handleThemeImg = (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);

    setThemeImagesPreview(prev => ({ ...prev, [key]: localUrl }));
    setThemeUpload(prev => ({ ...prev, [key]: file }));
  };

  const saveTheme = async () => {
    const form = new FormData();

    form.append("themeName1", themeUpload.themeName1);
    form.append("themeName2", themeUpload.themeName2);
    form.append("themeName3", themeUpload.themeName3);
    form.append("themeName4", themeUpload.themeName4);
    form.append("themeName5", themeUpload.themeName5);

    form.append("img1", themeUpload.img1);
    form.append("img2", themeUpload.img2);
    form.append("img3", themeUpload.img3);
    form.append("img4", themeUpload.img4);
    form.append("img5", themeUpload.img5);

    await axios.post("http://localhost:8080/api/admin/theme/upload", form, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    alert("Theme Saved Successfully!");
  };


  /* ----------------------------------------------------
               CLIENT CONFIG
  ----------------------------------------------------- */

  const [client, setClient] = useState({
    truvishId: "",
    codeNumber: "",
    clientName: "",
    clientUrl: "",
    clientTheme: "",
    clientBrand: [],
    clientValue: ""
  });


  /* ----------------------------------------------------
       LOAD THEME NAME + IMAGE FROM BACKEND
  ----------------------------------------------------- */

  const [themeData, setThemeData] = useState({}); // theme name → image

  useEffect(() => {
    axios.get("http://localhost:8080/api/admin/config")
      .then(res => {
        const d = res.data;

        const themes = {
          [d.themeName1]: d.img1,
          [d.themeName2]: d.img2,
          [d.themeName3]: d.img3,
          [d.themeName4]: d.img4,
          [d.themeName5]: d.img5
        };

        const clean = Object.fromEntries(
          Object.entries(themes).filter(([n, i]) => n && n.trim() !== "")
        );

        setThemeData(clean);
      });
  }, []);


  /* Load latest code */
  useEffect(() => {
    axios.get("http://localhost:8080/api/truvish/latest-code")
      .then(res => {
        setClient(prev => ({
          ...prev,
          truvishId: res.data.truvishId,
          codeNumber: res.data.truvishIdCodeNumber
        }));
      });
  }, []);

  const handleBrandChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, opt => opt.value);
    setClient({ ...client, clientBrand: selected });
  };


  /* ----------------------------------------------------
      ⭐ FINAL UPDATED saveClient() → send clientThemeImg
  ----------------------------------------------------- */
  const saveClient = async () => {

    // ⭐ GET theme image path from themeData
    const selectedThemeImg = themeData[client.clientTheme];

    const res = await axios.post("http://localhost:8080/api/admin/client/update", {
      truvishId: client.truvishId,
      clientName: client.clientName,
      clientUrl: client.clientUrl,
      clientTheme: client.clientTheme,
      clientBrand: client.clientBrand,
      truvishCodeValue: client.clientValue,

      // ⭐ THIS IS THE ONLY FINAL UPDATE
      clientThemeImg: selectedThemeImg
    });

    setClient(prev => ({
      ...prev,
      codeNumber: res.data.truvishIdCodeNumber,
      truvishId: res.data.truvishId
    }));

    alert("Client Saved Successfully!");
  };


  return (
    <div className="admin-panel" style={{ padding: "20px" }}>

      <h1>Admin Configuration Panel</h1>
      <hr />


      {/* ------------ ADMIN NAME ---------------- */}
      <h2>Admin Basic Info</h2>

      <label>Admin Name</label>
      <input
        type="text"
        onChange={(e) => setAdminConfig({ adminName: e.target.value })}
      />

      <button onClick={saveAdminName}>Save Admin Name</button>

      <hr />


      {/* ------------ BANNERS ---------------- */}
      <h2>Upload Banners (4)</h2>

      {["banner1", "banner2", "banner3", "banner4"].map((key, i) => (
        <div key={i}>
          <label>Banner {i + 1}</label>
          <input type="file" onChange={(e) => handleBannerChange(e, key)} />
          {bannerPreview[key] && <img src={bannerPreview[key]} width="200" />}
        </div>
      ))}

      <button onClick={saveBanners}>Save Banners</button>

      <hr />


      {/* ------------ THEMES ---------------- */}
      <h2>Create 5 Themes</h2>

      {[1, 2, 3, 4, 5].map((n) => (
        <div key={n}>
          <label>Theme Name {n}</label>
          <input
            type="text"
            onChange={(e) =>
              setThemeUpload({ ...themeUpload, [`themeName${n}`]: e.target.value })
            }
          />

          <label>Theme Image {n}</label>
          <input type="file" onChange={(e) => handleThemeImg(e, `img${n}`)} />

          {themeImagesPreview[`img${n}`] && (
            <img src={themeImagesPreview[`img${n}`]} width="200" />
          )}
        </div>
      ))}

      <button onClick={saveTheme}>Save Theme</button>

      <hr />


      {/* ------------ CLIENT CONFIG ---------------- */}
      <h2>Client Configuration</h2>

      <label>Client Name</label>
      <input
        type="text"
        onChange={(e) => setClient({ ...client, clientName: e.target.value })}
      />

      <label>Client URL</label>
      <input
        type="text"
        onChange={(e) => setClient({ ...client, clientUrl: e.target.value })}
      />


      {/* ⭐ THEME DROPDOWN (DYNAMIC) */}
      <label>Select Client Theme</label>
      <select
        onChange={(e) => setClient({ ...client, clientTheme: e.target.value })}
      >
        <option value="">Select Theme</option>

        {Object.keys(themeData).map((theme, i) => (
          <option key={i} value={theme}>
            {theme}
          </option>
        ))}
      </select>


      {/* ⭐ SELECTED THEME IMAGE PREVIEW */}
      {client.clientTheme && (
        <div style={{ marginTop: "20px" }}>
          <h4>Selected Theme Preview:</h4>
          <img
            src={`http://localhost:8080${themeData[client.clientTheme]}`}
            width="250"
            style={{
              borderRadius: "10px",
              border: "3px solid #1A73E8",
              padding: "4px"
            }}
          />
        </div>
      )}


      <label>Select Brands</label>
      <select multiple onChange={handleBrandChange}>
        <option value="Amazon">Amazon</option>
        <option value="Flipkart">Flipkart</option>
        <option value="Swiggy">Swiggy</option>
        <option value="Myntra">Myntra</option>
        <option value="Zomato">Zomato</option>
      </select>

      <label>Client Value</label>
      <input
        type="number"
        onChange={(e) => setClient({ ...client, clientValue: e.target.value })}
      />

      <h3>Generated Code:</h3>
      <input type="text" value={client.codeNumber} readOnly />

      <button onClick={saveClient}>Save Client</button>

    </div>
  );
};

export default AdminClientUI;
