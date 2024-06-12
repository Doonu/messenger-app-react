import { IMessage } from 'shared/models/IMessage';

interface IFilterNewMessages {
  fetchedData: IMessage[];
  limit: number;
  currentPage?: number;
}

interface IResponseFilterNewMessages {
  allMessages: IMessage[];
  newMessages: IMessage[];
}

export const filterNewMessages = ({
  fetchedData,
  limit,
  currentPage,
}: IFilterNewMessages): IResponseFilterNewMessages => {
  let resultData: IMessage[] = fetchedData;
  let newMessagesStack: IMessage[] = [];

  // if (fetchedData.find((el) => !el.readStatus)) {
  //   resultData = fetchedData.filter((el) => {
  //     if (!el.readStatus) {
  //       newMessagesStack.push(el);
  //       return false;
  //     }
  //     return true;
  //   });
  //   const page = currentPage
  //     ? currentPage + 1
  //     : Math.ceil((resultData.length + newMessagesStack.length) / limit + 1);
  // }

  return { allMessages: resultData, newMessages: newMessagesStack };
};
