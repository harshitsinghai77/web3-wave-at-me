const main = async () => {
  const [owner, randomPerson] = await hre.ethers.getSigners();
  const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
  const waveContract = await waveContractFactory.deploy({
    value: hre.ethers.utils.parseEther("0.001"),
  });
  await waveContract.deployed();

  console.log("Contract deployed to:", waveContract.address);
  console.log("Contract deployed by:", owner.address);

  let contractBalance = await hre.ethers.provider.getBalance(
    waveContract.address
  );
  console.log(
    "Contract balance:",
    hre.ethers.utils.formatEther(contractBalance)
  );

  let waveCount;
  waveCount = await waveContract.getTotalWaves();
  console.log("waveCount before: ", waveCount.toString());

  let waveTxn = await waveContract.wave("Something just like this");
  await waveTxn.wait();

  waveCount = await waveContract.getTotalWaves();
  console.log("waveCount after: ", waveCount.toString());

  newTxn = await waveContract.connect(randomPerson);

  let wavetxn;
  wavetxn = await newTxn.wave("Hello World1");
  await wavetxn.wait();
  wavetxn = await newTxn.wave("Hello World2");
  await wavetxn.wait();

  console.log("waveCount after random person: ", waveCount.toString());

  let totalWavesAddress;
  totalWavesAddress = await waveContract.getWavesByAddress(
    randomPerson.address
  );
  console.log(
    "totalWaves by: %s is ",
    randomPerson.address,
    totalWavesAddress.toString()
  );

  totalWavesAddress = await waveContract.getWavesByAddress(
    "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
  );
  console.log(
    "totalWaves by: %s is ",
    waveContract.address,
    totalWavesAddress.toString()
  );

  let allWaves = await waveContract.getAllWaves();
  console.log(allWaves);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
