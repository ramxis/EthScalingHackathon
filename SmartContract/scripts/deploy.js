async function main() {
  // We get the contract to deploy
  const ORUFactory = await ethers.getContractFactory("ORU");
  // TODO: last parameter has to be changed to orderer address;
  const oru = await ORUFactory.deploy('0xdc968aBc65F96822E8863A5f7279dDB50372c5d1', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');

  console.log("ORU deployed to:", oru.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });