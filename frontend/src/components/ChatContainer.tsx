import { useEffect, useRef } from 'react';
import { useChatStore } from '../stores/useChatStore';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';
import MessageSkeleton from './skeletons/MessageSkeleton';
import { useAuthStore } from '../stores/useAuthStore';
import { formatMessageTime } from '../lib/utils';

const ChatContainer = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const messages = useChatStore((state) => state.messages);
  const getMessages = useChatStore((state) => state.getMessages);
  const isMessagesLoading = useChatStore((state) => state.isMessagesLoading);
  const selectedUser = useChatStore((state) => state.selectedUser);
  const subscribeToMessages = useChatStore((state) => state.subscribeToMessages);
  const unsubscribeFromMessages = useChatStore((state) => state.unsubscribeFromMessages);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!selectedUser) return;
    getMessages(selectedUser._id);
    subscribeToMessages();

    return () => {
      unsubscribeFromMessages();
    };
  }, [getMessages, selectedUser, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages.length > 0)
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  if (isMessagesLoading)
    return (
      <div className='flex-1 flex flex-col overflow-auto'>
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );

  return (
    <div className='flex-1 flex flex-col overflow-auto'>
      <ChatHeader />
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.map((message) => (
          <div
            key={message._id}
            ref={messageEndRef}
            className={`chat ${message.senderId === authUser?._id ? 'chat-end' : 'chat-start'}`}
          >
            <div className='chat-image avatar'>
              <div className='size-10 rounded-full border'>
                <img
                  src={
                    message.senderId === authUser?._id
                      ? authUser?.profilePic || '/avatar.png'
                      : selectedUser?.profilePic || '/avatar.png'
                  }
                  alt={message.senderId === authUser?._id ? authUser?.fullName : selectedUser?.fullName}
                />
              </div>
            </div>
            <div className='chat-header mb-1'>
              <time className='text-xs opacity-50 ml-1'>{formatMessageTime(message.createdAt)}</time>
            </div>
            <div className='chat-bubble flex flex-col'>
              {message.image && (
                <img src={message.image} alt='Attachment' className='sm:max-w-[200px] rounded-md mb-2' />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
