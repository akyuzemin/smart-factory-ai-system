import { useEffect, useState } from 'react';

const DEFAULT_SETTINGS = {
  factoryName: 'Smart Factory',
  factoryLocation: 'Düzce, Türkiye',
  refreshInterval: '2',
  language: 'Türkçe',
  notifications: true,
  criticalAlerts: true,
  maintenanceAlerts: true,
  aiQualityControl: true,
  autoRefresh: true,
  soundAlerts: false,
};

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative h-6 w-11 rounded-full transition ${
        enabled ? 'bg-cyan-500' : 'bg-slate-700'
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
          enabled ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  );
}

function SettingRow({
  title,
  description,
  enabled,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-800 py-5 last:border-b-0">
      <div>
        <p className="font-semibold text-white">
          {title}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <Toggle
        enabled={enabled}
        onChange={onChange}
      />
    </div>
  );
}

function Settings() {
  const [settings, setSettings] =
    useState(DEFAULT_SETTINGS);

  const [saved, setSaved] = useState(false);

  const [lastSaved, setLastSaved] =
    useState(null);

  /*
   * Kayıtlı ayarları yükle
   */
  useEffect(() => {
    try {
      const savedSettings =
        localStorage.getItem(
          'smart-factory-settings'
        );

      if (savedSettings) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...JSON.parse(savedSettings),
        });
      }
    } catch (error) {
      console.error(
        'Ayarlar yüklenemedi:',
        error
      );
    }
  }, []);

  /*
   * Ayar değiştir
   */
  function updateSetting(key, value) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
  }

  /*
   * Kaydet
   */
  function saveSettings() {
    localStorage.setItem(
      'smart-factory-settings',
      JSON.stringify(settings)
    );

    setLastSaved(
      new Date().toLocaleTimeString('tr-TR')
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  }

  /*
   * Varsayılanlara dön
   */
  function resetSettings() {
    setSettings(DEFAULT_SETTINGS);

    localStorage.setItem(
      'smart-factory-settings',
      JSON.stringify(DEFAULT_SETTINGS)
    );

    setLastSaved(
      new Date().toLocaleTimeString('tr-TR')
    );

    setSaved(true);
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">

      <div className="mx-auto max-w-6xl space-y-6">

        {/* HEADER */}
        <header className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                SMART FACTORY / SETTINGS
              </p>

              <h1 className="mt-2 text-3xl font-bold text-white">
                Sistem Ayarları
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Fabrika sistemi, bildirimler ve AI
                kalite kontrol tercihlerini yönetin.
              </p>

            </div>

            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">

              <div className="flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                <span className="text-sm font-semibold text-emerald-400">
                  SİSTEM AKTİF
                </span>

              </div>

              <p className="mt-1 text-xs text-slate-500">
                Ayarlar yerel olarak saklanıyor
              </p>

            </div>

          </div>

        </header>

        {/* SUCCESS MESSAGE */}
        {saved && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4">

            <div className="flex items-center gap-3">

              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                ✓
              </span>

              <div>

                <p className="font-semibold text-emerald-300">
                  Ayarlar başarıyla kaydedildi
                </p>

                <p className="text-xs text-emerald-400/60">
                  Değişiklikler sisteme uygulandı.
                </p>

              </div>

            </div>

            {lastSaved && (
              <span className="text-xs text-slate-500">
                {lastSaved}
              </span>
            )}

          </div>
        )}

        {/* FACTORY SETTINGS */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">

          <div className="mb-6">

            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
              Fabrika
            </p>

            <h2 className="mt-1 text-xl font-bold text-white">
              Fabrika Bilgileri
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Sistem üzerinde görüntülenecek fabrika bilgilerini düzenleyin.
            </p>

          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Fabrika Adı
              </label>

              <input
                type="text"
                value={settings.factoryName}
                onChange={(e) =>
                  updateSetting(
                    'factoryName',
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
                placeholder="Fabrika adı"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Fabrika Lokasyonu
              </label>

              <input
                type="text"
                value={settings.factoryLocation}
                onChange={(e) =>
                  updateSetting(
                    'factoryLocation',
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
                placeholder="Şehir / ülke"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Dil
              </label>

              <select
                value={settings.language}
                onChange={(e) =>
                  updateSetting(
                    'language',
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
              >

                <option>Türkçe</option>
                <option>English</option>

              </select>

            </div>

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Veri Yenileme Sıklığı
              </label>

              <select
                value={settings.refreshInterval}
                onChange={(e) =>
                  updateSetting(
                    'refreshInterval',
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
              >

                <option value="1">
                  1 saniye
                </option>

                <option value="2">
                  2 saniye
                </option>

                <option value="5">
                  5 saniye
                </option>

                <option value="10">
                  10 saniye
                </option>

              </select>

            </div>

          </div>

        </section>

        {/* NOTIFICATIONS */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">

          <div className="mb-2">

            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
              Bildirimler
            </p>

            <h2 className="mt-1 text-xl font-bold text-white">
              Bildirim Ayarları
            </h2>

          </div>

          <SettingRow
            title="Bildirimleri Aktif Et"
            description="Sistem olayları ve önemli durumlar için bildirim alın."
            enabled={settings.notifications}
            onChange={(value) =>
              updateSetting(
                'notifications',
                value
              )
            }
          />

          <SettingRow
            title="Kritik Alarm Bildirimleri"
            description="Kritik makine ve sensör durumlarında anında uyarı göster."
            enabled={settings.criticalAlerts}
            onChange={(value) =>
              updateSetting(
                'criticalAlerts',
                value
              )
            }
          />

          <SettingRow
            title="Bakım Bildirimleri"
            description="Planlanan ve yaklaşan bakım işlemleri hakkında bilgi ver."
            enabled={settings.maintenanceAlerts}
            onChange={(value) =>
              updateSetting(
                'maintenanceAlerts',
                value
              )
            }
          />

          <SettingRow
            title="Sesli Alarm"
            description="Kritik durumlarda sesli uyarı kullan."
            enabled={settings.soundAlerts}
            onChange={(value) =>
              updateSetting(
                'soundAlerts',
                value
              )
            }
          />

        </section>

        {/* AI SETTINGS */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">

          <div className="mb-2">

            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
              Yapay Zekâ
            </p>

            <h2 className="mt-1 text-xl font-bold text-white">
              AI Sistem Ayarları
            </h2>

          </div>

          <SettingRow
            title="AI Kalite Kontrol"
            description="Yapay zekâ destekli kalite ve anomali analizlerini aktif et."
            enabled={settings.aiQualityControl}
            onChange={(value) =>
              updateSetting(
                'aiQualityControl',
                value
              )
            }
          />

          <SettingRow
            title="Otomatik Veri Yenileme"
            description="Dashboard ve operasyon ekranlarındaki verileri otomatik yenile."
            enabled={settings.autoRefresh}
            onChange={(value) =>
              updateSetting(
                'autoRefresh',
                value
              )
            }
          />

        </section>

        {/* SYSTEM STATUS */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">

          <div className="mb-6">

            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
              Sistem
            </p>

            <h2 className="mt-1 text-xl font-bold text-white">
              Sistem Durumu
            </h2>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">

              <div className="flex items-center gap-2">

                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />

                <span className="text-sm font-semibold text-white">
                  Backend
                </span>

              </div>

              <p className="mt-2 text-xs text-emerald-400">
                Çalışıyor
              </p>

            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">

              <div className="flex items-center gap-2">

                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />

                <span className="text-sm font-semibold text-white">
                  AI Servisi
                </span>

              </div>

              <p className="mt-2 text-xs text-emerald-400">
                Aktif
              </p>

            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">

              <div className="flex items-center gap-2">

                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />

                <span className="text-sm font-semibold text-white">
                  Sensörler
                </span>

              </div>

              <p className="mt-2 text-xs text-emerald-400">
                Veri akışı aktif
              </p>

            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">

              <div className="flex items-center gap-2">

                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />

                <span className="text-sm font-semibold text-white">
                  AI Modeli
                </span>

              </div>

              <p className="mt-2 text-xs text-emerald-400">
                Hazır
              </p>

            </div>

          </div>

        </section>

        {/* ACTIONS */}
        <section className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={resetSettings}
            className="rounded-lg border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-700"
          >
            ↩ Varsayılanlara Dön
          </button>

          <button
            type="button"
            onClick={saveSettings}
            className="rounded-lg bg-cyan-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            ✓ Ayarları Kaydet
          </button>

        </section>

      </div>

    </div>
  );
}

export default Settings;