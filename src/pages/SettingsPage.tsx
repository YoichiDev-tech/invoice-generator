import React from "react";

const SettingsPage: React.FC = () => {
  return (
    <div className="px-4 py-6 flex justify-center">
      <div className="w-full max-w-[480px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/70 dark:shadow-black/40 p-6 space-y-6">

        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Settings
        </h1>

        <p className="text-xs text-slate-600 dark:text-slate-400">
          Manage your invoice generator preferences.
        </p>

        {/* Theme */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Theme
          </label>

          <select className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm">
            <option>System Default</option>
            <option>Light</option>
            <option>Dark</option>
          </select>
        </div>

        {/* Business Name */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Business Name
          </label>

          <input
            className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
            placeholder="Your business name"
          />
        </div>

        {/* Default Notes */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Default Invoice Notes
          </label>

          <textarea
            rows={4}
            className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
            placeholder="Default payment terms or thank-you message"
          />
        </div>

        {/* Save Button */}
        <button className="w-full text-xs px-4 py-2 rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900">
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;