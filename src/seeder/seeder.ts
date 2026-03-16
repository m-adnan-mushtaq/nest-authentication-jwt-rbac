import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { seedRoles } from './role.seeder';
import { seedSuperAdmin } from './user.seeder';
import { connectionSource } from '../config/index';

async function runSeeders() {
  const dataSource: DataSource = connectionSource;

  try {
    console.log('Connecting to the database...');
    await dataSource.initialize();

    console.log('Seeding data...');

    // 1. Seed roles first (required for user role assignments)
    await seedRoles(dataSource);

    // 2. Seed super admin user (optional, creates a system super admin)
    await seedSuperAdmin(dataSource);

    console.log('Seeding completed successfully.');
    await dataSource.destroy();
  } catch (error) {
    console.error('Error seeding data:', error);
    await dataSource.destroy();
  }
}

runSeeders();
