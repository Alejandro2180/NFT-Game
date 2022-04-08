const CONTRACT_ADDRESS = '0x59023e1D16d42cc53b80778226EC9fA3EB0f26dB';

const transformCharacterData = (characterData) => {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
  };
}

export { CONTRACT_ADDRESS, transformCharacterData };