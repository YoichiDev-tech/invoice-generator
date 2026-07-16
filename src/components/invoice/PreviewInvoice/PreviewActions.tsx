export default function PreviewActions() {
  return (
    <div className="mt-8 flex gap-3 justify-end">
      <button
        type="button"
        className="px-4 py-2 rounded-md bg-slate-200 text-slate-800 hover:bg-slate-300 text-xs font-medium"
      >
        Back to Edit
      </button>
      <button
        type="button"
        className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-xs font-medium"
      >
        Download PDF (soon)
      </button>
    </div>
  );
}