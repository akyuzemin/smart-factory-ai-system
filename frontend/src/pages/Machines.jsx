import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";

const API_BACKEND_URL = "http://localhost:5000";

const statusColors = {
  ÇALIŞIYOR:
    "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  BAKIMDA:
    "bg-amber-500/20 text-amber-400 border-amber-500/30",
  ARIZALI:
    "bg-red-500/20 text-red-400 border-red-500/30",
  BEKLEMEDE:
    "bg-slate-600 text-slate-300 border-slate-700",
};

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function normalizeStatus(value) {
  return value
    ? String(value).trim().toUpperCase()
    : "BEKLEMEDE";
}

function StatCard({
  title,
  value,
  color = "#38bdf8",
}) {
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

function TableMessage({
  message,
  tone = "default",
}) {
  return (
    <tr>
      <td
        colSpan="7"
        style={{
          padding: "48px",
          textAlign: "center",
          color:
            tone === "error"
              ? "#f87171"
              : "#94a3b8",
        }}
      >
        {message}
      </td>
    </tr>
  );
}

function ActionButton({
  label,
  variant,
  children,
  onClick,
  disabled = false,
}) {
  const styles = {
    view:
      "text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-500/15",

    edit:
      "text-amber-400 hover:border-amber-500/40 hover:bg-amber-500/15",

    delete:
      "text-red-400 hover:border-red-500/40 hover:bg-red-500/15",
  };

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-lg
        border
        border-transparent
        p-2
        transition-colors
        focus:outline-none
        focus:ring-2
        focus:ring-cyan-400
        ${styles[variant]}
        ${disabled ? "cursor-not-allowed opacity-40" : ""}
      `}
    >
      {children}
    </button>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
    >
      <path d="M12 5v14m-7-7h14" />
    </svg>
  );
}

function ViewIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="m4 16.5-.8 3.3 3.3-.8L18 7.5 15.5 5 4 16.5Z" />
      <path d="m14.5 6 2.5 2.5" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 7l1-3h4l1 3" />
      <path d="m6 7 1 13h10l1-13" />
    </svg>
  );
}

export default function Machines() {
  const navigate = useNavigate();

  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  /*
   * ============================================================
   * MAKİNELERİ BACKEND'DEN ÇEK
   * ============================================================
   */

  const fetchMachines = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setLoading(true);
      }

      setError("");

      try {
        const response = await fetch(
          `${API_BACKEND_URL}/api/machines`
        );

        if (!response.ok) {
          throw new Error(
            `Sunucu yanıtı: ${response.status}`
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error(
            "Backend makine listesi döndürmedi."
          );
        }

        setMachines(data);
        setLastUpdated(new Date());
      } catch (err) {
        console.error(
          "Makine verileri çekilirken hata:",
          err
        );

        setError(
          "Makineler yüklenemedi. Backend servisinin çalıştığından emin olun."
        );
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    []
  );

  /*
   * ============================================================
   * İLK YÜKLEME
   * ============================================================
   */

  useEffect(() => {
    fetchMachines(true);
  }, [fetchMachines]);

  /*
   * ============================================================
   * CANLI VERİ AKIŞI
   *
   * Her 5 saniyede backend'den tekrar veri çekiyoruz.
   * Böylece veritabanındaki değişiklikler sayfaya otomatik gelir.
   * ============================================================
   */

  useEffect(() => {
    const interval = setInterval(() => {
      fetchMachines(false);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchMachines]);

  /*
   * ============================================================
   * MAKİNE SİL
   * ============================================================
   */

  const handleDelete = async (machine) => {
    const confirmed = window.confirm(
      `"${machine.name}" makinesini silmek istediğinize emin misiniz?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(machine.id);

      const response = await fetch(
        `${API_BACKEND_URL}/api/machines/${machine.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Makine silinemedi. Sunucu: ${response.status}`
        );
      }

      /*
       * Backend'den tekrar çekmek yerine
       * mevcut listeyi anında güncelliyoruz.
       */
      setMachines((currentMachines) =>
        currentMachines.filter(
          (item) => item.id !== machine.id
        )
      );

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Makine silme hatası:", err);

      window.alert(
        err.message || "Makine silinemedi."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /*
   * ============================================================
   * VERİLERİ NORMALLEŞTİR
   * ============================================================
   */

  const normalizedMachines = useMemo(() => {
    return machines.map((machine) => ({
      ...machine,

      name:
        machine.name ||
        "İsimsiz Makine",

      code:
        machine.code ||
        "—",

      department:
        machine.department ||
        machine.location ||
        "—",

      status:
        normalizeStatus(machine.status),

      efficiency:
        machine.efficiency != null
          ? Number(machine.efficiency)
          : null,
    }));
  }, [machines]);

  /*
   * ============================================================
   * ARAMA + FİLTRE
   * ============================================================
   */

  const filteredMachines = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    return normalizedMachines.filter(
      (machine) => {
        if (
          statusFilter !== "all" &&
          machine.status !== statusFilter
        ) {
          return false;
        }

        if (!search) {
          return true;
        }

        return (
          String(machine.name)
            .toLowerCase()
            .includes(search) ||

          String(machine.code)
            .toLowerCase()
            .includes(search) ||

          String(machine.department)
            .toLowerCase()
            .includes(search)
        );
      }
    );
  }, [
    normalizedMachines,
    searchTerm,
    statusFilter,
  ]);

  /*
   * ============================================================
   * İSTATİSTİKLER
   * ============================================================
   */

  const stats = useMemo(
    () => ({
      total: normalizedMachines.length,

      running:
        normalizedMachines.filter(
          (machine) =>
            machine.status === "ÇALIŞIYOR"
        ).length,

      maintenance:
        normalizedMachines.filter(
          (machine) =>
            machine.status === "BAKIMDA"
        ).length,

      error:
        normalizedMachines.filter(
          (machine) =>
            machine.status === "ARIZALI"
        ).length,
    }),
    [normalizedMachines]
  );

  /*
   * ============================================================
   * VERİMLİLİK RENKLERİ
   * ============================================================
   */

  const efficiencyClass = (value) => {
    if (!Number.isFinite(value)) {
      return "text-slate-400";
    }

    if (value >= 90) {
      return "text-emerald-400";
    }

    if (value >= 70) {
      return "text-amber-400";
    }

    return "text-red-400";
  };

  /*
   * ============================================================
   * SON GÜNCELLEME METNİ
   * ============================================================
   */

  const updatedText = lastUpdated
    ? lastUpdated.toLocaleTimeString(
        "tr-TR"
      )
    : "—";

  /*
   * ============================================================
   * ARAYÜZ
   * ============================================================
   */

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#08111f",
        color: "#fff",
        padding: "30px",
        fontFamily:
          "Arial, sans-serif",
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
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

          <h1
            style={{
              fontSize: "34px",
              margin: 0,
            }}
          >
            Makine Yönetim Paneli
          </h1>

          <p
            style={{
              color: "#94a3b8",
              fontSize: "16px",
              marginTop: "8px",
            }}
          >
            Fabrikadaki makinelerin
            durumunu ve verimliliğini
            anlık olarak izleyin.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/machines/new")
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          <PlusIcon />

          Yeni Makine
        </button>
      </header>

      {/* ======================================================
          İSTATİSTİKLER
      ====================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Toplam Makine"
          value={
            loading
              ? "..."
              : stats.total
          }
        />

        <StatCard
          title="Çalışıyor"
          value={
            loading
              ? "..."
              : stats.running
          }
          color="#22c55e"
        />

        <StatCard
          title="Bakımda"
          value={
            loading
              ? "..."
              : stats.maintenance
          }
          color="#f59e0b"
        />

        <StatCard
          title="Arızalı"
          value={
            loading
              ? "..."
              : stats.error
          }
          color="#ef4444"
        />
      </div>

      {/* ======================================================
          MAKİNE LİSTESİ
      ====================================================== */}

      <section
        style={{
          background: "#0f1b2d",
          border:
            "1px solid #1e293b",
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            padding:
              "20px 22px",
            borderBottom:
              "1px solid #1e293b",
          }}
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 700,
                }}
              >
                Makine Listesi
              </h2>

              <p
                style={{
                  margin:
                    "6px 0 0",
                  color: "#94a3b8",
                  fontSize: "14px",
                }}
              >
                Toplam{" "}
                {loading
                  ? "..."
                  : filteredMachines.length}{" "}
                makine
                görüntüleniyor.
              </p>
            </div>

            {/* CANLI DURUM */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span
                style={{
                  border:
                    "1px solid #334155",
                  background:
                    "#08111f",
                  color:
                    "#94a3b8",
                  borderRadius:
                    "999px",
                  padding:
                    "6px 12px",
                  fontSize:
                    "12px",
                }}
              >
                🟢 Canlı durum takibi
              </span>

              <span
                style={{
                  color: "#64748b",
                  fontSize: "11px",
                }}
              >
                Son güncelleme:{" "}
                {updatedText}
              </span>
            </div>
          </div>

          {/* ARAMA + FİLTRE */}

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Makine adı, kodu veya bölümü ile ara..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              style={{
                flex:
                  "1 1 320px",
                maxWidth: "500px",
                background:
                  "#08111f",
                border:
                  "1px solid #334155",
                borderRadius: "8px",
                padding:
                  "10px 14px",
                color: "#fff",
              }}
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              style={{
                background:
                  "#08111f",
                border:
                  "1px solid #334155",
                borderRadius: "8px",
                padding:
                  "10px 14px",
                color: "#fff",
              }}
            >
              <option value="all">
                Tüm Durumlar
              </option>

              <option value="ÇALIŞIYOR">
                Çalışıyor
              </option>

              <option value="BAKIMDA">
                Bakımda
              </option>

              <option value="ARIZALI">
                Arızalı
              </option>

              <option value="BEKLEMEDE">
                Beklemede
              </option>
            </select>

            <button
              type="button"
              onClick={() =>
                fetchMachines(true)
              }
              disabled={loading}
              style={{
                background:
                  "transparent",
                border:
                  "1px solid #334155",
                color: "#94a3b8",
                padding:
                  "10px 16px",
                borderRadius: "8px",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                fontWeight: "bold",
              }}
            >
              {loading
                ? "⟳ Yenileniyor..."
                : "↻ Yenile"}
            </button>
          </div>
        </div>

        {/* ====================================================
            TABLO
        ==================================================== */}

        <div
          style={{
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: "950px",
              borderCollapse:
                "collapse",
            }}
          >
            <thead
              style={{
                background:
                  "#1e293b",
                color:
                  "#94a3b8",
                fontSize: "12px",
                textTransform:
                  "uppercase",
              }}
            >
              <tr>
                {[
                  "Makine Adı",
                  "Makine Kodu",
                  "Bölüm",
                  "Durum",
                  "Verimlilik",
                  "Son Bakım",
                  "İşlemler",
                ].map((header) => (
                  <th
                    key={header}
                    style={{
                      padding:
                        "16px 22px",
                      textAlign:
                        header ===
                        "İşlemler"
                          ? "right"
                          : "left",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* LOADING */}

              {loading && (
                <TableMessage
                  message="Makine verileri yükleniyor..."
                />
              )}

              {/* ERROR */}

              {!loading &&
                error && (
                  <TableMessage
                    message={`⚠️ ${error}`}
                    tone="error"
                  />
                )}

              {/* EMPTY */}

              {!loading &&
                !error &&
                filteredMachines.length ===
                  0 && (
                  <TableMessage
                    message="Filtre kriterlerine uygun makine bulunamadı."
                  />
                )}

              {/* DATA */}

              {!loading &&
                !error &&
                filteredMachines.map(
                  (machine) => (
                    <tr
                      key={machine.id}
                      className="hover:bg-slate-800/70"
                      style={{
                        borderTop:
                          "1px solid #1e293b",
                      }}
                    >
                      {/* MAKİNE */}

                      <td
                        style={{
                          padding:
                            "16px 22px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/machines/${machine.id}`
                            )
                          }
                          className="text-left"
                        >
                          <div
                            style={{
                              fontWeight:
                                "bold",
                              color:
                                "#fff",
                            }}
                          >
                            {machine.name}
                          </div>
                        </button>
                      </td>

                      {/* KOD */}

                      <td
                        style={{
                          padding:
                            "16px 22px",
                        }}
                      >
                        <span
                          style={{
                            borderRadius:
                              "6px",
                            background:
                              "#08111f",
                            padding:
                              "5px 8px",
                            fontFamily:
                              "monospace",
                            fontSize:
                              "12px",
                            color:
                              "#67e8f9",
                          }}
                        >
                          {machine.code}
                        </span>
                      </td>

                      {/* BÖLÜM */}

                      <td
                        style={{
                          padding:
                            "16px 22px",
                          color:
                            "#cbd5e1",
                        }}
                      >
                        {machine.department}
                      </td>

                      {/* DURUM */}

                      <td
                        style={{
                          padding:
                            "16px 22px",
                        }}
                      >
                        <span
                          className={`
                            px-3
                            py-1
                            text-xs
                            font-semibold
                            rounded-full
                            border
                            ${
                              statusColors[
                                machine.status
                              ] ||
                              statusColors.BEKLEMEDE
                            }
                          `}
                        >
                          {machine.status}
                        </span>
                      </td>

                      {/* VERİMLİLİK */}

                      <td
                        style={{
                          padding:
                            "16px 22px",
                          fontWeight:
                            "bold",
                        }}
                        className={efficiencyClass(
                          machine.efficiency
                        )}
                      >
                        {Number.isFinite(
                          machine.efficiency
                        )
                          ? `${Math.round(
                              machine.efficiency
                            )}%`
                          : "—"}
                      </td>

                      {/* SON BAKIM */}

                      <td
                        style={{
                          padding:
                            "16px 22px",
                          color:
                            "#94a3b8",
                        }}
                      >
                        {formatDate(
                          machine.last_maintenance
                        )}
                      </td>

                      {/* İŞLEMLER */}

                      <td
                        style={{
                          padding:
                            "16px 22px",
                        }}
                      >
                        <div className="flex justify-end gap-2">
                          {/* GÖRÜNTÜLE */}

                          <ActionButton
                            label="Görüntüle"
                            variant="view"
                            onClick={() =>
                              navigate(
                                `/machines/${machine.id}`
                              )
                            }
                          >
                            <ViewIcon />
                          </ActionButton>

                          {/* DÜZENLE */}

                          <ActionButton
                            label="Düzenle"
                            variant="edit"
                            onClick={() =>
                              navigate(
                                `/machines/${machine.id}/edit`
                              )
                            }
                          >
                            <EditIcon />
                          </ActionButton>

                          {/* SİL */}

                          <ActionButton
                            label={
                              deletingId ===
                              machine.id
                                ? "Siliniyor..."
                                : "Sil"
                            }
                            variant="delete"
                            disabled={
                              deletingId ===
                              machine.id
                            }
                            onClick={() =>
                              handleDelete(
                                machine
                              )
                            }
                          >
                            <DeleteIcon />
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  )
                )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ======================================================
          BİLGİ
      ====================================================== */}

      <div
        style={{
          marginTop: "16px",
          color: "#64748b",
          fontSize: "12px",
        }}
      >
        Veriler backend API üzerinden
        otomatik olarak 5 saniyede bir
        güncellenmektedir.
      </div>

      <style>
        {`
          tr {
            transition: background-color 0.2s ease;
          }

          tr:hover {
            background-color: #172235;
          }

          input::placeholder {
            color: #64748b;
          }

          select option {
            background: #0f1b2d;
            color: white;
          }
        `}
      </style>
    </div>
  );
}