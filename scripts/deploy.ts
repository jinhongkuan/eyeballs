import { ethers } from 'hardhat'

const APP_ID = process.env.APP_ID;

async function main() {
    const worldIDAddress = await fetch('https://developer.worldcoin.org/api/v1/contracts')
        .then(res => res.json() as Promise<{ key: string; value: string }[]>)
        .then(res => res.find(({ key }) => key === 'mumbai.id.worldcoin.eth').value)

    const EyeballsCoreFactory = await ethers.getContractFactory('EyeballsCore')
    const eyeballsCore = await EyeballsCoreFactory.deploy(worldIDAddress, APP_ID, "open");

    await eyeballsCore.deployed()

    console.log('EyeballsCore deployed to:', eyeballsCore.address)
}

main().catch(error => {
    console.error(error)
    process.exitCode = 1
})
