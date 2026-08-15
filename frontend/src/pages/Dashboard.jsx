import React, { useState } from "react";

const API_BASE_URL = "http://localhost:8000";

const defectNames = {
  crazing: "Çatlaklaşma",
  inclusion: "Kalıntı / İçerme",
  patches: "Yama Kusuru",
  pitted_surface: "Çukurlaşmış Yüzey",
  "rolled-in-scale": "Hadde Tufalı",
  rolled_in_scale: "Hadde Tufalı",
  scratches: "Çizik",
};

const defectColors = {
  crazing: "#ef4444",
  inclusion: "#f59e0b",
  patches: "#a855f7",
  pitted_surface: "#06b6d4",
  "rolled-in-scale": "#84cc16",
  rolled_in_scale: "#84cc16",
  scratches: "#3b82f6",
};

export default function Dashboard() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (file) => {
    if (!file) return;

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError("");
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert("Önce bir çelik yüzey görüntüsü seçin.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API hatası: ${response.status}`);
      }

      const data = await response.json();

      console.log("YOLO API SONUCU:", data);

      setResult(data);

      // FastAPI'nin oluşturduğu sonuç görüntüsünü göster
      if (data.image_url) {
        const imageUrl = data.image_url.startsWith("http")
          ? data.image_url
          : `${API_BASE_URL}${data.image_url}`;

        setPreview(`${imageUrl}?t=${Date.now()}`);
      }
    } catch (err) {
      console.error("Analiz hatası:", err);
      setError(
        "Analiz sırasında hata oluştu. FastAPI servisinin çalıştığından emin olun."
      );
    } finally {
      setLoading(false);
    }
  };

  const totalDefects = Number(result?.total_defects ?? 0);

  const confidence =
    result?.average_confidence !== undefined &&
    result?.average_confidence !== null
      ? Number(result.average_confidence)
      : 0;

  const getStatus = () => {
    if (loading) return "ANALİZ EDİLİYOR";

    if (!result) return "ANALİZ BEKLİYOR";

    if (result.status_text) {
      return result.status_text.toUpperCase();
    }

    if (totalDefects > 0) {
      return "KUSUR TESPİT EDİLDİ";
    }

    return "NORMAL";
  };

  const getStatusColor = () => {
    const status = getStatus();

    if (status === "NORMAL") return "#22c55e";
    if (status === "ANALİZ BEKLİYOR") return "#94a3b8";
    if (status === "ANALİZ EDİLİYOR") return "#38bdf8";

    return "#f59e0b";
  };

  const getMainDefect = () => {
    if (!result) return "-";

    if (result.defect_type) {
      return defectNames[result.defect_type] || result.defect_type;
    }

    if (result.defects && result.defects.length > 0) {
      const firstDefect = result.defects[0];

      const type =
        firstDefect.class_name ||
        firstDefect.class ||
        firstDefect.name ||
        firstDefect.defect_type;

      if (type) {
        return defectNames[type] || type;
      }
    }

    if (totalDefects > 0) {
      return `${totalDefects} kusur`;
    }

    return "Kusur yok";
  };

  const getDistribution = () => {
    if (!result?.defect_distribution) {
      return [];
    }

    return Object.entries(result.defect_distribution).map(
      ([name, value]) => ({
        name,
        value: Number(value) || 0,
      })
    );
  };

  const distribution = getDistribution();
  const totalDistribution = distribution.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#08111f",
        color: "#ffffff",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: "30px" }}>
        <div
          style={{
            color: "#38bdf8",
            fontSize: "14px",
            fontWeight: "bold",
            marginBottom: "8px",
          }}
        >
          SMART FACTORY / AI QUALITY CONTROL
        </div>

        <h1 style={{ fontSize: "34px", margin: 0 }}>
          AI Vision Inspection Dashboard
        </h1>

        <p
          style={{
            color: "#94a3b8",
            fontSize: "16px",
          }}
        >
          Çelik yüzey kalite kontrol ve yapay zekâ destekli kusur tespit sistemi
        </p>
      </div>

      {/* STAT CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "18px",
          marginBottom: "25px",
        }}
      >
        <StatCard
          title="Toplam Analiz"
          value={result ? "1" : "0"}
        />

        <StatCard
          title="Normal"
          value={result && totalDefects === 0 ? "1" : "0"}
          color="#22c55e"
        />

        <StatCard
          title="Kusurlu"
          value={result && totalDefects > 0 ? "1" : "0"}
          color="#f59e0b"
        />

        <StatCard
          title="Tespit Edilen Kusur"
          value={result ? totalDefects : "0"}
          color="#ef4444"
        />
      </div>

      {/* MAIN AREA */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "22px",
          marginBottom: "25px",
        }}
      >
        {/* IMAGE */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Çelik Yüzey Analizi</h2>

          <div
            style={{
              border: "2px dashed #334155",
              borderRadius: "12px",
              minHeight: "380px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#0b1628",
              overflow: "hidden",
            }}
          >
            {preview ? (
              <img
                src={preview}
                alt="Çelik yüzey analizi"
                style={{
                  maxWidth: "100%",
                  maxHeight: "380px",
                  objectFit: "contain",
                }}
              />
            ) : (
              <div
                style={{
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                <div
                  style={{
                    fontSize: "48px",
                    marginBottom: "10px",
                  }}
                >
                  📷
                </div>

                <div>Çelik yüzey fotoğrafını yükleyin</div>
              </div>
            )}
          </div>

          {/* BUTTONS */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "18px",
            }}
          >
            <label
              style={{
                background: "#1d4ed8",
                padding: "12px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              📁 Görüntü Seç

              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </label>

            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || loading}
              style={{
                border: "none",
                borderRadius: "8px",
                padding: "12px 22px",
                background:
                  !selectedFile || loading ? "#334155" : "#16a34a",
                color: "white",
                fontWeight: "bold",
                cursor:
                  !selectedFile || loading
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {loading
                ? "⏳ Analiz Ediliyor..."
                : "🤖 AI ile Analiz Et"}
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div
              style={{
                marginTop: "15px",
                padding: "12px",
                borderRadius: "8px",
                background: "#450a0a",
                border: "1px solid #991b1b",
                color: "#fca5a5",
              }}
            >
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* RESULT */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Son Analiz Sonucu</h2>

          <div
            style={{
              background: "#111c2e",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "15px",
            }}
          >
            <div
              style={{
                color: "#94a3b8",
                fontSize: "13px",
              }}
            >
              DURUM
            </div>

            <div
              style={{
                color: getStatusColor(),
                fontSize: "22px",
                fontWeight: "bold",
                marginTop: "5px",
              }}
            >
              {getStatus()}
            </div>
          </div>

          <InfoRow
            label="Tespit Edilen Kusur"
            value={getMainDefect()}
          />

          <InfoRow
            label="Kusur Sayısı"
            value={result ? totalDefects : "-"}
          />

          <InfoRow
            label="Güven Oranı"
            value={
              result
                ? `%${Math.round(confidence)}`
                : "-"
            }
          />

          <InfoRow
            label="Model"
            value={result?.model || "YOLOv8 Steel Defect"}
          />

          <InfoRow
            label="Dataset"
            value="NEU-DET"
          />

          <InfoRow
            label="Sınıf Sayısı"
            value="6"
          />

          <InfoRow
            label="Inference"
            value="CPU"
          />

          <InfoRow
            label="Durum"
            value="● AKTİF"
          />
        </div>
      </div>

      {/* LOWER AREA */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: "22px",
        }}
      >
        {/* DEFECT DISTRIBUTION */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Kusur Dağılımı</h2>
           
           
          {distribution.length > 0 ? (
            distribution.map((item) => (
              <DefectBar
                key={item.name}
                name={defectNames[item.name] || item.name}
                value={
                  totalDistribution > 0
                    ? Math.round((item.value / totalDistribution) * 100)
                    : 0
                }
                color={defectColors[item.name] || "#2563eb"}
              />
            ))
          ) : (
            <>
              <DefectBar
                name="Çatlaklaşma"
                value={0}
              />
              <DefectBar
                name="Kalıntı / İçerme"
                value={0}
              />
              <DefectBar
                name="Yama Kusuru"
                value={0}
              />
              <DefectBar
                name="Çukurlaşmış Yüzey"
                value={0}
              />
              <DefectBar
                name="Hadde Tufalı"
                value={0}
              />
              <DefectBar
                name="Çizik"
                value={0}
              />
            </>
          )}
        </div>

        {/* MODEL */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>AI Model Durumu</h2>

          <ModelRow
            label="Model"
            value={result?.model || "YOLOv8"}
          />

          <ModelRow
            label="Dataset"
            value="NEU-DET"
          />

          <ModelRow
            label="Kusur Sınıfı"
            value="6"
          />

          <ModelRow
            label="Inference"
            value="CPU"
          />

          <ModelRow
            label="Kusur Sayısı"
            value={result ? totalDefects : "-"}
          />

          <div
            style={{
              marginTop: "20px",
              padding: "14px",
              borderRadius: "8px",
              background: "#052e16",
              color: "#4ade80",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            ● MODEL AKTİF
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   STAT CARD
========================= */

function StatCard({
  title,
  value,
  color = "#38bdf8",
}) {
  return (
    <div style={cardStyle}>
      <div
        style={{
          color: "#94a3b8",
          fontSize: "14px",
          marginBottom: "10px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "30px",
          fontWeight: "bold",
          color,
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* =========================
   INFO ROW
========================= */

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        padding: "15px 0",
        borderBottom: "1px solid #1e293b",
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: "12px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#e2e8f0",
          fontWeight: "bold",
          marginTop: "4px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* =========================
   DEFECT BAR
========================= */

function DefectBar({
  name,
  value,
  color = "#2563eb",
}) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "6px",
          fontSize: "14px",
        }}
      >
        <span>{name}</span>

        <span style={{ color: "#94a3b8" }}>
          {value}%
        </span>
      </div>

      <div
        style={{
          height: "8px",
          background: "#1e293b",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.min(value, 100)}%`,
            height: "100%",
            background: color,
            borderRadius: "10px",
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

/* =========================
   MODEL ROW
========================= */

function ModelRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: "1px solid #1e293b",
      }}
    >
      <span style={{ color: "#94a3b8" }}>
        {label}
      </span>

      <strong>{value}</strong>
    </div>
  );
}

/* =========================
   GLOBAL STYLES
========================= */

const cardStyle = {
  background: "#0f1b2d",
  border: "1px solid #1e293b",
  borderRadius: "14px",
  padding: "22px",
};

const sectionTitle = {
  fontSize: "18px",
  marginTop: 0,
  marginBottom: "18px",
};