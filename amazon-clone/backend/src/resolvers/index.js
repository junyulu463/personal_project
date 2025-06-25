const productResolver = require('./productResolver');
const userResolver = require('./userResolver');
const orderResolver = require('./orderResolver');
const uploadResolver = require('./uploadResolver');

module.exports = {
  Query: {
    ...productResolver.Query,
    ...userResolver.Query,
    ...orderResolver.Query,
  },
  Mutation: {
    ...productResolver.Mutation,
    ...userResolver.Mutation,
    ...orderResolver.Mutation,
    ...uploadResolver.Mutation,  
  }
};
