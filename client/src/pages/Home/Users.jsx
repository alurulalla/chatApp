import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { Col, Image } from 'react-bootstrap';
import { useMessagesDispatch, useMessagesState } from '../../context/message';
import classNames from 'classnames';

const GET_USERS = gql`
    query getUsers{
        getUsers {
            username
            imageUrl
            createdAt
            latestMessage {
                uuid
                from
                to
                createdAt
                content
                }
            }
    }
`;

export default function Users() {
    const dispatch = useMessagesDispatch();
    const { users, selectedUser } = useMessagesState();

    const { loading } = useQuery(GET_USERS, {
        onCompleted: data => dispatch({ type: 'SET_USERS', payload: data.getUsers }),
        onError: err => console.log(err)
    });

    const setSelectedUser = (username) => {
        dispatch({ type: 'SET_SELETED_USER', payload: username })
    }

    let usersMarkup;
    if (!users || loading) {
        usersMarkup = (<p>Loading...</p>)
    } else if (users.length === 0) {
        usersMarkup = (<p>No Users have joined yet</p>)
    } else if (users.length > 0) {
        usersMarkup = users.map(user => {
            const isSlected = selectedUser === user.username;
            return (
                <div
                    role='button'
                    className={classNames(`user-div d-flex p-3 justify-content-center
                    justify-content-md-start`, { 'bg-white': isSlected })}
                    key={user.username} onClick={() => setSelectedUser(user.username)}>
                    <Image src={user.imageUrl || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} className='user-image' />
                    <div className='d-none d-md-block ml-2'>
                        <p className='text-success'>{user.username}</p>
                        <p className='font-weight-light'>
                            {user.latestMessage ? user.latestMessage.content : 'You are now connected!'}
                        </p>
                    </div>
                </div>
            )
        })
    }
    return (
        <Col xs={2} md={4} className='p-0 bg-secondary'>
            {usersMarkup}
        </Col>
    )
}