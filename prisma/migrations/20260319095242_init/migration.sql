-- CreateTable
CREATE TABLE `Authcode` (
    `id` VARCHAR(191) NOT NULL,
    `discord_id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `code_hash` VARCHAR(191) NOT NULL,
    `expiry` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Authcode_discord_id_key`(`discord_id`),
    UNIQUE INDEX `Authcode_email_key`(`email`),
    UNIQUE INDEX `Authcode_code_hash_key`(`code_hash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Channel` (
    `id` VARCHAR(191) NOT NULL,
    `guild_id` VARCHAR(191) NOT NULL,
    `channel_id` VARCHAR(191) NOT NULL,
    `message_id` VARCHAR(191) NULL,

    UNIQUE INDEX `Channel_guild_id_channel_id_key`(`guild_id`, `channel_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `discord_id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `authenticated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_discord_id_key`(`discord_id`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
