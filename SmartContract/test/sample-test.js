const { expect } = require("chai");

describe("Greeter", function() {
  // it("Should return the new greeting once it's changed", async function() {
  //   const Greeter = await ethers.getContractFactory("Greeter");
  //   const greeter = await Greeter.deploy("Hello, world!");
    
  //   await greeter.deployed();
  //   expect(await greeter.greet()).to.equal("Hello, world!");

  //   await greeter.setGreeting("Hola, mundo!");
  //   expect(await greeter.greet()).to.equal("Hola, mundo!");
  // });

  it("Should return the new greeting once it's changed", async function() {
    const ORUFactory = await ethers.getContractFactory("ORU");
    const oruContract = await ORUFactory.deploy();
    
    await oruContract.deployed();
    const signer = await ethers.getSigner();
    

    console.log(await oruContract.currentStorageRoot());
    const data = await oruContract.connect(signer).populateTransaction.updateState(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x1111111111111111111111111111111111111111111111111111111111111111'
    );

    // I am adding data to the data field. This can be used to store the transaction data without processing it in the
    // smart contract
    data.data = `${data.data}FFFFFFFF`;
    const tx = await signer.sendTransaction(data);

    expect(await oruContract.currentStorageRoot()).to.be.equal('0x1111111111111111111111111111111111111111111111111111111111111111');
  });
});
