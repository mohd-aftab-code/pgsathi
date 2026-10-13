import { db } from "@/lib/db";
import { EnquiriesManager, ContactEnquiryItem } from "@/components/dashboard/admin/EnquiriesManager";

export const metadata = {
  title: "Contact Enquiries - PGSathi Admin",
  description: "View and manage incoming customer contact enquiries and support tickets.",
};

export default async function AdminEnquiriesPage() {
  const [enquiries, total, unread, pending, resolved] = await Promise.all([
    db.contactEnquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.contactEnquiry.count(),
    db.contactEnquiry.count({ where: { isRead: false } }),
    db.contactEnquiry.count({ where: { status: "PENDING" } }),
    db.contactEnquiry.count({ where: { status: "RESOLVED" } }),
  ]);

  const serializedEnquiries: ContactEnquiryItem[] = enquiries.map((e) => ({
    id: e.id,
    name: e.name,
    email: e.email,
    phone: e.phone,
    subject: e.subject,
    message: e.message,
    status: e.status,
    isRead: e.isRead,
    adminNotes: e.adminNotes,
    ipAddress: e.ipAddress,
    userAgent: e.userAgent,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">
            Contact Enquiries
          </h1>
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mt-0.5">
            Support Desk · Manage website contact messages & enquiries
          </p>
        </div>
      </div>

      <EnquiriesManager
        initialEnquiries={serializedEnquiries}
        initialCounts={{ total, unread, pending, resolved }}
      />
    </div>
  );
}
