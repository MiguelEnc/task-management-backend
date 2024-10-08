import { Injectable, NotFoundException } from '@nestjs/common';
import { Task, TaskStatus } from '../model/task.model';
import { v4 as uuid } from 'uuid';
import { CreateTaskDto } from '../dto/create-task.dto';
import { DeleteTaskDto, OperationStatus } from '../dto/delete-task.dto';
import { GetTasksFilteredDto } from '../dto/get-tasks-filtered.dto';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  getAllTasks(): Task[] {
    return this.tasks;
  }

  getTasksWithFilter(filterDto: GetTasksFilteredDto): Task[] {
    const { search, status } = filterDto;
    let filteredTasks = this.getAllTasks();

    if (status) {
      filteredTasks = filteredTasks.filter((t) => t.status === status);
    }
    if (search) {
      const lowerSearch = search.toLowerCase();
      filteredTasks = filteredTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(lowerSearch) ||
          task.description.toLowerCase().includes(lowerSearch),
      );
    }

    return filteredTasks;
  }

  createTask(createTaskDto: CreateTaskDto): Task {
    const { title, description } = createTaskDto;

    const task: Task = {
      id: uuid(),
      title,
      description,
      status: TaskStatus.OPEN,
    };

    this.tasks.push(task);
    return task;
  }

  getTaskById(id: string): Task {
    const foundTask = this.tasks.find((t) => t.id === id);

    if (!foundTask) {
      throw new NotFoundException(`Task with ID ${id} not found.`);
    }

    return foundTask;
  }

  deleteTaskById(id: string): DeleteTaskDto {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    const response: DeleteTaskDto = {
      status: OperationStatus.OK,
    };
    return response;
  }

  updateTaskStatusById(id: string, status: TaskStatus): Task {
    const task = this.getTaskById(id);
    task.status = status;
    return task;
  }
}
