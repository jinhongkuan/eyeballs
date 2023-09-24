import { ethers } from "hardhat";

const MUMBAI_URL = process.env.MUMBAI_URL; 
const provider = new ethers.providers.JsonRpcProvider(MUMBAI_URL);


async function routes (fastify, options) {
    fastify.get('/', async (request, reply) => {
        const balance = await provider.getBalance(process.env.SPONSOR_PUBLIC_KEY!); 

        reply.code(200).send({
            "walletAddress": process.env.SPONSOR_PUBLIC_KEY, 
            "status": "active",
            "balance":  balance.toBigInt().toString()
        });
        return;
    })
}

module.exports = routes; 