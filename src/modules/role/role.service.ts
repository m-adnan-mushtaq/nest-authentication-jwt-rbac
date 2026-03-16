import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { PaginationQueryDto } from '@/common/decorators/pagination.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '@/entities/role.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { Helper } from '@/utils';
import { AbstractRepository } from '@/common/repositories/abstract.repository';

@Injectable()
export class RoleService extends AbstractRepository<Role> {
  constructor(
    @InjectRepository(Role)
    private rolesRepo: Repository<Role>,
  ) {
    super(rolesRepo, Role.name);
  }

  async createRole({ name, title, description }: CreateRoleDto) {
    const savedRole = await this.create({
      name,
      title,
      description,
    });
    return {
      message: 'Role created successfully',
      role: savedRole,
    };
  }

  async findAllRoles(query: PaginationQueryDto) {
    const roles = await this.findAndCount({
      ...Helper.getPaginationParams(query),
    });

    return Helper.paginateResponse({
      data: roles,
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }

  async findRoleById(id: string) {
    const role = await this.findOne({
      where: { id },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto) {
    const foundRole = await this.findOne({
      where: { id },
    });

    if (!foundRole) {
      throw new NotFoundException('Role not found');
    }

    Object.assign(foundRole, updateRoleDto);
    await this.rolesRepo.save(foundRole);

    return {
      message: 'Role updated successfully',
      role: foundRole,
    };
  }

  async removeRole(id: string) {
    await this.remove(id);
    return {
      message: 'Role deleted successfully',
    };
  }

  async findRoles(options?: FindManyOptions<Role>) {
    return this.find(options);
  }

  async findRoleByName(name: string) {
    return this.findOne({ where: { name } });
  }
}
