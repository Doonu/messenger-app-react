import { ApiProfile, IUser } from './IUser';

export interface IMessage {
  id: number;
  content: string[];
  dialogId: number;
  userId: number;
  createdAt: number;
  updatedAt: number;
  author: IUser;
}

export interface APIMessage {
  id: number;
  content: string[];
  dialogId: number;
  userId: number;
  createdAt: number;
  updatedAt: number;
  author: ApiProfile;
}