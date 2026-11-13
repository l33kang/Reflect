-- CreateTable
CREATE TABLE "BestFriend" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BestFriend_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BestFriend_userId_idx" ON "BestFriend"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BestFriend_userId_friendId_key" ON "BestFriend"("userId", "friendId");

-- AddForeignKey
ALTER TABLE "BestFriend" ADD CONSTRAINT "BestFriend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BestFriend" ADD CONSTRAINT "BestFriend_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
