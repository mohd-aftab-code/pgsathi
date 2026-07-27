"use client";

import { useState, useEffect } from "react";
import { Settings, Bell, Clock, Shield, Wrench, Save, CheckCircle2, Loader2, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";

type SettingsData = {
  trialDays: number;
  announcementEnabled: boolean;
  announcementText: string;
  maintenanceMode: boolean;
  defaultTrialPlanSlug: string;
};

const DEFAULTS: SettingsData = {
  trialDays: 14,
  announcementEnabled: false,
  announcementText: "",
  maintenanceMode: false,
  defaultTrialPlanSlug: "starter",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const d = await res.json();
      if (d.success) setSettings(d.data);
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const d = await res.json();
      if (d.success) {
        toast.success("Settings saved!");
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(d.message || "Failed to save");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }

  const set = <K extends keyof SettingsData>(key: K, val: SettingsData[K]) =>
    setSettings((prev) => ({ ...prev, [key]: val }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-neutral-400">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm font-medium">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-neutral-900">Global Settings</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Platform configuration for PGSathi admin.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="p-2 bg-white border border-neutral-200 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
          >
            <RefreshCcw size={15} />
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Trial Duration */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-100">
          <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl">
            <Clock size={17} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Free Trial Duration</h2>
            <p className="text-xs text-neutral-500">Naye owners ko kitne din ka free trial milega</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs font-semibold text-neutral-600 mb-2 block">Trial Days</label>
            <input
              type="number"
              min={1}
              max={90}
              value={settings.trialDays}
              onChange={(e) => set("trialDays", parseInt(e.target.value) || 14)}
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-neutral-600 mb-2 block">Default Plan Slug</label>
            <input
              type="text"
              value={settings.defaultTrialPlanSlug}
              onChange={(e) => set("defaultTrialPlanSlug", e.target.value)}
              placeholder="starter"
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
        </div>
        <p className="text-[11px] text-neutral-400 mt-2">
          Currently: <strong className="text-neutral-600">{settings.trialDays} days</strong> free trial on <strong className="text-neutral-600">{settings.defaultTrialPlanSlug}</strong> plan
        </p>
      </div>

      {/* Announcement Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-100">
          <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl">
            <Bell size={17} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-neutral-900">Platform Announcement Banner</h2>
            <p className="text-xs text-neutral-500">Site-wide message — sabko dikhega dashboard par</p>
          </div>
          {/* Toggle */}
          <button
            onClick={() => set("announcementEnabled", !settings.announcementEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              settings.announcementEnabled ? "bg-amber-500" : "bg-neutral-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                settings.announcementEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className={settings.announcementEnabled ? "" : "opacity-50 pointer-events-none"}>
          <label className="text-xs font-semibold text-neutral-600 mb-2 block">Announcement Message</label>
          <textarea
            value={settings.announcementText}
            onChange={(e) => set("announcementText", e.target.value)}
            placeholder="e.g. PGSathi 2.0 launch ho gaya! Nayi features explore karein."
            rows={3}
            className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
          />
          {settings.announcementEnabled && settings.announcementText && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 font-medium">
              📢 Preview: {settings.announcementText}
            </div>
          )}
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className={`bg-white rounded-2xl border p-5 shadow-sm transition-colors ${settings.maintenanceMode ? "border-red-200 bg-red-50/30" : "border-neutral-200/80"}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${settings.maintenanceMode ? "bg-red-50 border-red-100" : "bg-neutral-50 border-neutral-100"}`}>
            <Wrench size={17} className={settings.maintenanceMode ? "text-red-600" : "text-neutral-500"} />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-neutral-900">Maintenance Mode</h2>
            <p className="text-xs text-neutral-500">Sabhi regular users ko maintenance page dikhegi. Admins still access kar sakte hain.</p>
          </div>
          <button
            onClick={() => set("maintenanceMode", !settings.maintenanceMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              settings.maintenanceMode ? "bg-red-500" : "bg-neutral-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                settings.maintenanceMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        {settings.maintenanceMode && (
          <div className="mt-4 bg-red-100 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-800 font-semibold flex items-center gap-2">
            <Shield size={14} className="shrink-0" />
            ⚠️ Warning: Maintenance mode ON karne se platform users access nahi kar payenge!
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors shadow-md"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saving ? "Saving..." : saved ? "Settings Saved!" : "Save All Settings"}
        </button>
      </div>

    </div>
  );
}
