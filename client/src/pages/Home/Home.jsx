import React, { useEffect } from 'react';
import { Button, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSubscription, gql } from '@apollo/client'

import { useAuthDispatch } from '../../context/auth';
import Users from './Users';
import Messages from './Messages';
import { useMessagesDispatch, useMessagesState } from '../../context/message';

const NEW_MESSAGE = gql`
        subscription newMessage {
        newMessage {
            uuid
            from
            to
            content
            createdAt
        }
    }
`;

const NEW_REACTION = gql`
        subscription newReaction {
        newReaction {
            uuid
            content
            message {
                uuid
                from
                to
            }
        }
    }
`;

export default function HomePage({ history }) {
    const dispatch = useAuthDispatch();
    const { selectedUser } = useMessagesState();
    const messagesDispatch = useMessagesDispatch();
    const { data: messageData, error: messageError } = useSubscription(NEW_MESSAGE);
    const { data: reactionData, error: reactionError } = useSubscription(NEW_REACTION);

    useEffect(() => {
        if (messageError) console.log(messageError);

        if (messageData) {
            messagesDispatch({
                type: 'ADD_MESSAGE', payload: {
                    message: messageData.newMessage
                }
            })
        }
    }, [messageError, messageData, messagesDispatch]);

    useEffect(() => {
        if (reactionError) console.log(reactionError);

        if (reactionData) {
            const reaction = reactionData.newReaction;
            const otherUser = selectedUser === reaction.message.to ?
                reaction.message.from : reaction.message.to
            messagesDispatch({
                type: 'ADD_REACTION', payload: {
                    username: otherUser,
                    reaction
                }
            })
        }
    }, [reactionError, reactionData, messagesDispatch, selectedUser]);

    const logout = () => {
        dispatch({ type: 'LOGOUT', payload: {} });
        messagesDispatch({ type: 'CLEAR_MESSAGES_STATE' });
        window.location.href = '/login';
    }
    return (
        <>
            <Row className='bg-white justify-content-around mb-1'>
                <Link to='/login'>
                    <Button variant='link'>Login</Button>
                </Link>
                <Link to='/register'>
                    <Button variant='link'>Register</Button>
                </Link>
                <Button variant='link' onClick={logout}>Logout</Button>
            </Row>
            <Row className='bg-white'>
                <Users />
                <Messages />
            </Row>
        </>
    );
}