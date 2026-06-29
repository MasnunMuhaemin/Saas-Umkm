-- AlterTable
ALTER TABLE `tenant` ADD COLUMN `heroStyle` VARCHAR(191) NOT NULL DEFAULT 'centered',
    ADD COLUMN `productStyle` VARCHAR(191) NOT NULL DEFAULT 'grid';
