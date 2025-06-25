const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
require('dotenv').config();
//require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });


const typeDefs = require('./src/typeDefs');
const resolvers = require('./src/resolvers');

async function startServer() {

  const app = express();
  app.use(express.json());
  app.use(cors());


  const server = new ApolloServer({
    typeDefs,
    resolvers
  });

  await server.start();
  server.applyMiddleware({ app });

  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ MongoDB connected');
      app.listen({ port: 4000 }, () =>
        console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
      );
    })
    .catch(err => console.error('❌ MongoDB connection error:', err));
}

startServer();
