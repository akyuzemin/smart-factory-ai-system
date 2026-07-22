import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import formatDate from '../utils/formatDate';

function Machines() {
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchMachines() {
      try {
        const response = await fetch('http://localhost:5000/api/machines');

        if (!response.ok) {
          throw new Error('Makine verileri alınamadı.');
        }

        const data = await response.json();

        if (isMounted) {
          setMachines(data);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchMachines();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Makineler
          </h1>
          <p className="mt-2 text-slate-400">Fabrika makinelerini, durumlarını ve bakım bilgilerini yönetin.</p>
        </div>

        <button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-950/40 transition-all hover:bg-cyan-400 hover:shadow-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900">
          <PlusIcon />
          Yeni Makine
        </button>
      </header>

      <section className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-5">
          <div>
            <h2 className="font-semibold text-white">Makine Listesi</h2>
            <p className="mt-1 text-sm text-slate-400">Toplam {isLoading ? '...' : machines.length} makine görüntüleniyor.</p>
          </div>
          <span className="hidden rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-400 sm:inline-flex">
            Canlı durum takibi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Makine Adı</th>
                <th className="px-6 py-4 font-semibold">Makine Kodu</th>
                <th className="px-6 py-4 font-semibold">Bölüm</th>
                <th className="px-6 py-4 font-semibold">Durum</th>
                <th className="px-6 py-4 font-semibold">Son Bakım Tarihi</th>
                <th className="px-6 py-4 text-right font-semibold">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/80">
              {isLoading && <TableMessage message="Makine verileri yükleniyor..." />}
              {error && <TableMessage message={error} tone="error" />}
              {!isLoading && !error && machines.length === 0 && <TableMessage message="Gösterilecek makine bulunamadı." />}
              {!isLoading && !error && machines.map((machine) => (
                <tr key={machine.id} className="transition-colors hover:bg-slate-700/30">
                  <td className="px-6 py-4 font-medium text-slate-100">{machine.name}</td>
                  <td className="px-6 py-4"><span className="rounded bg-slate-900 px-2 py-1 font-mono text-xs text-cyan-300">{machine.code || '—'}</span></td>
                  <td className="px-6 py-4 text-slate-300">{machine.department || '—'}</td>
                  <td className="px-6 py-4"><StatusBadge status={machine.status} /></td>
                  <td className="px-6 py-4 text-slate-400">{formatDate(machine.last_maintenance)}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <ActionButton label="Görüntüle" variant="view" onClick={() => navigate(`/machines/${machine.id}`)}><ViewIcon /></ActionButton>
                      <ActionButton label="Düzenle" variant="edit"><EditIcon /></ActionButton>
                      <ActionButton label="Sil" variant="delete"><DeleteIcon /></ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function TableMessage({ message, tone = 'default' }) {
  return (
    <tr>
      <td colSpan="6" className={`px-6 py-12 text-center ${tone === 'error' ? 'text-red-400' : 'text-slate-400'}`}>
        {message}
      </td>
    </tr>
  );
}

function ActionButton({ label, variant, children, onClick }) {
  const variantStyles = {
    view: 'text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-500/15 hover:text-cyan-300',
    edit: 'text-amber-400 hover:border-amber-500/40 hover:bg-amber-500/15 hover:text-amber-300',
    delete: 'text-red-400 hover:border-red-500/40 hover:bg-red-500/15 hover:text-red-300',
  };

  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className={`rounded-lg border border-transparent p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 ${variantStyles[variant]}`}>
      {children}
    </button>
  );
}

function PlusIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14m-7-7h14" /></svg>;
}

function ViewIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></svg>;
}

function EditIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m4 16.5-.8 3.3 3.3-.8L18 7.5 15.5 5 4 16.5Z" /><path d="m14.5 6 2.5 2.5" /></svg>;
}

function DeleteIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 7h16m-10 4v6m4-6v6M9 7l1-3h4l1 3m-9 0 1 13h10l1-13" /></svg>;
}

export default Machines;
