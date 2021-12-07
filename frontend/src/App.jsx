import React, { useEffect, useState } from "react";
import Loader from "react-loader-spinner";
import { ethers } from "ethers";

import contractABI from "./artifacts/abi.json";
import "./App.css";

const contractAddress = "0x140519971Cc926577d5b50D0CFcb5d2Ee33BeD36";

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [waveMessage, setWaveMessage] = useState();
  const [allWaves, setAllWaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalWave, setTotalWave] = useState();

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length !== 0) {
      const account = accounts[0];
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const getCurrentTotalWave = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = ethers.getDefaultProvider("rinkeby");
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          provider
        );

        let count = await wavePortalContract.getTotalWaves();
        setTotalWave(count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = ethers.getDefaultProvider("rinkeby");
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          provider
        );

        const waves = await wavePortalContract.getAllWaves();
        let wavesCleaned = [];
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    getCurrentTotalWave();
    getAllWaves();

    let wavePortalContract;
    const onNewWave = async (from, timestamp, message) => {
      setAllWaves((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
      await getCurrentTotalWave();
    };

    if (window.ethereum) {
      const provider = ethers.getDefaultProvider("rinkeby");
      wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        provider
      );
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);

  const wave = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        setLoading(true);
        const waveTxn = await wavePortalContract.wave(waveMessage);
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined...", waveTxn.hash);

        await getCurrentTotalWave();
        setLoading(false);
        setWaveMessage("");
      } else {
        console.log("Ethereum object doesn't exist!");
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <span role="img" aria-label="wave">
            👋
          </span>
          Hey there!
        </div>
        <div className="bio">
          I am Harshit, Software Engineer currently based in India. Interested
          in Data Engineering, MLOps and Web3. Connect your Ethereum wallet and
          wave at me! You can find more about me{" "}
          <a
            href="https://fictionally-irrelevant.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            here.
          </a>
        </div>

        <div className="container-center">
          <label>Say Hi</label>
          <input
            type="text"
            className="container-input"
            placeholder="Type a message"
            style={{ height: "35px", width: "250px", padding: "0 15px" }}
            value={waveMessage}
            onChange={(e) => setWaveMessage(e.target.value)}
          />
        </div>

        <button
          className="waveButton container-center"
          onClick={wave}
          disabled={!waveMessage}
        >
          Wave at Me
          {loading && (
            <Loader
              type="TailSpin"
              color="#00BFFF"
              height={20}
              width={20}
              style={{ padding: "0px 12px" }}
            />
          )}
        </button>
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {totalWave > 0 && <div className="bio">Total waves {totalWave}</div>}

        {allWaves.map((wave, index) => {
          return (
            <div
              key={index}
              style={{
                backgroundColor: "OldLace",
                marginTop: "16px",
                padding: "8px",
              }}
            >
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
