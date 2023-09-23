import {  ethers } from "ethers";

const ARBITRIUM_RPC = process.env.ARBITRIUM_RPC; 

// Create transaction request to call on-chain function 
// const constructTransactionFromPostRequest = (): TransactionRequest => {

// }

async function routes (fastify, options) {
    fastify.get('/', async (request, reply) => {
      // Construct and sign transaction 
      return { hello: 'world' }
    })
  }
  
  module.exports = routes