export class DeleteTaskDto {
  status: OperationStatus;
}

export enum OperationStatus {
  OK = 'OK',
  ERROR = 'ERROR',
}
