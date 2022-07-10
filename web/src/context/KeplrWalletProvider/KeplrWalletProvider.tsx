import React, { useRef } from "react";
import { useState, useEffect } from "react";
import { SigningStargateClient } from "@cosmjs/stargate";
import { chainId, rpcEndpoint, uDenom, restEndpoint } from "@src/utils/constants";

type ContextType = {
  address: string;
  walletName: string;
  walletBalances: { UTODO: number };
  isKeplrInstalled: boolean;
  isKeplrConnected: boolean;
  connectWallet: () => Promise<void>;
  logout: () => void;
};

const KeplrWalletProviderContext = React.createContext<ContextType>({
  address: null,
  walletName: null,
  walletBalances: null,
  isKeplrInstalled: false,
  isKeplrConnected: false,
  connectWallet: null,
  logout: null
});

export const KeplrWalletProvider = ({ children }) => {
  const [_address, setAddress] = useState<string>(null);
  const [walletName, setWalletName] = useState<string>(null);
  const [walletBalances, setWalletBalances] = useState<{ UTODO: number }>(null);
  const [isKeplrInstalled, setIsKeplrInstalled] = useState<boolean>(false);
  const isMounted = useRef(true);

  useEffect(() => {
    console.log("useKeplr on mount");

    if (!!window.keplr) {
      setIsKeplrInstalled(true);

      if (localStorage.getItem("keplr_autoconnect")) {
        // loadWallet();
      }

      const onKeystoreChange = async () => {
        console.log("Key store in Keplr is changed.");

        const wallet = await window.keplr.getKey(chainId);

        setAddress(wallet.bech32Address);
        setWalletName(wallet.name);
      };

      window.addEventListener("keplr_keystorechange", onKeystoreChange);

      return () => {
        isMounted.current = false;

        console.log("useKeplr on unmount");

        window.removeEventListener("keplr_keystorechange", onKeystoreChange);
      };
    }
  }, []);

  async function getStargateClient() {
    const offlineSigner = window.keplr.getOfflineSigner(chainId);
    const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, offlineSigner);

    return client;
  }

  function logout(): void {
    setAddress(null);
    setWalletName(null);
    setWalletBalances(null);

    localStorage.removeItem("keplr_autoconnect");
  }

  async function connectWallet(): Promise<void> {
    console.log("connecting to keplr");

    await suggestKeplrChain();
    //await window.keplr.enable(chainId);

    await loadWallet();

    localStorage.setItem("keplr_autoconnect", "true");
  }

  async function loadWallet(): Promise<void> {
    let wallet = null;
    try {
      wallet = await window.keplr.getKey(chainId);
    } catch (err) {
      console.error(err);
      return;
    }

    if (!isMounted.current) return;

    setAddress(wallet.bech32Address);
    setWalletName(wallet.name);

    const client = await getStargateClient();
    const balances = await client.getAllBalances(wallet.bech32Address);
    console.log(balances);
    const balance = balances.find(b => b.denom === uDenom);

    setWalletBalances({
      UTODO: balance ? parseInt(balance.amount) : 0
    });
  }

  return (
    <KeplrWalletProviderContext.Provider
      value={{ address: _address, walletName, walletBalances, isKeplrInstalled, isKeplrConnected: !!walletName, connectWallet, logout }}
    >
      {children}
    </KeplrWalletProviderContext.Provider>
  );
};

async function suggestKeplrChain() {
  await window.keplr.experimentalSuggestChain({
    // Chain-id of the Osmosis chain.
    chainId: chainId,
    // The name of the chain to be displayed to the user.
    chainName: "TODO",
    // RPC endpoint of the chain. In this case we are using blockapsis, as it's accepts connections from any host currently. No Cors limitations.
    rpc: rpcEndpoint,
    // REST endpoint of the chain.
    rest: restEndpoint,
    // Staking coin information
    stakeCurrency: {
      // Coin denomination to be displayed to the user.
      coinDenom: "TODO",
      // Actual denom (i.e. uatom, uscrt) used by the blockchain.
      coinMinimalDenom: uDenom,
      // # of decimal points to convert minimal denomination to user-facing denomination.
      coinDecimals: 6
      // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
      // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
      // coinGeckoId: ""
    },
    bip44: {
      // You can only set the coin type of BIP44.
      // 'Purpose' is fixed to 44.
      coinType: 118
    },
    // Bech32 configuration to show the address to user.
    // This field is the interface of
    bech32Config: {
      bech32PrefixAccAddr: "TODO",
      bech32PrefixAccPub: "TODO",
      bech32PrefixValAddr: "TODO",
      bech32PrefixValPub: "TODO",
      bech32PrefixConsAddr: "TODO",
      bech32PrefixConsPub: "TODO"
    },
    // List of all coin/tokens used in this chain.
    currencies: [
      {
        // Coin denomination to be displayed to the user.
        coinDenom: "TODO",
        // Actual denom (i.e. uatom, uscrt) used by the blockchain.
        coinMinimalDenom: uDenom,
        // # of decimal points to convert minimal denomination to user-facing denomination.
        coinDecimals: 6
        // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
        // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
        // coinGeckoId: ""
      }
    ],
    // List of coin/tokens used as a fee token in this chain.
    feeCurrencies: [
      {
        // Coin denomination to be displayed to the user.
        coinDenom: "TODO",
        // Actual denom (i.e. uosmo, uscrt) used by the blockchain.
        coinMinimalDenom: uDenom,
        // # of decimal points to convert minimal denomination to user-facing denomination.
        coinDecimals: 6,
        // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
        // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
        coinGeckoId: "dig-chain"
      }
    ],
    coinType: 118,
    // Make sure that the gas prices are higher than the minimum gas prices accepted by chain validators and RPC/REST endpoint.
    gasPriceStep: {
      low: 0.01,
      average: 0.025,
      high: 0.04
    }
  });
}

// Hook
export function useKeplr() {
  return { ...React.useContext(KeplrWalletProviderContext) };
}
