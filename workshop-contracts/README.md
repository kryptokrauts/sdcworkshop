# Development

## Prerequisites
- Git
- NodeJS 16+
- Yarn

## Workshop Contracts

During the workshop, 3 different contracts will be created where the Blockchain Testing Library [VeRT](https://github.com/XPRNetwork/vert) is used for testing.

The exercise is to implemented the contract logic so that the predefined tests (`*.spec.ts`) are passing.

For each Smart Contract, the required scaffold is already provided and includes hints referring to the documentation.

The contracts can be compiled and tested by executing the following commands within the current folder.

Note:
- Don't forget to run `yarn` / `yarn install` first.

Have fun! :-)

### 1. Hello World

```
yarn build:helloworld && yarn test:helloworld
```

### 2. Guestbook

```
yarn build:guestbook && yarn test:guestbook
```

### 3. Token Receiver

```
yarn build:tknreceiver && yarn test:tknreceiver
```

# Contract Deployment

- In order to allow a deployed contract to execute InlineActions, the account needs to add the special permission `<accountname>@eosio.code`.
- When using the CLI to deploy a contract, the permission is set automatically. If you choose to deploy the contract via explorer, you need to set the permission manually if it is needed.

## Via CLI (recommended)
1. Install Proton CLI
    ```
    yarn global add @proton/cli
    ```

    Note: By default, the CLI is configured to use testnet. You can switch to mainnet by executing `proton chain:set proton`

2. Create Account (max.)
    ```
    proton account:create wshellotest1
    ```

    Note:
    - Choose your own account name and replace the account in following commands.
    - You will be prompted to provide several infos (leave private key empty to generate a new one)
        - Optionally, you can choose to encrypt your private key / mnemonic
        - Make sure to backup your private key / mnemonic securely!
    - For testnet you can use any E-Mail address, confirmation code is always `000000`
    - For mainnet you need to provide an E-Mail address where you have access in order to receive and confirm the correct confirmation code

    ```sh
    Enter email for verification code: test@notneeded.com
    Enter display name for account: wshellotest1
    Enter 6-digit verification code (sent to test@notneeded.com): 000000
    Account wshellotest1 successfully created!
    ```

3. Claim XPR from Faucet
    ```
    proton faucet:claim XPR wshellotest1
    ```

    Note: XPR is needed to buy RAM. Alternatively you can fund the account by sending XPR to it from another wallet.

3. Buy RAM
    ```
    proton ram:buy wshellotest1 wshellotest1 300000
    ```

    Note: Sufficient RAM is required to deploy a contract on XPR Network.

4. Deploy Contract
    ```
    proton contract:set wshellotest1 0-hello-world/target
    ```

5. Call Action
    ```
    proton action wshellotest1 sayhello 'wshellotest1' wshellotest1@active
    ```

## Via Explorer

1. Visit the explorer
    - Testnet: https://testnet.explorer.xprnetwork.org
    - Mainnet: https://explorer.xprnetwork.org

2. Connect [WebAuth Wallet](https://wauth.co)

3. Switch to Utilities (Upload Contract)
    - https://testnet.explorer.xprnetwork.org/wallet/utilities/upload-contract

4. Select WASM and ABI

    - After compilation, the WASM and ABI files can be found in the `<contract>/target` folder

5. Deployment
    - Click on "Upload"
    - Sign the transaction with your WebAuth Wallet

6. (Optional, if needed) Enable InlineActions
    - Add permission `eosio.code` of account to the **Active** permission of the account
    - Note:
        - For security reasons, WebAuth Wallet currently doesn't allow to sign transactions that change account permissions.
        - Use CLI (Mainnet & Testnet), Anchor Desktop (Mainnet & Testnet) or Anchor Mobile (Mainnet only) to change permissions of the account.