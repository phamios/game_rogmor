import { gql } from 'apollo-server-micro';

export const typeDefs = gql`
  type Profession {
    id: String,
    title: String,
    body: Int,
    reflex: Int,
    soul: Int,
    aura: Int,
    stamina: Int,
    focus: Int,
    morale: Int,
    sum: Int,
  }

  type Query {
    professions: [Profession]!
  }
`