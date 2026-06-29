-- AlterTable
ALTER TABLE `tenant` ADD COLUMN `advantagesStyle` VARCHAR(191) NOT NULL DEFAULT 'cards',
    ADD COLUMN `faqStyle` VARCHAR(191) NOT NULL DEFAULT 'accordion',
    ADD COLUMN `testimonialStyle` VARCHAR(191) NOT NULL DEFAULT 'grid';
