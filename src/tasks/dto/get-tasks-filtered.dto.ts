import { TaskStatus } from '../model/task.model';

export class GetTasksFilteredDto {
  status?: TaskStatus;
  search?: string;
}
