import { createAsyncThunk } from '@reduxjs/toolkit';
import { API, userConverting } from '@shared/api';
import { IConfigAsyncThunk } from '@shared/models';
import { APINotifyItem, INotifyItem } from '@entities/notification';

import { IGetAllNotification } from './getAllNotification.type';

export const getAllNotification = createAsyncThunk<
  INotifyItem[],
  IGetAllNotification,
  IConfigAsyncThunk
>('notification/getAll', async ({ limit, page }, { rejectWithValue }) => {
  return API<APINotifyItem[]>({
    url: 'api/notifications',
    method: 'GET',
    params: { page, limit },
  })
    .then(({ data }) => {
      return data.map(({ id, createdAt, content, sender }) => {
        return {
          id,
          content,
          createdAt,
          sender: userConverting(sender),
        };
      });
    })
    .catch(({ response }) => {
      return rejectWithValue(response?.data);
    });
});