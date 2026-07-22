function StatCard({ title, value }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
      <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">
        {title}
      </h3>

      <div className="mt-4">
        <span className="text-4xl font-bold text-white">
          {value}
        </span>
      </div>
    </div>
  );
}

export default StatCard;