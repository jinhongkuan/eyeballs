import { ethers } from 'hardhat'

const APP_ID = process.env.APP_ID;

async function main() {
    const worldIDAddresses = {
        "base_goerli": "0x78ec127a3716d447f4575e9c834d452e397ee9e1"
    };

    const EyeballsCoreFactory = await ethers.getContractFactory('EyeballsCore')
    const eyeballsCore = await EyeballsCoreFactory.deploy(worldIDAddresses["base_goerli"], APP_ID, "open");

    await eyeballsCore.deployed()

    console.log('EyeballsCore deployed to:', eyeballsCore.address)
}

main().catch(error => {
    console.error(error)
    process.exitCode = 1
})
