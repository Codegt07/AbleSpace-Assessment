import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class TasksGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('join-task')
  handleJoinTask(
    client: Socket,
    taskId: string,
  ) {
    client.join(`task-${taskId}`);
  }

  @SubscribeMessage('join-workspace')
  handleJoinWorkspace(
    client: Socket,
    workspaceId: string,
  ) {
    client.join(`workspace-${workspaceId}`);
  }

  emitTaskUpdated(taskId: string) {
    this.server
      .to(`task-${taskId}`)
      .emit('task-updated', {
        taskId,
      });
  }

  emitWorkspaceTaskUpdated(
    workspaceId: string,
    taskId: string,
  ) {
    this.server
      .to(`workspace-${workspaceId}`)
      .emit('workspace-task-updated', {
        taskId,
      });
  }
}