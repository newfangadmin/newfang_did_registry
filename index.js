const EthrDID = require('ethr-did');
const config = require('./config.json');
const Web3 = require('web3');
const ethers = require('ethers');

const currentProvider = new Web3.providers.HttpProvider(config.network);
// const provider = new ethers.providers.Web3Provider(currentProvider);

// const keypair = EthrDID.createKeyPair();

let wallet = new ethers.Wallet(config.private_key);
const ethrDid = new EthrDID({address: wallet.address, privateKey: wallet.privateKey, currentProvider, registry: config.EthereumDIDRegistry});

console.log(ethrDid.did);
