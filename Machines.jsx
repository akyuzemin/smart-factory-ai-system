import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const API_BACKEND_URL = "http://localhost:5000";

const statusColors = {
  ÇALIŞIYOR: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  BAKIMDA: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  ARIZALI: "bg-red-500/20 text-red-400 border-red-500/30",
  BEKLEMEDE: "bg-slate-600 text-slate-300 border-slate-700",
};

const efficiencyColors = (value) => {
  if (value >= 90) return "text-emerald-400";
  if (value >= 70) return "text-amber-400";
  return "text-red-400";
};

function StatCard({ title, value, color = "#38bdf8" }) {
  return (
    <div
      style={{
        background: "#0f1b2d",
        border: "1px solid #1e293b",
        borderRadius: "14px",
        padding: "22px",
      }}
    >
      <div
        style={{
          color: "#94a3b8",
          fontSize: "14px",
          marginBottom: "10px",
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: "30px", fontWeight: "bold", color }}>{value}</div>
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
}

export default function Machines() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const fetchMachines = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BACKEND_URL}/api/machines`);
      if (!response.ok) {
        throw new Error(
          `Veri alınamadı. Sunucu yanıtı: ${response.status}`
        );
      }
      const data = await response.json();
      setMachines(data);
    } catch (err) {
      console.error("Makine verileri çekilirken hata:", err);
      setError(
        "Makineler yüklenemedi. Backend servisinin çalıştığından ve erişilebilir olduğundan emin olun."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const filteredMachines = useMemo(() => {
    return machines
      .filter((machine) => {
        if (statusFilter !== "all" && machine.status !== statusFilter) {
          return false;
        }
        if (
          searchTerm &&
          !machine.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !machine.code.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return false;
        }
        return true;
      });
  }, [machines, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: machines.length,
      running: machines.filter((m) => m.status === "ÇALIŞIYOR").length,
      maintenance: machines.filter((m) => m.status === "BAKIMDA").length,
      error: machines.filter((m) => m.status === "ARIZALI").length,
    };
  }, [machines]);

  const handleRowClick = (id) => {
    navigate(`/machines/${id}`);
  };

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
          SMART FACTORY / MACHINE MANAGEMENT
        </div>
        <h1 style={{ fontSize: "34px", margin: 0 }}>Makine Yönetim Paneli</h1>
        <p style={{ color: "#94a3b8", fontSize: "16px" }}>
          Fabrikadaki makinelerin durumunu ve verimliliğini anlık olarak izleyin.
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
        <StatCard title="Toplam Makine" value={loading ? "..." : stats.total} />
        <StatCard
          title="Çalışıyor"
          value={loading ? "..." : stats.running}
          color="#22c55e"
        />
        <StatCard
          title="Bakımda"
          value={loading ? "..." : stats.maintenance}
          color="#f59e0b"
        />
        <StatCard
          title="Arızalı"
          value={loading ? "..." : stats.error}
          color="#ef4444"
        />
      </div>

      {/* FILTERS & ACTIONS */}
      <div
        style={{
          background: "#0f1b2d",
          border: "1px solid #1e293b",
          borderRadius: "14px",
          padding: "16px 22px",
          marginBottom: "25px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", gap: "12px", flexGrow: 1 }}>
          <input
            type="text"
            placeholder="Makine adı veya kodu ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: "#08111f",
              border: "1px solid #334155",
              borderRadius: "8px",
              padding: "10px 14px",
              color: "white",
              flexGrow: 1,
              maxWidth: "400px",
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              background: "#08111f",
              border: "1px solid #334155",
              borderRadius: "8px",
              padding: "10px 14px",
              color: "white",
            }}
          >
            <option value="all">Tüm Durumlar</option>
            <option value="ÇALIŞIYOR">Çalışıyor</option>
            <option value="BAKIMDA">Bakımda</option>
            <option value="ARIZALI">Arızalı</option>
            <option value="BEKLEMEDE">Beklemede</option>
          </select>
        </div>
        <button
          onClick={fetchMachines}
          disabled={loading}
          style={{
            background: "transparent",
            border: "1px solid #334155",
            color: "#94a3b8",
            padding: "10px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span className={loading ? "animate-spin" : ""}>🔄</span>
          Yenile
        </button>
      </div>

      {/* MACHINE LIST */}
      <div
        style={{
          background: "#0f1b2d",
          border: "1px solid #1e293b",
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead
              style={{
                background: "#1e293b",
                color: "#94a3b8",
                fontSize: "12px",
                textTransform: "uppercase",
              }}
            >
              <tr>
                <th style={{ padding: "16px 22px", textAlign: "left" }}>
                  Makine Adı / Kodu
                </th>
                <th style={{ padding: "16px 22px", textAlign: "left" }}>
                  Durum
                </th>
                <th style={{ padding: "16px 22px", textAlign: "left" }}>
                  Üretim Hattı
                </th>
                <th style={{ padding: "16px 22px", textAlign: "center" }}>
                  Verimlilik
                </th>
                <th style={{ padding: "16px 22px", textAlign: "left" }}>
                  Son Bakım
                </th>
                <th style={{ padding: "16px 22px", textAlign: "left" }}>
                  Sonraki Bakım
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="6" style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>
                    Veriler yükleniyor...
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan="6" style={{ padding: "48px", textAlign: "center", color: "#fca5a5" }}>
                    ⚠️ {error}
                  </td>
                </tr>
              )}
              {!loading && !error && filteredMachines.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>
                    Filtre kriterlerine uygun makine bulunamadı.
                  </td>
                </tr>
              )}
              {!loading && !error &&
                filteredMachines.map((machine) => (
                  <tr
                    key={machine.id}
                    onClick={() => handleRowClick(machine.id)}
                    style={{
                      borderTop: "1px solid #1e293b",
                      cursor: "pointer",
                    }}
                    className="hover-row"
                  >
                    <td style={{ padding: "16px 22px" }}>
                      <div style={{ fontWeight: "bold", color: "white" }}>
                        {machine.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        {machine.code}
                      </div>
                    </td>
                    <td style={{ padding: "16px 22px" }}>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                          statusColors[machine.status] || statusColors.BEKLEMEDE
                        }`}
                      >
                        {machine.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px 22px", color: "#cbd5e1" }}>
                      {machine.department}
                    </td>
                    <td
                      style={{
                        padding: "16px 22px",
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: "16px",
                      }}
                      className={efficiencyColors(machine.efficiency)}
                    >
                      {machine.efficiency}%
                    </td>
                    <td style={{ padding: "16px 22px", color: "#94a3b8" }}>
                      {formatDate(machine.last_maintenance)}
                    </td>
                    <td style={{ padding: "16px 22px", color: "#94a3b8" }}>
                      {formatDate(machine.next_maintenance)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        .hover-row:hover {
          background-color: #1e293b;
        }
      `}</style>
    </div>
  );
}