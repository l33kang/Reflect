-- CreateTable
CREATE TABLE "PrivacySettings" (
    "userId" TEXT NOT NULL,
    "allowAnonymousFeedback" BOOLEAN NOT NULL DEFAULT true,
    "allowFeedbackFrom" TEXT NOT NULL DEFAULT 'everyone',
    "discoverable" BOOLEAN NOT NULL DEFAULT true,
    "showFriendsList" BOOLEAN NOT NULL DEFAULT true,
    "showReputation" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PrivacySettings_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "PrivacySettings" ADD CONSTRAINT "PrivacySettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
