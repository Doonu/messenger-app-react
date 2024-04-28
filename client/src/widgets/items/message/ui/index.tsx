import React, { FC, MouseEvent } from 'react';
import {
  SContainer,
  SContainerPhotoProfile,
  SMessageBlock,
  SMessagesUser,
  SName,
  STitle,
} from './message.styled';
import { IChat } from 'pages/private/chat/model/IChat';
import { getTime } from 'shared/util/time';
import MessageItem from './messageItem';
import PhotoProfile from 'components/custom/profiles/photo';

interface IMessage extends IChat {
  handlerChoice: (id: number) => void;
  handlerUpdate: (event: MouseEvent<HTMLDivElement>, id: number) => void;
  choiceMessages: number[];
}

const Message: FC<IMessage> = ({
  messages,
  handlerChoice,
  createdAt,
  author,
  choiceMessages,
  handlerUpdate,
}) => {
  return (
    <SContainer>
      <SContainerPhotoProfile>
        <PhotoProfile img={author.avatar} name={author.name} />
      </SContainerPhotoProfile>
      <SMessagesUser>
        <STitle>
          <SName>{author.name}</SName>
          <span>{getTime(createdAt)}</span>
        </STitle>
        <SMessageBlock>
          {messages.map((messageItem, index) => (
            <MessageItem
              key={messageItem.id}
              handlerUpdate={handlerUpdate}
              choiceMessages={choiceMessages}
              handlerChoice={handlerChoice}
              messageItem={messageItem}
              index={index}
            />
          ))}
        </SMessageBlock>
      </SMessagesUser>
    </SContainer>
  );
};

export default Message;