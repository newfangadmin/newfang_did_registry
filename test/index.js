const assert = require('assert');
const ethers = require('ethers');

const ganache = require('ganache-cli');
const provider = new ethers.providers.Web3Provider(ganache.provider({gasLimit: 8000000}));

// const newfangJson = require('../build/Newfang');

let wallet, newfang, accounts;
let UEBS = [
  "FKWfOvpxIEnvjnEYGhizbRyByAvACVSHpTFHaBqAWXDJrcPYWYGw",
  "pjXrVHxInrwhwqvokmNEapyaJYwGCHzPXXjOMVpnWQShkvPmXUwU",
  "gtPzNRliziPRfcsiTpaSLpflYxmfdpxDRsXEzIfUeGenMNxIBzXi"
];

describe('Ganache Setup', async () => {
  it('initiates ganache and generates a bunch of demo accounts', async () => {
    accounts = await provider.listAccounts();
    wallet = provider.getSigner(accounts[0]);
    assert.ok(accounts.length >= 2, 'atleast 2 accounts should be present in the array');
  });
});
