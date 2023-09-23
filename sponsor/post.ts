import { ethers } from "hardhat";
import { Contract } from "../typechain/Contract";
import { BigNumberish } from "ethers";

const MUMBAI_URL = process.env.MUMBAI_URL; 
const provider = new ethers.providers.JsonRpcProvider(MUMBAI_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!).connect(provider);
 
async function routes (fastify, options) {
    const coreContract = (await ethers.getContractAt("Contract", "0xEA254FA74E905d114fE62852C5639c6200c4A04c")).connect(signer) as Contract;
    
    fastify.post('/post', async (request, reply) => {

      const params = request.body as {
        signal: string, 
        root: BigNumberish,
        nullifierHash: BigNumberish, 
        proof: [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish]
      };

      // Construct and sign transaction 
      try {
        const result = await coreContract.verifyAndExecute(
          params.signal,
          params.root,
          params.nullifierHash,
          params.proof
        );
        
        const receipt = await result.wait();

        reply.code(200).send({receipt});
        return; 

      } catch (error) {
        reply.code(400).send(error.message);
        return;  
      }
    })
  }
  
  module.exports = routes