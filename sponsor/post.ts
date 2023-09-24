import { ethers } from "hardhat";
import { EyeballsCore } from "../typechain/EyeballsCore";
import { BigNumberish, utils } from "ethers";

const provider = new ethers.providers.JsonRpcProvider(process.env.BASE_GOERLI_URL!);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!).connect(provider);
const abi = utils.defaultAbiCoder; 

async function routes (fastify, options) {
    const coreContract = (await ethers.getContractAt("EyeballsCore", process.env.EYEBALLS_CORE_BASE_GOERLI_ADDRESS!)).connect(signer) as EyeballsCore;
    
    fastify.post('/post', async (request, reply) => {

      const params = request.body as {
        signal: string, 
        root: BigNumberish,
        nullifierHash: BigNumberish, 
        proof: string,
        referrerHash: BigNumberish
      };
      // Construct and sign transaction 
      try {
        const gasPrice = await provider.getGasPrice();
        const result = await coreContract.payToView(
          params.signal,
          params.root,
          params.nullifierHash,
          abi.decode(['uint256[8]'], params.proof)[0],
          params.referrerHash,{
            gasPrice,
            gasLimit: 1000000
          }
        );
        const receipt = await provider.waitForTransaction(result.hash, 3, 10000);

        if (receipt.status == 1)
        reply.code(200).send({receipt});
        else 
        reply.code(400).send({receipt});

        return; 

      } catch (error) {
        reply.code(400).send(error.message);
        return;  
      }
    })
  }
  
  module.exports = routes