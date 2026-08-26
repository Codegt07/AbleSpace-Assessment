export type TaskStatus = "To Do" | "Doing" | "Completed" | "On Hold";

export type TaskMember = {
  _id: string;
  userId: string;
  status: TaskStatus;
};

export type TaskResource = {
  _id: string;
  type: "link" | "file";
  name: string;
  url: string;
  mimeType?: string;
  size?: number;
  addedBy: string;
  publicId?: string;
  resourceType?: string;
};

export type Task = {
  _id: string;
  title: string;
  description?: string;
  type?: string;
  parentTaskId?: string | null;
  status: TaskStatus;
  priority?: string;
  members?: TaskMember[];
  createdBy: string;
  workspaceId: string;
  labels?: string[];
  resources?: TaskResource[];
  startDate?: string;
  dueDate?: string;
  allowMembersToAddMembers?: boolean;
  allowMembersToCreateSubtasks?: boolean;
  allowMembersToComment?: boolean;
};

export type TaskUpdate = {
  _id: string;
  taskId: string;
  userId: string;
  message: string;
  metadata?: Record<string, any> | null;
  createdAt: string;
};

export type TaskComment = {
  _id: string;
  taskId: string;
  userId: string;
  message: string;
  parentCommentId?: string | null;
  createdAt: string;
};

export type WorkspaceUser = {
  userId: string;
  name: string;
  username: string;
  avatar: string;
  title: string;
};

export type TaskSettings = {
  allowMembersToAddMembers: boolean;
  allowMembersToCreateSubtasks: boolean;
  allowMembersToComment: boolean;
};
