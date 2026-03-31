-- CreateTable
CREATE TABLE `Dispatcher` (
    `id` VARCHAR(191) NOT NULL DEFAULT (UUID()),
    `name` VARCHAR(191) NOT NULL,
    `shift_date` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Shift_Type` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Shift_Type_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Shift` (
    `id` VARCHAR(191) NOT NULL DEFAULT (UUID()),
    `shift_type_id` INTEGER NOT NULL,
    `shift_start_hour` VARCHAR(191) NOT NULL,
    `signed_up` INTEGER NOT NULL,
    `capacity` INTEGER NOT NULL,
    `shift_date` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Shift` ADD CONSTRAINT `Shift_shift_type_id_fkey` FOREIGN KEY (`shift_type_id`) REFERENCES `Shift_Type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
