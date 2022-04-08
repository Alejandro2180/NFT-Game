const main = async () => {
    const gameContractFactory = await hre.ethers.getContractFactory('MyEpicGame');
    const gameContract = await gameContractFactory.deploy(
        ["IronMan", "Hulk", "CaptainAmerica"], // Names
        [   "QmRCCoBtsNaLuzmfoyK5SzhYSpnGsooPDQXjzCPm99e57M",
            "QmQfWsU47GEvGDGgmMmi7Rv4rhdjMRogt5zB198sY69uTc",
            "QmQocCaCRcY6RTRU5JHzTKHKgeTsuYaxMNRfCF1agovcg7"
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
