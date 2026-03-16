import { DataSource } from 'typeorm';
import { Role } from '../entities/role.entity';
import { SystemRole } from '../common/constants/enums';

/**
 * Seeds the 2 system roles: admin and user
 */
export async function seedRoles(dataSource: DataSource) {
  const roleRepository = dataSource.getRepository(Role);

  const roles = [
    {
      name: SystemRole.ADMIN,
      title: 'Admin',
      description: 'Full access to users and products',
    },
    {
      name: SystemRole.USER,
      title: 'User',
      description: 'Read-only access to products',
    },
  ];

  for (const roleData of roles) {
    const existingRole = await roleRepository.findOneBy({
      name: roleData.name,
    });
    if (!existingRole) {
      const role = roleRepository.create(roleData);
      await roleRepository.save(role);
      console.log(`Role '${roleData.name}' created.`);
    } else {
      existingRole.title = roleData.title;
      existingRole.description = roleData.description;
      await roleRepository.save(existingRole);
      console.log(`Role '${roleData.name}' updated.`);
    }
  }
  console.log('Roles seeded successfully.');
}
