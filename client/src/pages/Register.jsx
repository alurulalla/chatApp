import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { gql, useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';

const REGISTER_USER = gql`
    mutation regigetUser($username: String!, $password: String!, $confirmPassword: String!, $email: String!) {
        register(username: $username, password: $password, 
        confirmPassword: $confirmPassword, email: $email) {
            username
            email
            createdAt
        }
} 
`

const RegisterPage = ({ history }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [errors, setErrors] = useState({});

    const [registerUser, { loading }] = useMutation(REGISTER_USER, {
        update(_, __) {
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setUsername('');
            history.push('/login');
        },
        onError(err) {
            console.log(err.graphQLErrors[0].extensions.errors);
            setErrors(err.graphQLErrors[0].extensions.errors);
        }
    });

    const submitRegisterForm = (e) => {
        e.preventDefault();
        const data = {
            email,
            password,
            confirmPassword,
            username,
        };
        registerUser({ variables: data });

    };
    return (
        <>
            <Container className='pt-5'>
                <Row className='bg-white py-5 justify-content-center'>
                    <Col sm={8} md={6} lg={4}>
                        <h1 className='text-center'>Register</h1>
                        <Form onSubmit={submitRegisterForm}>
                            <Form.Group>
                                <Form.Label
                                    className={errors.email && 'text-danger'}>
                                    {errors.email ?? 'Email address'}
                                </Form.Label>
                                <Form.Control
                                    type='email'
                                    value={email}
                                    className={errors.email && 'is-invalid'}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </Form.Group>
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
                            <Form.Group>
                                <Form.Label
                                    className={errors.confirmPassword && 'text-danger'}>
                                    {errors.confirmPassword ?? 'Confirm Password'}
                                </Form.Label>
                                <Form.Control
                                    type='password'
                                    value={confirmPassword}
                                    className={errors.confirmPassword && 'is-invalid'}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </Form.Group>
                            <div className='text-center'>
                                <Button variant='success' type='submit' disabled={loading}>
                                    {loading ? 'Loading...' : 'Register'}
                                </Button>
                                <br />
                                <small>Already have an account? <Link to='/login'>Login</Link></small>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default RegisterPage;