// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";
import "./libraries/Base64.sol";

contract MyEpicGame is ERC721 {

    struct HeroAttributes {
        uint characterIndex;
        string name;
        string imageURI;
        uint hp;
        uint maxHp;
        uint attackDamage;
    }

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    HeroAttributes[] defaultHeros;

    mapping(uint256 => HeroAttributes) public nftHolderAttributes;

    mapping(address => uint256) public nftHolders;

    event HeroNFTMinted(address sender, uint256 tokenId, uint256 characterIndex);
    event AttackComplete(uint newBossHp, uint newPlayerHp);

    struct BigBoss {
        string name;
        string imageURI;
        uint hp;
        uint maxHp;
        uint attackDamage;
    }

    BigBoss public bigBoss;

    constructor(
        string[] memory heroNames,
        string[] memory heroImageURIs,
        uint[] memory heroHp,
        uint[] memory heroAttackDmg,
        string memory bossName,
        string memory bossImageURI,
        uint bossHp,
        uint bossAttackDamage
    ) 
        ERC721("Heros", "HERO")
    {
        bigBoss = BigBoss({
            name: bossName,
            imageURI: bossImageURI,
            hp: bossHp,
            maxHp: bossHp,
            attackDamage: bossAttackDamage
        });

        console.log("Done initializing boss %s w/ HP %s, img %s", bigBoss.name, bigBoss.hp, bigBoss.imageURI);

        for(uint i = 0; i< heroNames.length; i++) {
            defaultHeros.push(HeroAttributes({
                characterIndex: i,
                name: heroNames[i],
                imageURI: heroImageURIs[i],
                hp: heroHp[i],
                maxHp: heroHp[i],
                attackDamage: heroAttackDmg[i]
            }));

            HeroAttributes memory c = defaultHeros[i];
            console.log("Done initializing %s w/ HP %s, img %s", c.name, c.hp, c.imageURI);
        }

        _tokenIds.increment();
    }

    function mintHeroNFT(uint _heroIndex) external {
        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);

        nftHolderAttributes[newItemId] = HeroAttributes({
            characterIndex: _heroIndex,
            name: defaultHeros[_heroIndex].name,
            imageURI: defaultHeros[_heroIndex].imageURI,
            hp: defaultHeros[_heroIndex].hp,
            maxHp: defaultHeros[_heroIndex].maxHp,
            attackDamage: defaultHeros[_heroIndex].attackDamage
        });

        console.log("Minted NFT w/ tokenID %s and characterIndex %s", newItemId, _heroIndex);

        nftHolders[msg.sender] = newItemId;

        _tokenIds.increment();
        emit HeroNFTMinted(msg.sender, newItemId, _heroIndex);
    }

    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        HeroAttributes memory herAttributes = nftHolderAttributes[_tokenId];

        string memory strHp = Strings.toString(herAttributes.hp);
        string memory strMaxHp = Strings.toString(herAttributes.maxHp);
        string memory strAttackDamage = Strings.toString(herAttributes.attackDamage);

        string memory json = Base64.encode(
            abi.encodePacked(
            '{"name": "',
            herAttributes.name,
            ' -- NFT #: ',
            Strings.toString(_tokenId),
            '", "description": "This is an NFT that lets people play in the game Metaverse Boss Battle!", "image": "ipfs://',
            herAttributes.imageURI,
            '", "attributes": [ { "trait_type": "Health Points", "value": ',strHp,', "max_value":',strMaxHp,'}, { "trait_type": "Attack Damage", "value": ',
            strAttackDamage,'} ]}'
            )
        );

        string memory output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        return output;
    }

    function checkIfUserHasNFT() public view returns (HeroAttributes memory) {
        // get the tokenId of the user's character NFT
        uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
        // If the user has a tokenId in the map, return their character.
        if (nftTokenIdOfPlayer > 0){
            return nftHolderAttributes[nftTokenIdOfPlayer];
        } else {
            // Else, return an empty character
            HeroAttributes memory emptyStruct;
            return emptyStruct;
        }
    }

    function getAllDefaultcharacters() public view returns (HeroAttributes[] memory) {
        return defaultHeros;
    }

    function getBigBoss() public view returns (BigBoss memory) {
        return bigBoss;
    }

    function attackBoss() public {
        uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
        HeroAttributes storage player = nftHolderAttributes[nftTokenIdOfPlayer];
        console.log("\nPlayer w/ character %s about to attack. Has %s HP and %s AD", player.name, player.hp, player.attackDamage);
        console.log("Boss %s has %s HP and %s AD", bigBoss.name, bigBoss.hp, bigBoss.attackDamage);
    
        require ( player.hp > 0, "Error: Your hero must have HP to attack the boss!");
        require ( bigBoss.hp > 0, "Error: boss must have HP to attack boss");

        if (bigBoss.hp < player.attackDamage) {
            bigBoss.hp = 0;
        } else {
            bigBoss.hp = bigBoss.hp - player.attackDamage;
        }

        if (player.hp < bigBoss.attackDamage) {
            player.hp = 0;
        } else {
            player.hp = player.hp - bigBoss.attackDamage;
        }

        // Console for ease.
        console.log("Player attacked boss. New boss hp: %s", bigBoss.hp);
        console.log("Boss attacked player. New player hp: %s\n", player.hp);
        emit AttackComplete(bigBoss.hp, player.hp);
    }
}