import { ethers } from 'ethers'
import WalletFactory from '../build/WalletFactory.json'
import ProxyContract from '../build/Proxy.json'
import config from '../config.json'
import { getDeployData } from '@universal-login/contracts'
import fs from 'fs'
import path from 'path'
import { WalletSDK, utils } from '@linkdrop/sdk'

import csvToJson from 'csvtojson'
import queryString from 'query-string'

export const getUrlParams = async (type, i) => {
  const csvFilePath = path.resolve(__dirname, `../other/linkdrop_${type}.csv`)
  const jsonArray = await csvToJson().fromFile(csvFilePath)
  const rawUrl = jsonArray[i].url.replace('#', '')
  const parsedUrl = await queryString.extract(rawUrl)
  const parsed = await queryString.parse(parsedUrl)
  return parsed
}

// const linkdropSDK = new LinkdropSDK()

const configPath = path.resolve(__dirname, '../config.json')

const main = async () => {
  let privateKey = config.PRIVATE_KEY
  const provider = new ethers.providers.JsonRpcProvider(config.JSON_RPC_URL)
  const deployer = new ethers.Wallet(privateKey, provider)

  const walletMasterCopy = config.WALLET_MASTERCOPY
  const walletFactoryAddress = config.WALLET_FACTORY
  const linkdropFactory = config.LINKDROP_FACTORY
  const relayerAddress = config.RELAYER_ADDRESS
  const relayerPrivateKey = config.RELAYER_PRIVATE_KEY
  const relayer = new ethers.Wallet(relayerPrivateKey, provider)

  console.log(`Connecting to wallet factory at ${walletFactoryAddress}..`)

  const walletFactory = new ethers.Contract(
    walletFactoryAddress,
    WalletFactory.abi,
    relayer
  )

  const diff = await walletFactory.diff()
  console.log('diff: ', +diff)

  const label = await walletFactory.label()
  console.log('label: ', label)

  console.log('Creating new wallet sdk instance..')
  const walletSDK = new WalletSDK()

  let {
    privateKey: walletOwnerPrivateKey,
    contractAddress,
    publicKey
  } = await walletSDK.createFutureWallet()

  console.log({
    walletOwnerPrivateKey,
    contractAddress,
    publicKey
  })

  const {
    weiAmount,
    tokenAddress,
    tokenAmount,
    expirationTime,
    version,
    chainId,
    linkKey,
    linkdropMasterAddress,
    linkdropSignerSignature,
    campaignId
  } = await getUrlParams('eth', 3)

  const linkId = new ethers.Wallet(linkKey).address

  const receiverSignature = await utils.signReceiverAddress(
    linkKey,
    contractAddress
  )

  const { error, errors, success, txHash } = await walletSDK.claimAndDeploy(
    {
      weiAmount,
      tokenAddress,
      tokenAmount,
      expirationTime,
      linkKey,
      linkdropMasterAddress,
      linkdropSignerSignature,
      campaignId
    },
    {
      privateKey: walletOwnerPrivateKey,
      ensName: 'london.linkdrop.test'
    }
  )

  console.log({ error, errors, success, txHash })
}

const main2 = async () => {
  console.log('Creating new wallet sdk instance..')
  const walletSDK = new WalletSDK()

  const { txHash } = await walletSDK.deploy(
    '0x728b315afb0c92f3412c2969e118340f03037ac5fa47d0c876470ad5751c9862',
    'fdf.linkdrop.test'
  )
  console.log('txHash: ', txHash)
}

main2()
