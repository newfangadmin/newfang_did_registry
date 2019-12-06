const assert = require('assert');
const ethers = require('ethers');
const config = require('../config.json');

const ganache = require('ganache-cli');
const provider = new ethers.providers.Web3Provider(ganache.provider({gasLimit: 8000000}));

const newfangJson = require('../build/NewfangDIDRegistry.json');

let wallet, newfangDID, accounts;
let IDs = [
  "0x4de0e96b0a8886e42a2c35b57df8a9d58a93b5bff655bc37a30e2ab8e29dc066",
  "0x3d725c5ee53025f027da36bea8d3af3b6a3e9d2d1542d47c162631de48e66c1c",
  "0x967f2a2c7f3d22f9278175c1e6aa39cf9171db91dceacd5ee0f37c2e507b5abe"
];

describe('Ganache Setup', async () => {
  it('initiates ganache and generates a bunch of demo accounts', async () => {
    accounts = await provider.listAccounts();
    wallet = provider.getSigner(accounts[0]);
    assert.ok(accounts.length >= 2, 'atleast 2 accounts should be present in the array');
  });
});

describe('Contract initialization, DID creation', async () => {
  it('Deploying the contract', async () => {
    const newfangContract = new ethers.ContractFactory(
      newfangJson.abi,
      newfangJson.bytecode,
      wallet
    );
    newfangDID = await newfangContract.deploy();
    await newfangDID.deployed();
    assert.ok(newfangDID.address, 'Newfang DID  Register deployed');
  });

  it('Create an DID', async () => {
    let tx = await newfangDID.functions.createDID(IDs[0]);
    await tx.wait();
    assert.ok(await newfangDID.functions.owners(IDs[0]) === await wallet.getAddress(),
      "Owner should be the person who calls the function");
  });

  it('Create an DID with same ID', async () => {
    try {
      let tx = await newfangDID.functions.createDID(IDs[0]);
      await tx.wait();
      assert(false, 'Should get an error');
    } catch (e) {
      assert.ok(e.message.includes('revert'), e.message)
    }
  });

});
