import { ethers } from 'ethers'
import WalletFactory from '../build/WalletFactory.json'
import ProxyContract from '../build/Proxy.json'
import config from '../config.json'
import { getDeployData } from '@universal-login/contracts'
import fs from 'fs'
import path from 'path'

const configPath = path.resolve(__dirname, '../config.json')

const deploy = async () => {
  const privateKey = config.PRIVATE_KEY
  const provider = new ethers.providers.JsonRpcProvider(config.JSON_RPC_URL)
  const deployer = new ethers.Wallet(privateKey, provider)

  const walletMasterCopy = config.WALLET_MASTERCOPY
  const linkdropFactory = config.LINKDROP_FACTORY
  const relayerAddress = config.RELAYER_ADDRESS

  const factory = new ethers.ContractFactory(
    WalletFactory.abi,
    WalletFactory.bytecode,
    deployer
  )

  console.log('Deploying wallet factory...')

  const initData = getDeployData(ProxyContract, [walletMasterCopy, '0x0'])

  const walletFactory = await factory.deploy(
    initData,
    linkdropFactory,
    relayerAddress,
    {
      gasPrice: ethers.utils.parseUnits(config.GAS_PRICE, 'gwei')
    }
  )

  await walletFactory.deployed()

  console.log('Deployed wallet factory at:', walletFactory.address)

  config.WALLET_FACTORY = walletFactory.address

  fs.writeFile(configPath, JSON.stringify(config), err => {
    if (err) throw new Error(err)
    console.log(`Updated ${configPath}\n`)
  })
}

deploy()
