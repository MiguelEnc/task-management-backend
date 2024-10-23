import { DataSource, Repository } from 'typeorm';
import { Task } from '../entity/task.entity';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateTaskDto } from '../dto/create-task.dto';
import { TaskStatus } from '../task-status.enum';
import { GetTasksFilteredDto } from '../dto/get-tasks-filtered.dto';
import { User } from '../../auth/entity/user.entity';

@Injectable()
export class TaskRepository extends Repository<Task> {
  private logger = new Logger('TasksRepository', { timestamp: true });

  constructor(private dataSource: DataSource) {
    super(Task, dataSource.createEntityManager());
  }

  async getTasks(filterDto: GetTasksFilteredDto, user: User): Promise<Task[]> {
    const { search, status } = filterDto;

    const query = this.createQueryBuilder('task');
    query.where({ user });

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    try {
      const tasks = await query.getMany();
      return tasks;
    } catch (error) {
      this.logger.error(`Failed to retrieve tasks for user ${user.username}. Filters: ${JSON.stringify(filterDto)}`, error?.stack);
      throw new InternalServerErrorException();
    }
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;

    const task = this.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });

    try {
      await this.save(task);
    } catch (error) {
      this.logger.error(`Failed to create task for user ${user.username}`, error?.stack);
      throw new InternalServerErrorException();
    }

    return task;
  }
}
