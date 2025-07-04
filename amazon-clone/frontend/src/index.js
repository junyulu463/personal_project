import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ApolloProvider, InMemoryCache, ApolloClient } from '@apollo/client';
import { AuthProvider } from './context/AuthContext';
import { CheckoutProvider } from './context/CheckoutContext';


const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ApolloProvider client={client}>
    <AuthProvider>
      <CheckoutProvider>
        <App />
      </CheckoutProvider>
    </AuthProvider>
  </ApolloProvider>
);
