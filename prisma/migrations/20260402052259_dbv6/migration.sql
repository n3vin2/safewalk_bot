-- CreateTable
CREATE TABLE `Shift_Credit` (
    `id` VARCHAR(191) NOT NULL DEFAULT (UUID()),
    `user_email` VARCHAR(191) NOT NULL,
    `week` DATETIME(3) NOT NULL,
    `credits` DOUBLE NOT NULL,

    UNIQUE INDEX `Shift_Credit_user_email_week_key`(`user_email`, `week`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
