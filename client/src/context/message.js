import React, { createContext, useContext, useReducer } from 'react';

let users;
let selectedUser;
let userMessages;

const MessagesStateContext = createContext();
const MessagesDispatchContext = createContext();

let messagesCopy;
let usersCopy;
let selectedUserIndex;

const messagesReducer = (state, { type, payload }) => {
  switch (type) {
    case 'SET_USERS':
      return {
        ...state,
        users: payload,
      };
    case 'SET_SELETED_USER':
      return {
        ...state,
        selectedUser: payload,
      };
    case 'SET_USER_MESSAGES':
      return {
        ...state,
        userMessages: payload,
      };
    case 'CLEAR_MESSAGES_STATE':
      return {
        users: null,
        selectedUser: null,
        userMessages: null,
      };
    case 'ADD_MESSAGE':
      const { message } = payload;
      message.reactions = [];
      messagesCopy = { ...state.userMessages };
      usersCopy = [...state.users];
      selectedUserIndex = usersCopy.findIndex(
        (u) => u.username === state.selectedUser
      );
      usersCopy[selectedUserIndex] = {
        ...usersCopy[selectedUserIndex],
        latestMessage: message,
      };
      return {
        ...state,
        userMessages: {
          ...userMessages,
          messages: [message, ...messagesCopy.messages],
        },
        users: usersCopy,
      };
    case 'ADD_REACTION':
      const { reaction } = payload;
      usersCopy = [...state.users];
      selectedUserIndex = usersCopy.findIndex(
        (u) => u.username === state.selectedUser
      );
      messagesCopy = { ...state.userMessages };
      // Make a shallow copy of user
      let userCopy = { ...usersCopy[selectedUserIndex] };
      // Find the index of the message that this reaction pertains to
      const messageIndex = messagesCopy.messages?.findIndex(
        (m) => m.uuid === reaction.message.uuid
      );
      if (messageIndex > -1) {
        // Make a shallow copy of user messages
        let mgsCopy = [...messagesCopy.messages];
        // Make a shallow copy of user message reactions
        let reactionsCopy = [...mgsCopy[messageIndex].reactions];

        const reactionIndex = reactionsCopy.findIndex(
          (r) => r.uuid === reaction.uuid
        );
        if (reactionIndex > -1) {
          // Reaction exists, update it
          reactionsCopy[reactionIndex] = reaction;
        } else {
          // New Reaction, add it
          reactionsCopy = [...reactionsCopy, reaction];
        }
        mgsCopy[messageIndex] = {
          ...mgsCopy[messageIndex],
          reactions: reactionsCopy,
        };
        messagesCopy = { ...messagesCopy, messages: mgsCopy };
      }
      return {
        ...state,
        userMessages: {
          ...userMessages,
          messages: messagesCopy.messages,
        },
      };
    default:
      throw new Error(`Unknown action type: ${type}`);
  }
};

export function MessagesProvider({ children }) {
  const [state, dispatch] = useReducer(messagesReducer, {
    users,
    selectedUser,
    userMessages,
  });

  return (
    <>
      <MessagesDispatchContext.Provider value={dispatch}>
        <MessagesStateContext.Provider value={state}>
          {children}
        </MessagesStateContext.Provider>
      </MessagesDispatchContext.Provider>
    </>
  );
}

export const useMessagesState = () => useContext(MessagesStateContext);
export const useMessagesDispatch = () => useContext(MessagesDispatchContext);
