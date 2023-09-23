import { ethers } from 'hardhat'

const APP_ID = process.env.APP_ID;

async function main() {
    const worldIDAddress = await fetch('https://developer.worldcoin.org/api/v1/contracts')
        .then(res => res.json() as Promise<{ key: string; value: string }[]>)
        .then(res => res.find(({ key }) => key === 'mumbai.id.worldcoin.eth').value)

    const ContractFactory = await ethers.getContractFactory('Contract')
    const contract = await ContractFactory.deploy(worldIDAddress, APP_ID, "open");

    await contract.deployed()

    console.log('Contract deployed to:', contract.address)
}

main().catch(error => {
    console.error(error)
    process.exitCode = 1
})
