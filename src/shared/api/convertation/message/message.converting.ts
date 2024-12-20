import { userConverting } from '@shared/api';
import { APIMessage, IMessage } from '@entities/dialogs';

export const messageConverting = (data: APIMessage): IMessage => ({
  id: data.id,
  content: data.content,
  dialogId: data.dialogId,
  userId: data.userId,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
  author: userConverting(data.author),
  readStatus: data.readStatus,
  status: data.status,
});
