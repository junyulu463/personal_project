const { gql } = require('apollo-server-express');

const uploadTypeDef = gql`
  type Mutation {
    getPresignedUrl(fileName: String!, fileType: String!): String!
    deleteS3File(key: String!): Boolean!
  }
`;

module.exports = uploadTypeDef;
