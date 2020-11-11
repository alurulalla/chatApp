import React, { useState } from 'react';
import classNames from 'classnames';
import moment from 'moment';
import { gql, useMutation } from '@apollo/client';

import { useAuthState } from '../../context/auth';
import { Button, OverlayTrigger, Popover, PopoverContent, Tooltip } from 'react-bootstrap';

const reactions = ['❤️', '😆', '😯', '😢', '😡', '👍', '👎'];

const REACT_TO_MESSAGE = gql`
    mutation reaction($uuid: String! $content: String!){
        reactToMessage(uuid:$uuid, 
                content: $content) {
                uuid
            }
        }
`;

export default function Message({ message }) {
    const { user } = useAuthState();
    const sent = message.from === user.username;
    const received = !sent;
    const [showPopover, setShowPopover] = useState(false);
    const reactionIcons = [...new Set(message.reactions.map((r) => r.content))];

    const [reactToMessge] = useMutation(REACT_TO_MESSAGE, {
        onError: err => console.log(err),
        onCompleted: data => setShowPopover(false)
    })

    const react = (reaction) => {
        console.log(`Reacting ${reaction} to message: ${message.uuid}`);
        reactToMessge({
            variables: {
                uuid: message.uuid,
                content: reaction
            }
        });
    }

    const reactButton = (
        <>
            <OverlayTrigger trigger='click' placement='top'
                onToggle={setShowPopover}
                transition={false}
                show={showPopover}
                rootClose
                overlay={
                    <Popover className='rounded-pill'>
                        <Popover.Content
                            className='d-flex mr-1 ml-1 px-0 py-1 align-items-center  react-button-popover '>
                            {reactions.map(reaction => (
                                <Button className='react-icon-button'
                                    variant='link' key={reaction}
                                    onClick={() => react(reaction)}>
                                    {reaction}
                                </Button>
                            ))}
                        </Popover.Content>
                    </Popover>
                }
            >
                <Button variant='link' className='px-2'>
                    <i className='far fa-smile'></i>
                </Button>
            </OverlayTrigger>

        </>
    );

    return (
        <>
            <div className={classNames('d-flex my-3', {
                'ml-auto': sent,
                'mr-auto': received
            })}>
                {sent && reactButton}
                <OverlayTrigger
                    placement={sent ? 'right' : 'left'}
                    overlay={
                        <Tooltip>
                            {moment(message.createdAt).format('MMM DD, YYYY @ h:mm a')}
                        </Tooltip>
                    }
                    transition={false}
                >

                    <div className={classNames('py-2 px-3 rounded-pill position-relative', {
                        'bg-primary': sent,
                        'bg-secondary': received
                    })}>
                        {message.reactions.length > 0 && (
                            <div className='reactions-div bg-secondary p-1 rounded-pill'>
                                {reactionIcons} {message.reactions.length}
                            </div>
                        )}
                        <p className={classNames({ 'text-white': sent })}>{message.content}</p>
                    </div>
                </OverlayTrigger>
                {received && reactButton}
            </div>
        </>
    )
}