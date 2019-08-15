import { ethers } from 'ethers'
import WalletMasterWithRefund from '../build/WalletMasterWithRefund.json'
import config from '../config.json'
import fs from 'fs'
import path from 'path'

const configPath = path.resolve(__dirname, '../config.json')

const deploy = async () => {
  const privateKey = config.PRIVATE_KEY
  const provider = new ethers.providers.JsonRpcProvider(config.JSON_RPC_URL)
  const deployer = new ethers.Wallet(privateKey, provider)

  const factory = new ethers.ContractFactory(
    WalletMasterWithRefund.abi,
    WalletMasterWithRefund.bytecode,
    deployer
  )

  console.log('Deploying wallet with refund master copy...')

  const masterCopy = await factory.deploy({
    gasLimit: 4500000,
    gasPrice: ethers.utils.parseUnits(config.GAS_PRICE, 'gwei')
  })

  await masterCopy.deployed()

  console.log('Deployed wallet with refund master copy at:', masterCopy.address)

  config.WALLET_MASTERCOPY = masterCopy.address

  fs.writeFile(configPath, JSON.stringify(config), err => {
    if (err) throw new Error(err)
    console.log(`Updated ${configPath}\n`)
  })
}

deploy()
