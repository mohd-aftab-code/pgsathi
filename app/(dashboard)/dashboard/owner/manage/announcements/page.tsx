export const metadata = {
  title: "Notices & Announcements - PG Manager",
};

export default function AnnouncementsPage() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-800">Notices & Announcements</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Publish notices and announcements for your tenants.
          </p>
        </div>
      </div>
      <div className="p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
          <span className="text-orange-500 text-2xl font-bold">!</span>
        </div>
        <h3 className="text-lg font-bold text-neutral-700">Coming Soon</h3>
        <p className="text-sm text-neutral-500 mt-2 max-w-sm">
          The announcements and notice board module is under construction and will be available soon.
        </p>
      </div>
    </div>
  );
}
