import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

function KpiCard({ label, value, color = 'bg-slate-800' }) {
  return (
    <div className={`rounded-xl border border-slate-700 p-4 ${color}`}>
      <p className="text-sm font-semibold text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const mapping = {
    Normal:
      'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',

    Kritik:
      'bg-red-500/10 text-red-300 border border-red-500/20',

    'Veri Yok':
      'bg-zinc-700 text-zinc-300 border border-zinc-600',
  };

  const cls =
    mapping[status] ||
    'bg-slate-700 text-slate-300 border border-slate-600';

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${cls}`}
    >
      {status}
    </span>
  );
}

function Sensors() {
  const navigate = useNavigate();

  const [sensors, setSensors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ------------------------------------------------------------
  // FILTERLER
  // ------------------------------------------------------------

  const [query, setQuery] = useState('');
  const [machineFilter, setMachineFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // ------------------------------------------------------------
  // CANLI SENSÖR VERİSİ
  // Backend her 2 saniyede bir yeni veri üretiyor.
  // Frontend de her 2 saniyede bir API'den güncel veriyi çekiyor.
  // ------------------------------------------------------------

  useEffect(() => {
    let isMounted = true;

    async function fetchSensors() {
      try {
        const response = await fetch(`${API_URL}/api/sensors`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(
            `Sensör verileri alınamadı. HTTP ${response.status}`
          );
        }

        const data = await response.json();

        if (!isMounted) return;

        setSensors(Array.isArray(data) ? data : []);
        setError(null);
        setLastUpdated(new Date());
        setIsLoading(false);
      } catch (fetchError) {
        console.error('Sensör verisi alınamadı:', fetchError);

        if (!isMounted) return;

        setError(
          'Sensör verileri alınamadı. Backend servisinin çalıştığından emin olun.'
        );

        setIsLoading(false);
      }
    }

    // İlk açılışta hemen veri al
    fetchSensors();

    // Sonrasında her 2 saniyede bir güncelle
    const interval = setInterval(() => {
      fetchSensors();
    }, 2000);

    // Sayfadan çıkınca interval'i temizle
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // ------------------------------------------------------------
  // MAKİNELER
  // ------------------------------------------------------------

  const machines = useMemo(() => {
    const map = {};

    sensors.forEach((sensor) => {
      if (sensor.machine_id && sensor.machine_name) {
        map[sensor.machine_id] = sensor.machine_name;
      }
    });

    return Object.entries(map).map(([id, name]) => ({
      id,
      name,
    }));
  }, [sensors]);

  // ------------------------------------------------------------
  // KPI
  // ------------------------------------------------------------

  const totals = useMemo(() => {
    const total = sensors.length;

    const offline = sensors.filter(
      (sensor) => sensor.status === 'Veri Yok'
    ).length;

    const critical = sensors.filter(
      (sensor) => sensor.status === 'Kritik'
    ).length;

    const active = total - offline;

    return {
      total,
      active,
      critical,
      offline,
    };
  }, [sensors]);

  // ------------------------------------------------------------
  // FİLTRELENMİŞ SENSÖRLER
  // ------------------------------------------------------------

  const filtered = useMemo(() => {
    return sensors.filter((sensor) => {
      // Makine filtresi
      if (
        machineFilter !== 'all' &&
        String(sensor.machine_id) !== String(machineFilter)
      ) {
        return false;
      }

      // Durum filtresi
      if (
        statusFilter !== 'all' &&
        sensor.status !== statusFilter
      ) {
        return false;
      }

      // Arama
      if (query) {
        const searchText = (
          `${sensor.name || ''} ${sensor.title || ''} ${
            sensor.machine_name || ''
          }`
        ).toLowerCase();

        if (!searchText.includes(query.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [
    sensors,
    query,
    machineFilter,
    statusFilter,
  ]);

  // ------------------------------------------------------------
  // SON GÜNCELLEME YAZISI
  // ------------------------------------------------------------

  const updatedText = lastUpdated
    ? lastUpdated.toLocaleTimeString('tr-TR')
    : '—';

  // ------------------------------------------------------------
  // SAYFA
  // ------------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* -------------------------------------------------- */}
        {/* HEADER */}
        {/* -------------------------------------------------- */}

        <header className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                Sensör Yönetimi
              </p>

              <h1 className="mt-2 text-2xl font-semibold text-white">
                Sensör envanteri — merkezi yönetim
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Sensör verilerini anlık olarak izleyin ve yönetin.
              </p>
            </div>

            {/* CANLI DURUM */}
            <div className="flex items-center gap-3">

              <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2">

                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>

                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
                </span>

                <span className="text-sm font-semibold text-emerald-300">
                  CANLI VERİ
                </span>

              </div>

            </div>

          </div>

          {/* SON GÜNCELLEME */}

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">

            <span>
              Son güncelleme:
            </span>

            <span className="font-semibold text-slate-300">
              {updatedText}
            </span>

            <span className="text-slate-600">
              •
            </span>

            <span>
              Otomatik yenileme: 2 saniye
            </span>

          </div>

        </header>

        {/* -------------------------------------------------- */}
        {/* KPI CARDS */}
        {/* -------------------------------------------------- */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <KpiCard
            label="Toplam Sensör"
            value={totals.total}
          />

          <KpiCard
            label="Aktif Sensör"
            value={totals.active}
            color="bg-slate-800"
          />

          <KpiCard
            label="Alarmdaki Sensör"
            value={totals.critical}
            color="bg-slate-800"
          />

          <KpiCard
            label="Çevrimdışı Sensör"
            value={totals.offline}
            color="bg-slate-800"
          />

        </section>

        {/* -------------------------------------------------- */}
        {/* FILTERS */}
        {/* -------------------------------------------------- */}

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

            <div className="flex flex-1 flex-col gap-3 md:flex-row">

              {/* ARAMA */}

              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 outline-none placeholder:text-slate-500 focus:border-cyan-500"
                placeholder="Sensör ara..."
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
              />

              {/* MAKİNE */}

              <select
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
                value={machineFilter}
                onChange={(event) =>
                  setMachineFilter(event.target.value)
                }
              >
                <option value="all">
                  Tüm Makineler
                </option>

                {machines.map((machine) => (
                  <option
                    key={machine.id}
                    value={machine.id}
                  >
                    {machine.name}
                  </option>
                ))}
              </select>

              {/* DURUM */}

              <select
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="all">
                  Tüm Durumlar
                </option>

                <option value="Normal">
                  Normal
                </option>

                <option value="Kritik">
                  Kritik
                </option>

                <option value="Veri Yok">
                  Veri Yok
                </option>
              </select>

            </div>

            {/* GÖSTERİLEN */}

            <div className="text-sm text-slate-400">

              Gösterilen:{' '}

              <span className="font-semibold text-white">
                {filtered.length}
              </span>

            </div>

          </div>

        </section>

        {/* -------------------------------------------------- */}
        {/* TABLE */}
        {/* -------------------------------------------------- */}

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">

          {isLoading ? (

            <div className="p-8 text-center text-slate-400">

              <div className="mb-3 flex justify-center">

                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400"></div>

              </div>

              Sensör verileri yükleniyor...

            </div>

          ) : error ? (

            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-8 text-center">

              <p className="text-red-400">
                {error}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Sistem tekrar bağlanmayı otomatik olarak deneyecek.
              </p>

            </div>

          ) : (

            <div>

              {/* ------------------------------------------------ */}
              {/* DESKTOP TABLE */}
              {/* ------------------------------------------------ */}

              <div className="hidden md:block">

                <div className="overflow-x-auto">

                  <table className="min-w-full table-auto">

                    <thead>

                      <tr className="border-b border-slate-800 text-left text-sm text-slate-400">

                        <th className="px-4 py-3">
                          Sensör Adı
                        </th>

                        <th className="px-4 py-3">
                          Bağlı Makine
                        </th>

                        <th className="px-4 py-3">
                          Son Değer
                        </th>

                        <th className="px-4 py-3">
                          Birim
                        </th>

                        <th className="px-4 py-3">
                          Durum
                        </th>

                        <th className="px-4 py-3">
                          Son Güncelleme
                        </th>

                        <th className="px-4 py-3">
                          İşlemler
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {filtered.map((sensor) => (

                        <tr
                          key={sensor.id}
                          className="border-t border-slate-800 transition-colors hover:bg-slate-900/60"
                        >

                          {/* SENSÖR */}

                          <td className="px-4 py-3">

                            <div className="flex items-center gap-3">

                              <span className="relative flex h-2.5 w-2.5">

                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-50"></span>

                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400"></span>

                              </span>

                              <span className="font-medium text-white">
                                {sensor.name}
                              </span>

                            </div>

                          </td>

                          {/* MAKİNE */}

                          <td className="px-4 py-3 text-slate-300">
                            {sensor.machine_name || '—'}
                          </td>

                          {/* DEĞER */}

                          <td className="px-4 py-3">

                            <span className="text-lg font-bold text-cyan-300">
                              {sensor.value ?? '—'}
                            </span>

                          </td>

                          {/* BİRİM */}

                          <td className="px-4 py-3 text-slate-300">
                            {sensor.unit || '—'}
                          </td>

                          {/* DURUM */}

                          <td className="px-4 py-3">

                            <StatusBadge
                              status={
                                sensor.status || 'Veri Yok'
                              }
                            />

                          </td>

                          {/* GÜNCELLEME */}

                          <td className="px-4 py-3 text-slate-300">

                            {sensor.value !== null &&
                            sensor.value !== undefined
                              ? 'Canlı'
                              : '—'}

                          </td>

                          {/* İŞLEM */}

                          <td className="px-4 py-3">

                            <button
                              onClick={() =>
                                navigate(
                                  `/sensors/${sensor.id}`
                                )
                              }
                              className="rounded-md bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
                            >
                              👁 Görüntüle
                            </button>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              </div>

              {/* ------------------------------------------------ */}
              {/* MOBILE */}
              {/* ------------------------------------------------ */}

              <div className="space-y-3 md:hidden">

                {filtered.map((sensor) => (

                  <div
                    key={sensor.id}
                    className="rounded-lg border border-slate-700 bg-slate-800 p-4"
                  >

                    <div className="flex items-center justify-between">

                      <div>

                        <div className="flex items-center gap-2">

                          <span className="h-2.5 w-2.5 rounded-full bg-cyan-400"></span>

                          <p className="font-semibold text-white">
                            {sensor.name}
                          </p>

                        </div>

                        <p className="mt-1 text-sm text-slate-400">
                          {sensor.machine_name || '—'}
                        </p>

                      </div>

                      <div className="space-y-1 text-right">

                        <div className="text-lg font-bold text-cyan-300">

                          {sensor.value ?? '—'}

                          <span className="ml-1 text-sm font-normal text-slate-400">
                            {sensor.unit}
                          </span>

                        </div>

                        <StatusBadge
                          status={
                            sensor.status || 'Veri Yok'
                          }
                        />

                      </div>

                    </div>

                    <div className="mt-3 flex justify-end">

                      <button
                        onClick={() =>
                          navigate(
                            `/sensors/${sensor.id}`
                          )
                        }
                        className="rounded-md bg-slate-700 px-3 py-1 text-sm font-semibold text-slate-200 transition hover:bg-slate-600"
                      >
                        👁 Görüntüle
                      </button>

                    </div>

                  </div>

                ))}

              </div>

              {/* VERİ YOK */}

              {filtered.length === 0 && (

                <div className="p-8 text-center text-slate-500">
                  Filtrelere uygun sensör bulunamadı.
                </div>

              )}

            </div>

          )}

        </section>

      </div>
    </div>
  );
}

export default Sensors;