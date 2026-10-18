"use client";

import { useState, useEffect } from "react";
import {
  Settings, Bell, Clock, Shield, Wrench, Save, CheckCircle2, Loader2,
  RefreshCcw, Globe, Search, ExternalLink, Copy, Check, Send, AlertTriangle
} from "lucide-react";
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

  // Google Indexing states
  const [indexingStatus, setIndexingStatus] = useState<any>(null);
  const [indexingLoading, setIndexingLoading] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [singleIndexing, setSingleIndexing] = useState(false);
  const [batchIndexing, setBatchIndexing] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [settingsRes, indexingRes] = await Promise.all([
        fetch("/api/admin/settings").then((r) => r.json()).catch(() => ({ success: false })),
        fetch("/api/admin/index-urls").then((r) => r.json()).catch(() => null),
      ]);

      if (settingsRes.success) setSettings(settingsRes.data);
      if (indexingRes?.success) setIndexingStatus(indexingRes);
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

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

  async function handleIndexSingle() {
    if (!customUrl.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }
    setSingleIndexing(true);
    try {
      const res = await fetch("/api/admin/index-urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: customUrl.trim(), type: "URL_UPDATED" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Google notified successfully for this URL!");
        setCustomUrl("");
      } else {
        toast.error(data.error || "Failed to index URL");
      }
    } catch {
      toast.error("Failed to connect to indexing service");
    } finally {
      setSingleIndexing(false);
    }
  }

  async function handleIndexAll() {
    if (!confirm("Are you sure you want to index all active pages and listings on Google?")) return;
    setBatchIndexing(true);
    try {
      const res = await fetch("/api/admin/index-urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "index_all" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `Indexed ${data.succeeded} URLs successfully!`);
      } else {
        toast.error(data.error || "Indexing failed");
      }
    } catch {
      toast.error("Error running batch indexing");
    } finally {
      setBatchIndexing(false);
    }
  }

  async function handlePingSitemap() {
    try {
      toast.loading("Pinging search engines...", { id: "ping" });
      const res = await fetch("/api/admin/index-urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ping_sitemap" }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success("Google & Bing sitemap pings sent!", { id: "ping" });
      } else {
        toast.error("Failed to ping sitemap", { id: "ping" });
      }
    } catch {
      toast.error("Error pinging search engines", { id: "ping" });
    }
  }

  function copyServiceEmail() {
    if (!indexingStatus?.serviceAccountEmail) return;
    navigator.clipboard.writeText(indexingStatus.serviceAccountEmail);
    setCopiedEmail(true);
    toast.success("Service Account Email copied!");
    setTimeout(() => setCopiedEmail(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-neutral-400">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm font-medium">Loading settings...</span>
      </div>
    );
  }

  const isConfigured = indexingStatus?.status?.configured;
  const serviceEmail = indexingStatus?.serviceAccountEmail;

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">Global Settings</h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">Platform configuration & automated search indexing.</p>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={load}
            className="h-8 w-8 flex items-center justify-center bg-white/60 backdrop-blur-md border border-neutral-200/60 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-white/80 transition-colors shadow-sm"
          >
            <RefreshCcw size={14} />
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="h-8 px-4 flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-colors shadow-sm"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : saved ? <CheckCircle2 size={12} /> : <Save size={12} />}
            {saving ? "Saving..." : saved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      {/* Google Search Console & Indexing Automation Section */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100/60">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-2xl border ${isConfigured ? "bg-emerald-50/80 border-emerald-100 text-emerald-600" : "bg-amber-50/80 border-amber-100 text-amber-600"}`}>
              <Globe size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[12px] font-black uppercase tracking-wide text-neutral-900 leading-none">
                  Google Search Console & Indexing Automation
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide uppercase ${
                  isConfigured ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {isConfigured ? "● Active & Connected" : "● Setup Required"}
                </span>
              </div>
              <p className="text-[10px] font-medium text-neutral-500 mt-0.5">
                Automatic real-time URL push to Google whenever PGs, cities, or blogs are created/updated.
              </p>
            </div>
          </div>
          <a
            href="https://search.google.com/search-console?resource_id=https://pgsathi.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-violet-600 hover:text-violet-800 bg-violet-50 px-2.5 py-1.5 rounded-xl border border-violet-100 transition-colors"
          >
            Open Console <ExternalLink size={11} />
          </a>
        </div>

        {/* Credentials / Service Account Status */}
        {isConfigured && serviceEmail ? (
          <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-3 text-xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 block">
                  Service Account Email (Added in Search Console)
                </span>
                <code className="text-[11px] font-mono text-emerald-950 font-bold break-all">
                  {serviceEmail}
                </code>
              </div>
              <button
                onClick={copyServiceEmail}
                className="self-start sm:self-auto flex items-center gap-1 px-2.5 py-1 bg-white border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-lg hover:bg-emerald-50 shadow-xs"
              >
                {copiedEmail ? <Check size={12} /> : <Copy size={12} />}
                {copiedEmail ? "Copied" : "Copy Email"}
              </button>
            </div>
            <p className="text-[10px] text-emerald-700">
              ✓ Verified listings are automatically submitted to Google in the background upon admin approval.
            </p>
          </div>
        ) : (
          <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3.5 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold text-amber-900">
                  Google Service Account Key Not Detected
                </p>
                <p className="text-[10px] text-amber-700 mt-0.5 leading-relaxed">
                  Google Indexing API automate karne ke liye Google Cloud se <strong>service-account.json</strong> key download karein aur project ke root folder mein paste karein, ya <code>GOOGLE_CLIENT_EMAIL</code> aur <code>GOOGLE_PRIVATE_KEY</code> ko <code>.env</code> mein set karein.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick URL Indexer & Batch Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Action 1: Batch Index Everything */}
          <div className="border border-neutral-200/70 rounded-xl p-3 bg-neutral-50/50 space-y-2 flex flex-col justify-between">
            <div>
              <h3 className="text-[11px] font-black uppercase text-neutral-800 tracking-wide">
                Bulk Index All Pages
              </h3>
              <p className="text-[10px] text-neutral-500 mt-0.5">
                Pushes all active listings, city pages, and blogs to Google Indexing API in batches.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <button
                onClick={handleIndexAll}
                disabled={batchIndexing}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-neutral-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-xs disabled:opacity-50"
              >
                {batchIndexing ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                {batchIndexing ? "Indexing..." : "Index All Site Pages"}
              </button>
              <button
                onClick={handlePingSitemap}
                title="Ping sitemap to Google & Bing"
                className="h-9 px-3 border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 text-[10px] font-bold uppercase rounded-xl transition-colors shadow-xs"
              >
                Ping Sitemap
              </button>
            </div>
          </div>

          {/* Action 2: Single URL Quick Push */}
          <div className="border border-neutral-200/70 rounded-xl p-3 bg-neutral-50/50 space-y-2 flex flex-col justify-between">
            <div>
              <h3 className="text-[11px] font-black uppercase text-neutral-800 tracking-wide">
                Instant Single URL Push
              </h3>
              <p className="text-[10px] text-neutral-500 mt-0.5">
                Send instant re-crawl request for a specific page.
              </p>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://pgsathi.in/pg/kota/..."
                className="flex-1 px-2.5 h-8 bg-white border border-neutral-200 rounded-xl text-[11px] focus:outline-none focus:ring-1 focus:ring-violet-400 font-mono"
              />
              <button
                onClick={handleIndexSingle}
                disabled={singleIndexing}
                className="h-8 px-3 bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1"
              >
                {singleIndexing ? <Loader2 size={12} className="animate-spin" /> : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trial Duration */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-neutral-100/60">
          <div className="p-2 bg-blue-50/80 border border-blue-100/60 rounded-2xl">
            <Clock size={14} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-[12px] font-black uppercase tracking-wide text-neutral-900 leading-none">Free Trial Duration</h2>
            <p className="text-[10px] font-medium text-neutral-500 mt-0.5">Naye owners ko kitne din ka free trial milega</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-500 mb-1.5 block">Trial Days</label>
            <input
              type="number"
              min={1}
              max={90}
              value={settings.trialDays}
              onChange={(e) => set("trialDays", parseInt(e.target.value) || 14)}
              className="w-full px-3 h-8 bg-white/60 backdrop-blur-md border border-neutral-200/60 rounded-2xl text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-violet-400 focus:border-violet-400 shadow-sm transition-all"
            />
          </div>
          <div className="flex-1">
            <label className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-500 mb-1.5 block">Default Plan Slug</label>
            <input
              type="text"
              value={settings.defaultTrialPlanSlug}
              onChange={(e) => set("defaultTrialPlanSlug", e.target.value)}
              placeholder="starter"
              className="w-full px-3 h-8 bg-white/60 backdrop-blur-md border border-neutral-200/60 rounded-2xl text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-violet-400 focus:border-violet-400 shadow-sm transition-all"
            />
          </div>
        </div>
        <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 mt-2.5">
          Currently: <strong className="text-neutral-700">{settings.trialDays} days</strong> free trial on <strong className="text-neutral-700">{settings.defaultTrialPlanSlug}</strong> plan
        </p>
      </div>

      {/* Announcement Banner */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-neutral-100/60">
          <div className="p-2 bg-amber-50/80 border border-amber-100/60 rounded-2xl">
            <Bell size={14} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-[12px] font-black uppercase tracking-wide text-neutral-900 leading-none">Platform Announcement</h2>
            <p className="text-[10px] font-medium text-neutral-500 mt-0.5">Site-wide message — sabko dikhega</p>
          </div>
          {/* Toggle */}
          <button
            onClick={() => set("announcementEnabled", !settings.announcementEnabled)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
              settings.announcementEnabled ? "bg-amber-500" : "bg-neutral-300"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white/60 backdrop-blur-md shadow-sm transition-transform ${
                settings.announcementEnabled ? "translate-x-4.5" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className={settings.announcementEnabled ? "" : "opacity-50 pointer-events-none"}>
          <label className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-500 mb-1.5 block">Message</label>
          <textarea
            value={settings.announcementText}
            onChange={(e) => set("announcementText", e.target.value)}
            placeholder="e.g. PGSathi 2.0 launch ho gaya!"
            rows={2}
            className="w-full px-3 py-2.5 bg-white/60 backdrop-blur-md border border-neutral-200/60 rounded-2xl text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-violet-400 focus:border-violet-400 resize-none shadow-sm transition-all"
          />
          {settings.announcementEnabled && settings.announcementText && (
            <div className="mt-2.5 bg-amber-50 border border-amber-200/60 rounded-2xl px-3 py-2 text-[10px] text-amber-800 font-bold uppercase tracking-wider">
              📢 Preview: <span className="font-medium normal-case">{settings.announcementText}</span>
            </div>
          )}
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className={`backdrop-blur-md rounded-2xl border p-4 sm:p-5 shadow-sm transition-colors ${settings.maintenanceMode ? "border-red-200/60 bg-red-50/50" : "border-neutral-200/60 bg-white/60"}`}>
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-2xl border ${settings.maintenanceMode ? "bg-red-100/50 border-red-200/60" : "bg-neutral-50/80 border-neutral-200/60"}`}>
            <Wrench size={14} className={settings.maintenanceMode ? "text-red-600" : "text-neutral-500"} />
          </div>
          <div className="flex-1">
            <h2 className="text-[12px] font-black uppercase tracking-wide text-neutral-900 leading-none">Maintenance Mode</h2>
            <p className="text-[10px] font-medium text-neutral-500 mt-0.5">Sabhi regular users ko maintenance page dikhegi.</p>
          </div>
          <button
            onClick={() => set("maintenanceMode", !settings.maintenanceMode)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
              settings.maintenanceMode ? "bg-red-500" : "bg-neutral-300"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white/60 backdrop-blur-md shadow-sm transition-transform ${
                settings.maintenanceMode ? "translate-x-4.5" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        {settings.maintenanceMode && (
          <div className="mt-3 bg-red-50 border border-red-200/60 rounded-2xl px-3 py-2 text-[10px] text-red-800 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Shield size={12} className="shrink-0" />
            ⚠️ Users won't be able to access the app
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 h-9 px-5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-colors shadow-sm"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
          {saving ? "Saving..." : saved ? "Settings Saved" : "Save Settings"}
        </button>
      </div>

    </div>
  );
}
