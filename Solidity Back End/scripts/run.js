const main = async () => {
    const gameContractFactory = await hre.ethers.getContractFactory('MyEpicGame');
    const gameContract = await gameContractFactory.deploy(
        ["IronMan", "Hulk", "CaptainAmerica"], // Names
        [   "https://i.imgur.com/8L90G8S.png",
            "https://i.imgur.com/z0Y7KUL.png",
            "https://i.imgur.com/qolndcG.png"
        ],                                      // Images
        [150,300,200],                         // HP values
        [50, 25, 40],                          // Attack dmg values
        "Thanos",
        "https://i.imgur.com/s85IVKa.png",
        1000,
        50

    );
    await gameContract.deployed();
    console.log("Contract deployed to: ", gameContract.address);

    let txn;
    txn = await gameContract.mintHeroNFT(2);
    await txn.wait();

    txn = await gameContract.attackBoss();
    await txn.wait();

    txn = await gameContract.attackBoss();
    await txn.wait();

    let returnedTokenUri = await gameContract.tokenURI(1);
    console.log("Token URI:", returnedTokenUri);
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
