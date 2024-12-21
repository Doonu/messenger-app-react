import { createAsyncThunk } from '@reduxjs/toolkit';
import { API, userConverting } from '@shared/api';
import { IConfigAsyncThunk, IError } from '@shared/models';
import { AxiosError } from 'axios';
import { logout } from '@entities/auth';
import { ApiProfile, IUser } from '@entities/friends';

export const getProfile = createAsyncThunk<IUser, undefined, IConfigAsyncThunk>(
  'index/getProfile',
  async (_, { rejectWithValue, dispatch }) => {
    return API<ApiProfile>({
      url: `api/users/profile`,
      method: 'POST',
    })
      .then(({ data }) => userConverting(data))
      .catch(({ response }: AxiosError<IError>) => {
        // const title = response?.data || 'Неизвестная ошибка';
        dispatch(logout());
        // dispatch(
        //   showMessage({
        //     title,
        //     type: 'error',
        //     level: 'medium',
        //   })
        // );
        return rejectWithValue(response?.data);
      });
  }
);