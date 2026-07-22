-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('TENANT', 'OWNER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PGType" AS ENUM ('SINGLE_ROOM', 'DOUBLE_SHARING', 'TRIPLE_SHARING', 'DORMITORY', 'STUDIO', 'ENTIRE_FLAT');

-- CreateEnum
CREATE TYPE "GenderType" AS ENUM ('BOYS', 'GIRLS', 'COED', 'UNISEX', 'FAMILY');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED', 'EXPIRED', 'DRAFT', 'UNDER_REVIEW');

-- CreateEnum
CREATE TYPE "SubStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'PAST_DUE', 'TRIAL', 'PENDING');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "BoostType" AS ENUM ('SPOTLIGHT', 'FEATURED', 'HOMEPAGE', 'WHATSAPP_BLAST');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('WEBSITE', 'WHATSAPP', 'PHONE', 'APP');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'VISIT_SCHEDULED', 'CONVERTED', 'LOST');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LEAD', 'VISIT', 'PAYMENT', 'RENT_DUE', 'COMPLAINT', 'REVIEW', 'SUBSCRIPTION', 'SYSTEM');

-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(15),
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'TENANT',
    "avatar" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "googleId" VARCHAR(255),
    "referralCode" VARCHAR(20),
    "referredBy" INTEGER,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "languagePreference" VARCHAR(10) NOT NULL DEFAULT 'ENGLISH',
    "ownerType" VARCHAR(20),
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "whatsappNumber" VARCHAR(15),
    "whatsappOptIn" BOOLEAN NOT NULL DEFAULT false,
    "whatsappVerified" BOOLEAN NOT NULL DEFAULT false,
    "messMenuEnabled" BOOLEAN NOT NULL DEFAULT false,
    "expensesEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metaDesc" VARCHAR(320),
    "metaTitle" VARCHAR(160),

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "localities" (
    "id" SERIAL NOT NULL,
    "cityId" INTEGER NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),

    CONSTRAINT "localities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "cityId" INTEGER,
    "localityId" INTEGER,
    "title" VARCHAR(200) NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "genderAllowed" "GenderType" NOT NULL DEFAULT 'BOYS',
    "address" VARCHAR(500) NOT NULL DEFAULT '',
    "landmark" VARCHAR(200),
    "pincode" VARCHAR(10) NOT NULL DEFAULT '',
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "priceMin" INTEGER NOT NULL DEFAULT 0,
    "priceMax" INTEGER NOT NULL DEFAULT 0,
    "securityDeposit" INTEGER,
    "foodIncluded" BOOLEAN NOT NULL DEFAULT false,
    "totalRooms" INTEGER,
    "availableRooms" INTEGER,
    "totalBeds" INTEGER,
    "availableBeds" INTEGER,
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "featuredUntil" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metaTitle" VARCHAR(160),
    "metaDesc" VARCHAR(320),
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "totalLeads" INTEGER NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "avgRating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gateClosingTime" BOOLEAN NOT NULL DEFAULT false,
    "laundryService" BOOLEAN NOT NULL DEFAULT false,
    "noGuardiansStay" BOOLEAN NOT NULL DEFAULT false,
    "noticePeriod" BOOLEAN NOT NULL DEFAULT false,
    "parking" BOOLEAN NOT NULL DEFAULT false,
    "rentLockIn" BOOLEAN NOT NULL DEFAULT false,
    "roomCleaning" BOOLEAN NOT NULL DEFAULT false,
    "electricityCharge" INTEGER,
    "foodCharge" INTEGER,
    "maintenanceCharge" INTEGER,
    "setupFee" INTEGER,
    "alcoholAllowed" BOOLEAN NOT NULL DEFAULT false,
    "areaLocality" VARCHAR(200),
    "buildingType" VARCHAR(20),
    "cctvCoverage" VARCHAR(15),
    "curfewTime" VARCHAR(10),
    "depositRefundPolicy" VARCHAR(30),
    "doorNumber" VARCHAR(100),
    "emergencyExits" BOOLEAN NOT NULL DEFAULT false,
    "fireExtinguisher" BOOLEAN NOT NULL DEFAULT false,
    "firstAidKit" BOOLEAN NOT NULL DEFAULT false,
    "foodAvailability" VARCHAR(20),
    "foodType" VARCHAR(10),
    "internetSpeed" VARCHAR(20),
    "internetType" VARCHAR(15),
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "liftAvailable" BOOLEAN NOT NULL DEFAULT false,
    "lockInPeriodMonths" INTEGER,
    "moderationNotes" TEXT,
    "noticePeriodDays" INTEGER,
    "parkingType" VARCHAR(15),
    "petsAllowed" BOOLEAN NOT NULL DEFAULT false,
    "pgFloors" TEXT,
    "powerBackup" VARCHAR(10) NOT NULL DEFAULT 'NONE',
    "preferredGuest" VARCHAR(15),
    "propertyAge" INTEGER,
    "propertyType" VARCHAR(20) NOT NULL DEFAULT 'PG',
    "qualityScore" INTEGER NOT NULL DEFAULT 0,
    "rejectionReason" TEXT,
    "sector" VARCHAR(50),
    "securityGuard" VARCHAR(10),
    "seoScore" INTEGER NOT NULL DEFAULT 0,
    "smokingAllowed" BOOLEAN NOT NULL DEFAULT false,
    "state" VARCHAR(100),
    "streetName" VARCHAR(200),
    "totalFloors" INTEGER,
    "trustScore" INTEGER NOT NULL DEFAULT 0,
    "visitorsAllowed" VARCHAR(15),
    "waterSupply" VARCHAR(15),
    "wizardStep" INTEGER NOT NULL DEFAULT 1,
    "womenOnlyFloors" BOOLEAN NOT NULL DEFAULT false,
    "roomTypes" "PGType"[] DEFAULT ARRAY['SINGLE_ROOM']::"PGType"[],

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_photos" (
    "id" SERIAL NOT NULL,
    "listingId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" VARCHAR(255) NOT NULL,
    "caption" VARCHAR(200),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "mediaType" VARCHAR(15) NOT NULL DEFAULT 'PHOTO',
    "roomLabel" VARCHAR(30),
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "listing_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amenities" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "icon" VARCHAR(50) NOT NULL,
    "category" VARCHAR(50) NOT NULL,

    CONSTRAINT "amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_amenities" (
    "listingId" INTEGER NOT NULL,
    "amenityId" INTEGER NOT NULL,
    "detail" VARCHAR(100),

    CONSTRAINT "listing_amenities_pkey" PRIMARY KEY ("listingId","amenityId")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "price" INTEGER NOT NULL,
    "yearlyPrice" INTEGER,
    "maxListings" INTEGER NOT NULL,
    "maxPhotos" INTEGER NOT NULL,
    "features" JSONB NOT NULL,
    "razorpayPlanId" VARCHAR(100),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxTenants" INTEGER NOT NULL DEFAULT -1,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "status" "SubStatus" NOT NULL DEFAULT 'ACTIVE',
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "amount" INTEGER NOT NULL,
    "razorpaySubId" VARCHAR(100),
    "razorpayOrderId" VARCHAR(100),
    "razorpayPaymentId" VARCHAR(100),
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" SERIAL NOT NULL,
    "subscriptionId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" VARCHAR(5) NOT NULL DEFAULT 'INR',
    "status" VARCHAR(20) NOT NULL,
    "razorpayOrderId" VARCHAR(100),
    "razorpayPayId" VARCHAR(100),
    "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_boosts" (
    "id" SERIAL NOT NULL,
    "listingId" INTEGER NOT NULL,
    "boostType" "BoostType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "razorpayOrderId" VARCHAR(100),
    "razorpayPayId" VARCHAR(100),
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_boosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" SERIAL NOT NULL,
    "listingId" INTEGER NOT NULL,
    "tenantId" INTEGER,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "email" VARCHAR(255),
    "message" TEXT,
    "source" "LeadSource" NOT NULL DEFAULT 'WEBSITE',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "followUpAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM',
    "title" VARCHAR(180) NOT NULL,
    "message" TEXT,
    "link" VARCHAR(255),
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "listingId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_listings" (
    "userId" INTEGER NOT NULL,
    "listingId" INTEGER NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_listings_pkey" PRIMARY KEY ("userId","listingId")
);

-- CreateTable
CREATE TABLE "listing_analytics" (
    "id" SERIAL NOT NULL,
    "listingId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "leads" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "whatsapps" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "listing_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" SERIAL NOT NULL,
    "listingId" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" "PGType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "floor" VARCHAR(50),
    "price" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beds" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "isOccupied" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" INTEGER,

    CONSTRAINT "beds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_bookings" (
    "id" SERIAL NOT NULL,
    "listingId" INTEGER NOT NULL,
    "tenantId" INTEGER,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "status" "VisitStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visit_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_codes" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "phone" VARCHAR(15),
    "code" VARCHAR(6) NOT NULL,
    "purpose" VARCHAR(20) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" VARCHAR(255),
    "accountType" VARCHAR(10),

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pg_tenants" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "listingId" INTEGER NOT NULL,
    "roomId" INTEGER,
    "bedId" INTEGER,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "email" VARCHAR(255),
    "gender" VARCHAR(10) NOT NULL DEFAULT 'MALE',
    "idType" VARCHAR(30),
    "idNumber" VARCHAR(50),
    "photoUrl" TEXT,
    "guardianName" VARCHAR(100),
    "guardianPhone" VARCHAR(15),
    "permanentAddress" TEXT,
    "monthlyRent" INTEGER NOT NULL DEFAULT 0,
    "securityDeposit" INTEGER NOT NULL DEFAULT 0,
    "rentDueDay" INTEGER NOT NULL DEFAULT 5,
    "checkInDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkOutDate" TIMESTAMP(3),
    "noticeDate" TIMESTAMP(3),
    "expectedVacate" TIMESTAMP(3),
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "depositRefunded" INTEGER,
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "pg_tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pg_payments" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "rentBillId" INTEGER,
    "amount" INTEGER NOT NULL,
    "type" VARCHAR(30) NOT NULL DEFAULT 'RENT',
    "forMonth" VARCHAR(7),
    "method" VARCHAR(20) NOT NULL DEFAULT 'CASH',
    "status" VARCHAR(20) NOT NULL DEFAULT 'PAID',
    "paidOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "receiptNo" VARCHAR(30),
    "voided" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pg_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pg_rent_bills" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "forMonth" VARCHAR(7) NOT NULL,
    "rentAmount" INTEGER NOT NULL,
    "electricity" INTEGER NOT NULL DEFAULT 0,
    "otherAmount" INTEGER NOT NULL DEFAULT 0,
    "lateFee" INTEGER NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "billNo" VARCHAR(30),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pg_rent_bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pg_meter_readings" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "listingId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "forMonth" VARCHAR(7) NOT NULL,
    "prevReading" INTEGER NOT NULL,
    "currReading" INTEGER NOT NULL,
    "ratePerUnit" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pg_meter_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pg_complaints" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "listingId" INTEGER NOT NULL,
    "tenantId" INTEGER,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(50) NOT NULL DEFAULT 'OTHER',
    "priority" VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    "status" VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pg_complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pg_expenses" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "listingId" INTEGER,
    "category" VARCHAR(50) NOT NULL DEFAULT 'OTHER',
    "amount" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "spentOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pg_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pg_staff" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "listingId" INTEGER,
    "name" VARCHAR(100) NOT NULL,
    "role" VARCHAR(50) NOT NULL DEFAULT 'OTHER',
    "phone" VARCHAR(15),
    "salary" INTEGER NOT NULL DEFAULT 0,
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pg_staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pg_salary_payouts" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "staffId" INTEGER NOT NULL,
    "forMonth" VARCHAR(7) NOT NULL,
    "amount" INTEGER NOT NULL,
    "paidOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" VARCHAR(20) NOT NULL DEFAULT 'CASH',
    "note" TEXT,

    CONSTRAINT "pg_salary_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pg_mess_menus" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "listingId" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "breakfast" TEXT,
    "lunch" TEXT,
    "snacks" TEXT,
    "dinner" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pg_mess_menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pg_team_members" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'MANAGER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "listingIds" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pg_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pg_tenant_documents" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "type" VARCHAR(40) NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" VARCHAR(255),
    "mimeType" VARCHAR(50),
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pg_tenant_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pg_agreements" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "monthlyRent" INTEGER NOT NULL,
    "deposit" INTEGER NOT NULL,
    "noticeDays" INTEGER NOT NULL DEFAULT 30,
    "terms" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "signedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pg_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pg_audit_logs" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "actor" VARCHAR(150) NOT NULL,
    "action" TEXT NOT NULL,
    "entity" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pg_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pg_announcements" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "listingId" INTEGER,
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pg_announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_logs" (
    "id" SERIAL NOT NULL,
    "listingId" INTEGER NOT NULL,
    "reviewerId" INTEGER,
    "action" VARCHAR(20) NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pois" (
    "id" SERIAL NOT NULL,
    "type" VARCHAR(15) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "cityId" INTEGER,

    CONSTRAINT "pois_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_pois" (
    "id" SERIAL NOT NULL,
    "listingId" INTEGER NOT NULL,
    "poiId" INTEGER NOT NULL,
    "distanceKm" DECIMAL(5,2),

    CONSTRAINT "property_pois_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_availability" (
    "id" SERIAL NOT NULL,
    "roomConfigId" INTEGER NOT NULL,
    "totalBeds" INTEGER NOT NULL DEFAULT 0,
    "occupiedBeds" INTEGER NOT NULL DEFAULT 0,
    "availableBeds" INTEGER NOT NULL DEFAULT 0,
    "nextAvailableDate" TIMESTAMP(3),
    "hasWaitlist" BOOLEAN NOT NULL DEFAULT false,
    "waitlistContactMethod" VARCHAR(10),
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_configurations" (
    "id" SERIAL NOT NULL,
    "listingId" INTEGER NOT NULL,
    "roomType" VARCHAR(15) NOT NULL,
    "attachedWashroom" BOOLEAN NOT NULL DEFAULT false,
    "sharedWashroom" BOOLEAN NOT NULL DEFAULT false,
    "sharedWashroomRatio" INTEGER,
    "isAC" BOOLEAN NOT NULL DEFAULT false,
    "hasBalcony" BOOLEAN NOT NULL DEFAULT false,
    "balconyFacing" VARCHAR(20),
    "roomSizeSqFt" INTEGER,
    "bedType" VARCHAR(10),
    "mattressType" VARCHAR(10),
    "cupboardCount" INTEGER NOT NULL DEFAULT 0,
    "hasStudyTable" BOOLEAN NOT NULL DEFAULT false,
    "hasChair" BOOLEAN NOT NULL DEFAULT false,
    "maxOccupancy" INTEGER NOT NULL DEFAULT 1,
    "roomCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_pricing" (
    "id" SERIAL NOT NULL,
    "roomConfigId" INTEGER NOT NULL,
    "rentPerBed" INTEGER NOT NULL DEFAULT 0,
    "depositPerBed" INTEGER NOT NULL DEFAULT 0,
    "maintenanceMonthly" INTEGER,
    "electricityType" VARCHAR(10),
    "electricityRate" INTEGER,
    "waterCharges" INTEGER,
    "foodCharges" INTEGER,
    "laundryCharges" INTEGER,
    "cleaningCharges" INTEGER,
    "wifiCharges" INTEGER,
    "parkingCharges" INTEGER,
    "hiddenChargesNote" TEXT,
    "noHiddenCharges" BOOLEAN NOT NULL DEFAULT false,
    "earlyPaymentDiscount" INTEGER,
    "longTermDiscount6m" INTEGER,
    "longTermDiscount12m" INTEGER,
    "introOfferAmount" INTEGER,
    "introOfferValidUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trust_records" (
    "id" SERIAL NOT NULL,
    "listingId" INTEGER NOT NULL,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "whatsappVerified" BOOLEAN NOT NULL DEFAULT false,
    "locationVerified" BOOLEAN NOT NULL DEFAULT false,
    "photoVerified" BOOLEAN NOT NULL DEFAULT false,
    "kycDocUrl" TEXT,
    "kycDocType" VARCHAR(30),
    "kycStatus" VARCHAR(15) NOT NULL DEFAULT 'NONE',
    "qualityScore" INTEGER NOT NULL DEFAULT 0,
    "trustScore" INTEGER NOT NULL DEFAULT 0,
    "seoScore" INTEGER NOT NULL DEFAULT 0,
    "lastCalculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trust_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_analytics" (
    "id" SERIAL NOT NULL,
    "query" VARCHAR(255),
    "citySlug" VARCHAR(120),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_uuid_key" ON "users"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "users_referralCode_key" ON "users"("referralCode");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "cities_slug_key" ON "cities"("slug");

-- CreateIndex
CREATE INDEX "cities_slug_idx" ON "cities"("slug");

-- CreateIndex
CREATE INDEX "cities_isActive_idx" ON "cities"("isActive");

-- CreateIndex
CREATE INDEX "localities_cityId_idx" ON "localities"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "localities_cityId_slug_key" ON "localities"("cityId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "listings_uuid_key" ON "listings"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "listings_slug_key" ON "listings"("slug");

-- CreateIndex
CREATE INDEX "listings_cityId_status_isActive_idx" ON "listings"("cityId", "status", "isActive");

-- CreateIndex
CREATE INDEX "listings_cityId_localityId_status_idx" ON "listings"("cityId", "localityId", "status");

-- CreateIndex
CREATE INDEX "listings_priceMin_priceMax_idx" ON "listings"("priceMin", "priceMax");

-- CreateIndex
CREATE INDEX "listings_genderAllowed_idx" ON "listings"("genderAllowed");

-- CreateIndex
CREATE INDEX "listings_isFeatured_featuredUntil_idx" ON "listings"("isFeatured", "featuredUntil");

-- CreateIndex
CREATE INDEX "listings_ownerId_idx" ON "listings"("ownerId");

-- CreateIndex
CREATE INDEX "listings_slug_idx" ON "listings"("slug");

-- CreateIndex
CREATE INDEX "listings_status_isVerified_isActive_idx" ON "listings"("status", "isVerified", "isActive");

-- CreateIndex
CREATE INDEX "listings_isDraft_ownerId_idx" ON "listings"("isDraft", "ownerId");

-- CreateIndex
CREATE INDEX "listings_qualityScore_idx" ON "listings"("qualityScore");

-- CreateIndex
CREATE INDEX "listing_photos_listingId_idx" ON "listing_photos"("listingId");

-- CreateIndex
CREATE INDEX "listing_photos_listingId_mediaType_idx" ON "listing_photos"("listingId", "mediaType");

-- CreateIndex
CREATE UNIQUE INDEX "amenities_name_key" ON "amenities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "amenities_slug_key" ON "amenities"("slug");

-- CreateIndex
CREATE INDEX "listing_amenities_listingId_idx" ON "listing_amenities"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "plans_slug_key" ON "plans"("slug");

-- CreateIndex
CREATE INDEX "subscriptions_userId_status_idx" ON "subscriptions"("userId", "status");

-- CreateIndex
CREATE INDEX "subscriptions_endDate_idx" ON "subscriptions"("endDate");

-- CreateIndex
CREATE INDEX "invoices_subscriptionId_idx" ON "invoices"("subscriptionId");

-- CreateIndex
CREATE INDEX "listing_boosts_listingId_endDate_idx" ON "listing_boosts"("listingId", "endDate");

-- CreateIndex
CREATE INDEX "leads_listingId_createdAt_idx" ON "leads"("listingId", "createdAt");

-- CreateIndex
CREATE INDEX "leads_listingId_status_idx" ON "leads"("listingId", "status");

-- CreateIndex
CREATE INDEX "leads_tenantId_idx" ON "leads"("tenantId");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "reviews_listingId_isApproved_idx" ON "reviews"("listingId", "isApproved");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_listingId_userId_key" ON "reviews"("listingId", "userId");

-- CreateIndex
CREATE INDEX "listing_analytics_listingId_date_idx" ON "listing_analytics"("listingId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "listing_analytics_listingId_date_key" ON "listing_analytics"("listingId", "date");

-- CreateIndex
CREATE INDEX "rooms_listingId_idx" ON "rooms"("listingId");

-- CreateIndex
CREATE INDEX "beds_roomId_idx" ON "beds"("roomId");

-- CreateIndex
CREATE INDEX "beds_tenantId_idx" ON "beds"("tenantId");

-- CreateIndex
CREATE INDEX "visit_bookings_listingId_idx" ON "visit_bookings"("listingId");

-- CreateIndex
CREATE INDEX "visit_bookings_visitDate_idx" ON "visit_bookings"("visitDate");

-- CreateIndex
CREATE INDEX "otp_codes_phone_expiresAt_idx" ON "otp_codes"("phone", "expiresAt");

-- CreateIndex
CREATE INDEX "otp_codes_email_expiresAt_idx" ON "otp_codes"("email", "expiresAt");

-- CreateIndex
CREATE INDEX "pg_tenants_ownerId_idx" ON "pg_tenants"("ownerId");

-- CreateIndex
CREATE INDEX "pg_tenants_userId_idx" ON "pg_tenants"("userId");

-- CreateIndex
CREATE INDEX "pg_tenants_listingId_idx" ON "pg_tenants"("listingId");

-- CreateIndex
CREATE INDEX "pg_tenants_status_idx" ON "pg_tenants"("status");

-- CreateIndex
CREATE INDEX "pg_payments_ownerId_idx" ON "pg_payments"("ownerId");

-- CreateIndex
CREATE INDEX "pg_payments_tenantId_idx" ON "pg_payments"("tenantId");

-- CreateIndex
CREATE INDEX "pg_payments_forMonth_idx" ON "pg_payments"("forMonth");

-- CreateIndex
CREATE INDEX "pg_rent_bills_ownerId_idx" ON "pg_rent_bills"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "pg_rent_bills_tenantId_forMonth_key" ON "pg_rent_bills"("tenantId", "forMonth");

-- CreateIndex
CREATE INDEX "pg_meter_readings_ownerId_idx" ON "pg_meter_readings"("ownerId");

-- CreateIndex
CREATE INDEX "pg_meter_readings_listingId_idx" ON "pg_meter_readings"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "pg_meter_readings_roomId_forMonth_key" ON "pg_meter_readings"("roomId", "forMonth");

-- CreateIndex
CREATE INDEX "pg_complaints_ownerId_idx" ON "pg_complaints"("ownerId");

-- CreateIndex
CREATE INDEX "pg_complaints_listingId_idx" ON "pg_complaints"("listingId");

-- CreateIndex
CREATE INDEX "pg_complaints_status_idx" ON "pg_complaints"("status");

-- CreateIndex
CREATE INDEX "pg_expenses_ownerId_idx" ON "pg_expenses"("ownerId");

-- CreateIndex
CREATE INDEX "pg_expenses_listingId_idx" ON "pg_expenses"("listingId");

-- CreateIndex
CREATE INDEX "pg_staff_ownerId_idx" ON "pg_staff"("ownerId");

-- CreateIndex
CREATE INDEX "pg_salary_payouts_ownerId_idx" ON "pg_salary_payouts"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "pg_salary_payouts_staffId_forMonth_key" ON "pg_salary_payouts"("staffId", "forMonth");

-- CreateIndex
CREATE INDEX "pg_mess_menus_ownerId_idx" ON "pg_mess_menus"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "pg_mess_menus_listingId_dayOfWeek_key" ON "pg_mess_menus"("listingId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "pg_team_members_email_key" ON "pg_team_members"("email");

-- CreateIndex
CREATE INDEX "pg_team_members_ownerId_idx" ON "pg_team_members"("ownerId");

-- CreateIndex
CREATE INDEX "pg_tenant_documents_tenantId_idx" ON "pg_tenant_documents"("tenantId");

-- CreateIndex
CREATE INDEX "pg_tenant_documents_ownerId_idx" ON "pg_tenant_documents"("ownerId");

-- CreateIndex
CREATE INDEX "pg_agreements_tenantId_idx" ON "pg_agreements"("tenantId");

-- CreateIndex
CREATE INDEX "pg_agreements_ownerId_idx" ON "pg_agreements"("ownerId");

-- CreateIndex
CREATE INDEX "pg_audit_logs_ownerId_idx" ON "pg_audit_logs"("ownerId");

-- CreateIndex
CREATE INDEX "pg_announcements_ownerId_idx" ON "pg_announcements"("ownerId");

-- CreateIndex
CREATE INDEX "moderation_logs_listingId_idx" ON "moderation_logs"("listingId");

-- CreateIndex
CREATE INDEX "moderation_logs_reviewerId_idx" ON "moderation_logs"("reviewerId");

-- CreateIndex
CREATE INDEX "pois_type_cityId_idx" ON "pois"("type", "cityId");

-- CreateIndex
CREATE INDEX "property_pois_listingId_idx" ON "property_pois"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "property_pois_listingId_poiId_key" ON "property_pois"("listingId", "poiId");

-- CreateIndex
CREATE UNIQUE INDEX "room_availability_roomConfigId_key" ON "room_availability"("roomConfigId");

-- CreateIndex
CREATE INDEX "room_configurations_listingId_idx" ON "room_configurations"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "room_pricing_roomConfigId_key" ON "room_pricing"("roomConfigId");

-- CreateIndex
CREATE UNIQUE INDEX "trust_records_listingId_key" ON "trust_records"("listingId");

-- CreateIndex
CREATE INDEX "search_analytics_citySlug_idx" ON "search_analytics"("citySlug");

-- CreateIndex
CREATE INDEX "search_analytics_createdAt_idx" ON "search_analytics"("createdAt");

-- AddForeignKey
ALTER TABLE "localities" ADD CONSTRAINT "localities_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_localityId_fkey" FOREIGN KEY ("localityId") REFERENCES "localities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_photos" ADD CONSTRAINT "listing_photos_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_amenities" ADD CONSTRAINT "listing_amenities_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "amenities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_amenities" ADD CONSTRAINT "listing_amenities_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_boosts" ADD CONSTRAINT "listing_boosts_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_listings" ADD CONSTRAINT "saved_listings_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_listings" ADD CONSTRAINT "saved_listings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_analytics" ADD CONSTRAINT "listing_analytics_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beds" ADD CONSTRAINT "beds_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beds" ADD CONSTRAINT "beds_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_bookings" ADD CONSTRAINT "visit_bookings_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_bookings" ADD CONSTRAINT "visit_bookings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp_codes" ADD CONSTRAINT "otp_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_tenants" ADD CONSTRAINT "pg_tenants_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "beds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_tenants" ADD CONSTRAINT "pg_tenants_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_tenants" ADD CONSTRAINT "pg_tenants_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_tenants" ADD CONSTRAINT "pg_tenants_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_tenants" ADD CONSTRAINT "pg_tenants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_payments" ADD CONSTRAINT "pg_payments_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_payments" ADD CONSTRAINT "pg_payments_rentBillId_fkey" FOREIGN KEY ("rentBillId") REFERENCES "pg_rent_bills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_payments" ADD CONSTRAINT "pg_payments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "pg_tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_rent_bills" ADD CONSTRAINT "pg_rent_bills_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_rent_bills" ADD CONSTRAINT "pg_rent_bills_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "pg_tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_meter_readings" ADD CONSTRAINT "pg_meter_readings_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_meter_readings" ADD CONSTRAINT "pg_meter_readings_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_meter_readings" ADD CONSTRAINT "pg_meter_readings_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_complaints" ADD CONSTRAINT "pg_complaints_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_complaints" ADD CONSTRAINT "pg_complaints_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_complaints" ADD CONSTRAINT "pg_complaints_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "pg_tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_expenses" ADD CONSTRAINT "pg_expenses_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_expenses" ADD CONSTRAINT "pg_expenses_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_staff" ADD CONSTRAINT "pg_staff_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_staff" ADD CONSTRAINT "pg_staff_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_salary_payouts" ADD CONSTRAINT "pg_salary_payouts_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_salary_payouts" ADD CONSTRAINT "pg_salary_payouts_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "pg_staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_mess_menus" ADD CONSTRAINT "pg_mess_menus_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_mess_menus" ADD CONSTRAINT "pg_mess_menus_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_team_members" ADD CONSTRAINT "pg_team_members_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_tenant_documents" ADD CONSTRAINT "pg_tenant_documents_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_tenant_documents" ADD CONSTRAINT "pg_tenant_documents_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "pg_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_agreements" ADD CONSTRAINT "pg_agreements_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_agreements" ADD CONSTRAINT "pg_agreements_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "pg_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_audit_logs" ADD CONSTRAINT "pg_audit_logs_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_announcements" ADD CONSTRAINT "pg_announcements_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_announcements" ADD CONSTRAINT "pg_announcements_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_pois" ADD CONSTRAINT "property_pois_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_pois" ADD CONSTRAINT "property_pois_poiId_fkey" FOREIGN KEY ("poiId") REFERENCES "pois"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_availability" ADD CONSTRAINT "room_availability_roomConfigId_fkey" FOREIGN KEY ("roomConfigId") REFERENCES "room_configurations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_configurations" ADD CONSTRAINT "room_configurations_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_pricing" ADD CONSTRAINT "room_pricing_roomConfigId_fkey" FOREIGN KEY ("roomConfigId") REFERENCES "room_configurations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_records" ADD CONSTRAINT "trust_records_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

┌─────────────────────────────────────────────────────────┐
│  Update available 5.22.0 -> 7.9.0                       │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘
