-- CreateTable
CREATE TABLE IF NOT EXISTS "contact_enquiries" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "subject" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "adminNotes" TEXT,
    "ipAddress" VARCHAR(60),
    "userAgent" VARCHAR(300),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "contact_enquiries_status_idx" ON "contact_enquiries"("status");
CREATE INDEX IF NOT EXISTS "contact_enquiries_isRead_idx" ON "contact_enquiries"("isRead");
CREATE INDEX IF NOT EXISTS "contact_enquiries_createdAt_idx" ON "contact_enquiries"("createdAt");
