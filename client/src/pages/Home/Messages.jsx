import React, { Fragment, useEffect } from 'react';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { Col, Form } from 'react-bootstrap';
import { useMessagesDispatch, useMessagesState } from '../../context/message';
import Message from './Message';
import { useState } from 'react';
import { useAuthState } from '../../context/auth';

const GET_MESSAGES = gql`
    query($from: String!) {
        getMessages(from: $from) {
            uuid
            content
            from
            to
            createdAt
            reactions {
                uuid
                content
            }
        }
    }
`;

const SEND_MESSAGE = gql`
    mutation sendMessage($to: String!, $content: String!){
        sendMessage(to: $to, content: $content) {
            uuid
            from
            to
            content
            createdAt
        }
    }
`;


export default function Messages() {
    const [content, setContent] = useState('');
    const { selectedUser, userMessages } = useMessagesState();
    const messagesDispatch = useMessagesDispatch();
    const [getMessages, { loading: messagesLoading, data: messagesData }] = useLazyQuery(GET_MESSAGES);
    const [sendMessage] = useMutation(SEND_MESSAGE, {
        // onCompleted: data => messagesDispatch({
        //     type: 'ADD_MESSAGE', payload: {
        //         message: data.sendMessage
        //     }
        // }),
        onError: err => console.log(err)
    })

    useEffect(() => {
        if (selectedUser) {
            getMessages({
                variables: {
                    from: selectedUser
                }
            });
        }
    }, [selectedUser, getMessages]);

    useEffect(() => {
        if (messagesData) {
            const payload = {
                username: selectedUser,
                messages: messagesData.getMessages
            }
            messagesDispatch({ type: 'SET_USER_MESSAGES', payload })
        }
    }, [messagesData, selectedUser, messagesDispatch]);

    const submitMessage = (e) => {
        e.preventDefault();

        if (content.trim() === '' || !selectedUser) return

        // Mutation for sending the message
        const data = {
            to: selectedUser,
            content: content.trim()
        }
        sendMessage({ variables: data });
        setContent('');
    }
    let selectedChatMarkup;
    if (!userMessages && !messagesLoading) {
        selectedChatMarkup = <p className='info-text'>Select a friend</p>
    } else if (messagesLoading) {
        selectedChatMarkup = <p>Loading...</p>
    } else if (userMessages.messages.length > 0) {
        selectedChatMarkup = userMessages.messages.map((message, index) => (
            <Fragment key={message.uuid}>
                <Message message={message} />
                {index === message.length - 1 && (
                    <div className='invisible'>
                        <hr className='m-0' />
                    </div>
                )}
            </Fragment>
        ))
    } else if (userMessages.messages.length === 0) {
        selectedChatMarkup = <p className='info-text'>You are now connected! send your first message.</p>
    }
    return (
        <>
            <Col xs={10} md={8} className='p-0'>
                <div className='messages-box d-flex flex-column-reverse p-3'>
                    {selectedChatMarkup}
                </div>
                <div className='px-3 py-2'>
                    <Form onSubmit={submitMessage}>
                        <Form.Group className='d-flex align-items-center m-0'>
                            <Form.Control type='text'
                                className='message-input rounded-pill bg-secondary border-0 p-4'
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                placeholder='Type a message..' />
                            <i className="fas fa-paper-plane fa-2x text-primary ml-3"
                                onClick={submitMessage}
                                role='button'
                            ></i>
                        </Form.Group>
                    </Form>
                </div>
            </Col>
        </>
    )
}