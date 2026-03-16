import { DataSource } from 'typeorm';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { Account } from '../entities/account.entity';
import { SystemRole } from '../common/constants/enums';
import { Helper } from '../utils/helper';

/**
 * Seeds an Admin user
 */
export async function seedSuperAdmin(dataSource: DataSource) {
  const roleRepository = dataSource.getRepository(Role);
  const userRepository = dataSource.getRepository(User);
  const accountRepository = dataSource.getRepository(Account);

  const adminRole = await roleRepository.findOne({
    where: { name: SystemRole.ADMIN },
  });

  if (!adminRole) {
    throw new Error(
      'Admin role not found. Ensure roles are seeded first.',
    );
  }

  const adminEmail =
    process.env.SUPER_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword =
    process.env.SUPER_ADMIN_PASSWORD || 'Admin@123';

  const existingAdmin = await userRepository.findOneBy({
    email: adminEmail,
  });

  if (!existingAdmin) {
    const hashedPassword = await Helper.hashPassword(adminPassword);

    const admin = userRepository.create({
      name: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      isActive: true,
      isEmailVerified: true,
      roleId: adminRole.id,
    });

    const savedUser = await userRepository.save(admin);

    const account = accountRepository.create({
      userId: savedUser.id,
    });
    await accountRepository.save(account);

    console.log(`Admin user created: ${adminEmail}`);
  } else {
    if (!existingAdmin.roleId) {
      existingAdmin.roleId = adminRole.id;
      await userRepository.save(existingAdmin);
      console.log('Admin role assigned to existing user.');
    } else {
      console.log('Admin user already exists with role.');
    }
  }
}
