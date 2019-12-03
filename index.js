const EthrDID  = require('ethr-did');
const config = require('./config.json');
const Web3 = require('web3');

const currentProvider = new Web3.providers.HttpProvider(config.network);

const keypair = EthrDID.createKeyPair();
const ethrDid = new EthrDID(keypair, currentProvider);

await ethrDid.createSigningDelegate() // Adds a signing delegate valid for 1 day

console.log(ethrDid);
