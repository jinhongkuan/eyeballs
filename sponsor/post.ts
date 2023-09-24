import { ethers } from "hardhat";
import { EyeballsCore } from "../typechain/EyeballsCore";
import { BigNumberish, utils } from "ethers";

const MUMBAI_URL = process.env.MUMBAI_URL; 
const provider = new ethers.providers.JsonRpcProvider(MUMBAI_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!).connect(provider);
const abi = utils.defaultAbiCoder; 

async function routes (fastify, options) {
    const coreContract = (await ethers.getContractAt("EyeballsCore", process.env.EYEBALLS_CORE_MUMBAI_ADDRESS!)).connect(signer) as EyeballsCore;
    
    fastify.post('/post', async (request, reply) => {

      const params = request.body as {
        signal: string, 
        root: BigNumberish,
        nullifierHash: BigNumberish, 
        proof: string,
        referrerHash: BigNumberish
      };

      // Decode the proof

      // Construct and sign transaction 
      try {
        const result = await coreContract.payToView(
          params.signal,
          params.root,
          params.nullifierHash,
          abi.decode(['uint256[8]'], params.proof)[0],
          params.referrerHash
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