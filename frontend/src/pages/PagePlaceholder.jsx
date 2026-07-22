function PagePlaceholder({ title, description }) {
  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          {title}
        </h1>
        <p className="mt-2 text-slate-400">{description}</p>
      </header>

      <section className="rounded-xl border border-slate-700 bg-slate-800 p-8 shadow-lg">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-2xl text-cyan-300">◈</div>
        <h2 className="mt-5 text-xl font-semibold text-white">Yakında hazır olacak</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
          Bu alan için kontrol ve analiz araçları planlanıyor. Sayfa altyapısı kullanıma hazır.
        </p>
      </section>
    </div>
  );
}

export default PagePlaceholder;
