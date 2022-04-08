import React, { useEffect, useState } from 'react';
import './App.css';
import SelectCharacter from './Components/SelectCharacter';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants';
import myEpicGame from './utils/MyEpicGame.json';
import { ethers } from 'ethers';
import Arena from './Components/Arena';
import LoadingIndicator from './Components/LoadingIndicator';

const App = () => {

  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  
  const checkIfWalletIsConnected = async () => {

    try {
      const { ethereum } = window;
  
      if(!ethereum){
        console.log('Make sure you have MetaMask!');
        setIsLoading(false);
        return;
      } 
      else {
        console.log("We have the ethereum object!", ethereum);
        const accounts = await ethereum.request({method: 'eth_accounts'});
  
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          setCurrentAccount(account);
        } else {
          console.log("No authorized account found");
        }
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  const renderContent = () => {

    if(isLoading){
      return <LoadingIndicator/>;
    }
    if(!currentAccount) {
      return (
        <div className="connect-wallet-container">
            <img                       
src="https://64.media.tumblr.com/2b8584bada491c0cdedcd34794f5f984/tumblr_ppjq6f27nH1r4q876o8_540.gifv"
              alt="Marvel Gif"
            />
            <button
              className="cta-button connect-wallet-button"
              onClick={connectWalletAction}
            >
              Connect Wallet To Get Started
            </button>
          </div>
      );
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT}/>;
    } else if (currentAccount && characterNFT) {
      return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT}/>;
    }
  };

  const checkNetwork = async () => {
    try {
      if(window.ethereum.networkVersion !== '4'){
        alert("Please connect to Rinkeby!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum){
        alert('GetMetaMask!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log("connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log("checking for Character NFT on address:", currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      const txn = await gameContract.checkIfUserHasNFT();
      if(txn.name){
        console.log('user has character nft');
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log('No character NFT found');
      }

      setIsLoading(false);
    };

    if(currentAccount){
      console.log("CurrentAccount:", currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);
  
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Metaverse Boss Battle ⚔️</p>
          <p className="sub-text">Team up to protect the Metaverse!</p>
          {renderContent()}
        </div>
        <div className="footer-container">
          <a
            className="footer-text"
            target="_blank"
            rel="noreferrer"
          >Let's build together!</a>
        </div>
      </div>
    </div>
  );
};

export default App;
