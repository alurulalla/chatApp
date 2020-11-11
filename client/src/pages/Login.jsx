import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { gql, useLazyQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { useAuthDispatch } from '../context/auth';

const USER_LOGIN = gql`
    query login($username: String!, $password: String!){
        login(username: $username, password: $password) {
            username
            email
            token
            createdAt
        }
    }
`

const LoginPage = ({ history }) => {
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [errors, setErrors] = useState({});

    const dispatch = useAuthDispatch();

    const [userLogin, { loading }] = useLazyQuery(USER_LOGIN, {
        onError(err) {
            console.log(err.graphQLErrors[0].extensions.errors);
            setErrors(err.graphQLErrors[0].extensions.errors);
        },
        onCompleted(data) {
            dispatch({ type: 'LOGIN', payload: data.login });
            // history.push('/');
            window.location.href = '/';
        }
    });

    const submitLoginForm = (e) => {
        e.preventDefault();
        const data = {
            password,
            username,
        };
        userLogin({ variables: data });

    };
    return (
        <>
            <Container className='pt-5'>
                <Row className='bg-white py-5 justify-content-center'>
                    <Col sm={8} md={6} lg={4}>
                        <h1 className='text-center'>Login</h1>
                        <Form onSubmit={submitLoginForm}>
                            <Form.Group>
                                <Form.Label
                                    className={errors.username && 'text-danger'}>
                                    {errors.username ?? 'Username'}
                                </Form.Label>
                                <Form.Control
                                    type='text'
                                    value={username}
                                    className={errors.username && 'is-invalid'}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label
                                    className={errors.password && 'text-danger'}>
                                    {errors.password ?? 'Password'}
                                </Form.Label>
                                <Form.Control
                                    type='password'
                                    value={password}
                                    className={errors.password && 'is-invalid'}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </Form.Group>
                            <div className='text-center'>
                                <Button variant='success' type='submit' disabled={loading}>
                                    {loading ? 'Loading...' : 'Login'}
                                </Button>
                                <br />
                                <small>Don't have an account? <Link to='/register'>Register</Link></small>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default LoginPage;