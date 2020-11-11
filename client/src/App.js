import React from 'react';
import { BrowserRouter, Switch } from 'react-router-dom';

import ApolloProvider from './ApolloProvider';
import './App.scss';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import { Container } from 'react-bootstrap';
import HomePage from './pages/Home/Home';
import { AuthProvider } from './context/auth';
import DynamicRoute from './util/DynamicRoutes';
import { MessagesProvider } from './context/message';

function App() {
  return (
    <ApolloProvider>
      <AuthProvider>
        <MessagesProvider>
          <BrowserRouter>
            <Container className='pt-5'>
              <Switch>
                <DynamicRoute
                  path='/'
                  exact
                  component={HomePage}
                  authenticated
                />
                <DynamicRoute path='/register' component={RegisterPage} guest />
                <DynamicRoute path='/login' component={LoginPage} guest />
              </Switch>
            </Container>
          </BrowserRouter>
        </MessagesProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;
