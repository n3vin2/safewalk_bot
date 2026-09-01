-- CreateTable
CREATE TABLE "Authcode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discord_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "expiry" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "message_id" TEXT
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discord_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "authenticated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Dispatcher" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "shift_date" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Shift_Type" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Shift_Time" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "time" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Shift" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shift_type_name" TEXT NOT NULL,
    "shift_start_hour" TEXT NOT NULL,
    "signed_up" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "shift_date" DATETIME NOT NULL,
    CONSTRAINT "Shift_shift_type_name_fkey" FOREIGN KEY ("shift_type_name") REFERENCES "Shift_Type" ("name") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Shift_shift_start_hour_fkey" FOREIGN KEY ("shift_start_hour") REFERENCES "Shift_Time" ("time") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Shift_Credit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_email" TEXT NOT NULL,
    "week" DATETIME NOT NULL,
    "credits" REAL
);

-- CreateIndex
CREATE UNIQUE INDEX "Authcode_discord_id_key" ON "Authcode"("discord_id");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_guild_id_channel_id_key" ON "Channel"("guild_id", "channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_discord_id_key" ON "User"("discord_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Shift_Type_name_key" ON "Shift_Type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Shift_Time_time_key" ON "Shift_Time"("time");

-- CreateIndex
CREATE UNIQUE INDEX "Shift_Credit_user_email_week_key" ON "Shift_Credit"("user_email", "week");
