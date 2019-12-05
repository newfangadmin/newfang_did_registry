const ethers = require('ethers');
const config = require('./config.json');
const fs = require('fs-extra');
const provider =  ethers.getDefaultProvider(config.network);

const wallet = new ethers.Wallet(config.private_key, provider);
console.log(`Loaded wallet ${wallet.address}`);

async function deploy(contract_name) {
  let compiled = require(`./build/${contract_name}.json`);

  console.log(`\nDeploying ${contract_name} in ${config["network"]}...`);
  let contract = new ethers.ContractFactory(
    compiled.abi,
    compiled.bytecode,
    wallet
  );
  let instance = await contract.deploy();

  console.log(`deployed at ${instance.address}`);
  config[`${contract_name}`] = instance.address;
  console.log("Waiting for the contract to get mined...");
  await instance.deployed();
  console.log("Contract deployed");
  fs.outputJsonSync(
    'config.json',
    config,
    {
      spaces: 2,
      EOL: "\n"
    }
  );

}

(async () => {
  await deploy("EthereumDIDRegistry");
})().catch(err => {
  console.error(err);
});
