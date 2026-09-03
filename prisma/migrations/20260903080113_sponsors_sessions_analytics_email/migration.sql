-- CreateEnum
CREATE TYPE "SponsorTier" AS ENUM ('SUPPORTER', 'STANDARD', 'WORKSHOP', 'CUSTOM');

-- CreateEnum
CREATE TYPE "SponsorCadence" AS ENUM ('ONE_TIME', 'RECURRING');

-- CreateEnum
CREATE TYPE "SponsorVisibility" AS ENUM ('PRIVATE', 'ANONYMOUS', 'PUBLIC');

-- CreateEnum
CREATE TYPE "ModerationState" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('PAYSTACK');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "DeviceClass" AS ENUM ('DESKTOP', 'MOBILE', 'TABLET', 'BOT', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "EmailEventType" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'COMPLAINED', 'FAILED', 'UNSUBSCRIBED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SENDING', 'SENT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CampaignDeliveryStatus" AS ENUM ('QUEUED', 'SENDING', 'SENT', 'FAILED', 'SKIPPED');

-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "cadence" "SponsorCadence" NOT NULL DEFAULT 'ONE_TIME',
ADD COLUMN     "fxRate" DOUBLE PRECISION,
ADD COLUMN     "originalAmount" DOUBLE PRECISION,
ADD COLUMN     "originalCurrency" TEXT,
ADD COLUMN     "paypalOrderId" TEXT,
ADD COLUMN     "provider" "PaymentProvider" NOT NULL DEFAULT 'PAYSTACK',
ADD COLUMN     "sessionId" TEXT,
ADD COLUMN     "sponsorId" TEXT,
ADD COLUMN     "subscriptionId" TEXT,
ADD COLUMN     "usdAmount" DOUBLE PRECISION,
ADD COLUMN     "visitorId" TEXT;

-- CreateTable
CREATE TABLE "Sponsor" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "orgName" TEXT,
    "websiteUrl" TEXT,
    "logoUrl" TEXT,
    "blurb" TEXT,
    "tier" "SponsorTier" NOT NULL DEFAULT 'SUPPORTER',
    "cadence" "SponsorCadence" NOT NULL DEFAULT 'ONE_TIME',
    "visibility" "SponsorVisibility" NOT NULL DEFAULT 'PRIVATE',
    "moderation" "ModerationState" NOT NULL DEFAULT 'PENDING_REVIEW',
    "monthlyUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lifetimeUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "sponsorId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'PAYSTACK',
    "planCode" TEXT,
    "subscriptionCode" TEXT,
    "emailToken" TEXT,
    "customerCode" TEXT,
    "amountUsd" DOUBLE PRECISION NOT NULL,
    "interval" TEXT NOT NULL DEFAULT 'monthly',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "source" TEXT,
    "country" TEXT,
    "device" "DeviceClass" NOT NULL DEFAULT 'UNKNOWN',
    "browser" TEXT,
    "visitorHash" TEXT,
    "visitorId" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT,
    "country" TEXT,
    "device" "DeviceClass" NOT NULL DEFAULT 'UNKNOWN',
    "value" DOUBLE PRECISION,
    "currency" TEXT,
    "entityId" TEXT,
    "sessionId" TEXT,
    "visitorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entryPath" TEXT,
    "exitPath" TEXT,
    "referrer" TEXT,
    "source" TEXT,
    "country" TEXT,
    "device" "DeviceClass" NOT NULL DEFAULT 'UNKNOWN',
    "browser" TEXT,
    "pageViewCount" INTEGER NOT NULL DEFAULT 0,
    "eventCount" INTEGER NOT NULL DEFAULT 0,
    "converted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailMessage" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "fromEmail" TEXT,
    "tags" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'queued',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailDeliveryEvent" (
    "id" TEXT NOT NULL,
    "providerEventId" TEXT NOT NULL,
    "messageId" TEXT,
    "recipient" TEXT,
    "type" "EmailEventType" NOT NULL,
    "tags" TEXT[],
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "detail" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailDeliveryEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "bodyMd" TEXT NOT NULL,
    "fromKey" TEXT NOT NULL DEFAULT 'hq',
    "segment" TEXT NOT NULL,
    "segmentLabel" TEXT NOT NULL,
    "contactEmail" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "includeUnsubscribe" BOOLEAN NOT NULL DEFAULT true,
    "testSentAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "sentBy" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignDelivery" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "status" "CampaignDeliveryStatus" NOT NULL DEFAULT 'QUEUED',
    "providerId" TEXT,
    "error" TEXT,
    "claimedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sponsor_email_key" ON "Sponsor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Sponsor_slug_key" ON "Sponsor"("slug");

-- CreateIndex
CREATE INDEX "Sponsor_visibility_moderation_idx" ON "Sponsor"("visibility", "moderation");

-- CreateIndex
CREATE INDEX "Sponsor_expiresAt_idx" ON "Sponsor"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_subscriptionCode_key" ON "Subscription"("subscriptionCode");

-- CreateIndex
CREATE INDEX "Subscription_sponsorId_idx" ON "Subscription"("sponsorId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");

-- CreateIndex
CREATE INDEX "PageView_path_idx" ON "PageView"("path");

-- CreateIndex
CREATE INDEX "PageView_path_createdAt_idx" ON "PageView"("path", "createdAt");

-- CreateIndex
CREATE INDEX "PageView_country_createdAt_idx" ON "PageView"("country", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_name_createdAt_idx" ON "AnalyticsEvent"("name", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_sessionId_idx" ON "AnalyticsEvent"("sessionId");

-- CreateIndex
CREATE INDEX "Session_visitorId_idx" ON "Session"("visitorId");

-- CreateIndex
CREATE INDEX "Session_startedAt_idx" ON "Session"("startedAt");

-- CreateIndex
CREATE INDEX "Session_converted_startedAt_idx" ON "Session"("converted", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "EmailMessage_messageId_key" ON "EmailMessage"("messageId");

-- CreateIndex
CREATE INDEX "EmailMessage_createdAt_idx" ON "EmailMessage"("createdAt");

-- CreateIndex
CREATE INDEX "EmailMessage_recipient_idx" ON "EmailMessage"("recipient");

-- CreateIndex
CREATE UNIQUE INDEX "EmailDeliveryEvent_providerEventId_key" ON "EmailDeliveryEvent"("providerEventId");

-- CreateIndex
CREATE INDEX "EmailDeliveryEvent_messageId_idx" ON "EmailDeliveryEvent"("messageId");

-- CreateIndex
CREATE INDEX "EmailDeliveryEvent_type_createdAt_idx" ON "EmailDeliveryEvent"("type", "createdAt");

-- CreateIndex
CREATE INDEX "EmailDeliveryEvent_recipient_idx" ON "EmailDeliveryEvent"("recipient");

-- CreateIndex
CREATE INDEX "EmailDeliveryEvent_type_occurredAt_idx" ON "EmailDeliveryEvent"("type", "occurredAt");

-- CreateIndex
CREATE INDEX "Campaign_status_createdAt_idx" ON "Campaign"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Campaign_createdAt_idx" ON "Campaign"("createdAt");

-- CreateIndex
CREATE INDEX "CampaignDelivery_campaignId_status_idx" ON "CampaignDelivery"("campaignId", "status");

-- CreateIndex
CREATE INDEX "CampaignDelivery_email_idx" ON "CampaignDelivery"("email");

-- CreateIndex
CREATE INDEX "CampaignDelivery_providerId_idx" ON "CampaignDelivery"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignDelivery_campaignId_email_key" ON "CampaignDelivery"("campaignId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Donation_paypalOrderId_key" ON "Donation"("paypalOrderId");

-- CreateIndex
CREATE INDEX "Donation_sponsorId_idx" ON "Donation"("sponsorId");

-- CreateIndex
CREATE INDEX "Donation_status_createdAt_idx" ON "Donation"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Donation_sessionId_idx" ON "Donation"("sessionId");

-- CreateIndex
CREATE INDEX "Donation_visitorId_idx" ON "Donation"("visitorId");

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignDelivery" ADD CONSTRAINT "CampaignDelivery_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

