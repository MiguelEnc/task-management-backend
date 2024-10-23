import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TaskStatus } from '../task-status.enum';
import { CreateTaskDto } from '../dto/create-task.dto';
import { GetTasksFilteredDto } from '../dto/get-tasks-filtered.dto';
import { TaskRepository } from '../repository/task.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../entity/task.entity';
import { User } from '../../auth/entity/user.entity';

@Injectable()
export class TasksService {
  private logger = new Logger('TasksService');

  constructor(
    @InjectRepository(TaskRepository)
    private readonly tasksRepository: TaskRepository,
  ) {}

  async getTasks(filterDto: GetTasksFilteredDto, user: User): Promise<Task[]> {
    return this.tasksRepository.getTasks(filterDto, user);
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    return this.tasksRepository.createTask(createTaskDto, user);
  }

  async getTaskById(id: string, user: User): Promise<Task> {
    const foundTask = await this.tasksRepository.findOneBy({ id, user });
    if (!foundTask) {
      this.logger.error(`Error atempting to retrieve task ${id} by user ${user.username}. Task not found`);
      throw new NotFoundException(`Task with ID ${id} not found.`);
    }
    
    return foundTask;
  }
  
  async deleteTaskById(id: string, user: User): Promise<void> {
    const result = await this.tasksRepository.delete({ id, user });
    
    if (result.affected === 0) {
      this.logger.error(`Error atempting to delete task ${id} by user ${user.username}. Task not found`);
      throw new NotFoundException(`Task with ID ${id} not found.`);
    }
    this.logger.log(`User ${user.username} performed Delete action on task ${id}`);
  }

  async updateTaskStatusById(
    id: string,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);

    task.status = status;
    await this.tasksRepository.save(task);

    this.logger.log(`User ${user.username} performed status update on task ${id}`);

    return task;
  }
}
