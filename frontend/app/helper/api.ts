import axios, { Axios } from "axios";
import { hexToBigInt, hexToNumber, hexToString } from "thirdweb";

export interface IApiClient {

}

export class ApiClient implements IApiClient {

    _axios: Axios;


    constructor() {
        this._axios = new Axios({ headers: { "Content-Type": "application/json", "Accept": "application/json" } });
    }

    /**
     * 
     * @param network 
     * @returns 
     */
    async getTokenBalances(userAddress: string, network?: string, removeZeroBalances: boolean = true, removeTickersWithWebsite: boolean = true): Promise<any> {
        try {
            console.log(`getTokenBalances(${userAddress}, ${network}, ${removeZeroBalances}, ${removeTickersWithWebsite})`);
            const baseURL = `https://${network}.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ETHEREUM_SEPOLIA_API_KEY}`;
            const postBody = JSON.stringify({
                "jsonrpc": "2.0",
                "method": "alchemy_getTokenBalances",
                "params": [
                    `${userAddress}`,
                ],
                "id": 42
            });

            const tokenBalancesResponse = await this._axios.post(baseURL, postBody);
            if (tokenBalancesResponse.status !== 200) {
                return;
            }

            let tokenBalances: { contractAddress: string, tokenBalance: string }[] = JSON.parse(tokenBalancesResponse.data).result.tokenBalances;
            const tokensFound = tokenBalances.length;
            if (removeZeroBalances) {
                tokenBalances = tokenBalances.filter((tokenBalance) => tokenBalance.tokenBalance !== "0x0000000000000000000000000000000000000000000000000000000000000000")
            }
            console.log(`${tokenBalances.length}/${tokensFound} tokens with a balance found.`);
            let userTokenDataPromises = tokenBalances.map(async (tokenBalance) => {
                const { decimals, logo, name, symbol } = await this.getTokenMetadata(tokenBalance.contractAddress, network);
                console.log(`Token (${tokenBalance.contractAddress}): ${decimals}, ${logo}, ${name}, ${symbol}`);

                return { ...tokenBalance, decimals, icon: logo, name, ticker: symbol }
            })
            const userTokenData = (await Promise.all(userTokenDataPromises));
            if (!removeTickersWithWebsite) {
                return userTokenData;
            }
            return userTokenData
                .filter(val => Boolean(val))
                .filter((token) => !/\./.test(token?.ticker))

        } catch (error) {
            console.log(`An error occurred whilst attempting to fetch token balances: ${error}`)
        }
    }

    async getTokenMetadata(tokenAddress: string | string[], network?: string): Promise<any> {
        try {
            const baseURL = `https://${network}.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ETHEREUM_SEPOLIA_API_KEY}`;
            const postBody = JSON.stringify({
                "jsonrpc": "2.0",
                "method": "alchemy_getTokenMetadata",
                params: [tokenAddress],
                "id": 1
            });

            const metadataResponse = await this._axios.post(baseURL, postBody);
            if (metadataResponse.status !== 200) {
                return;
            }
            const data = JSON.parse(metadataResponse.data).result;
            return data;
        } catch (error) {
            console.log(`Error fetching token metadata: ${error}`);
        }
    }

}