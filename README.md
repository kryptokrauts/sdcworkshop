# Developing Smart Contracts with TypeScript on XPR Network
This repository contains all contents of the workshop held at the [Social Developers Conference 2024](https://www.eventbrite.com/e/social-developers-conference-2024-tickets-780940292437) organized by the [Social Developers Club](https://socialdevelopersclub.de) in Hamburg, Germany.

The workshop is [sponsored by the XPR Network community](https://gov.xprnetwork.org/communities/6/proposals/65c25d8e86e4fa65cc393740).

## Workshop Contracts
During the workshop, participants will create 3 different [workshop-contracts](./workshop-contracts) to learn and understand core principles for creating & testing Smart Contracts on XPR Network.

For each of these contracts, the required contract files are already provided. The logic is missing and needs to be added by the participants with one single goal:
- Make the provided tests green! ;-)

#### Note
The first [hello-world](./workshop-contracts/0-hello-world) contract will be solved and demonstrated by the workshop facilitators to ensure everybody understands what needs to be done.

## XPR Rewards
Everybody who participates in the workshop, will be eligible to get XPR in two ways:

### Redemption of Gift Cards (Immediately, On-Site)
[Gift cards](https://metalx.com/news/virtual-crypto-gift-card) will be created and distributed to all on-site participants.

A paper will be handed out to each particpant that contains 2 QR codes:
- Link to download [WebAuth Wallet](https://wauth.co)
- Link to the Gift Card in order to claim the `3000.0000 XPR`

### Development of Smart Contracts (Homework)
A total amount of `900000.0000 XPR` is reserved to be claimed by workshop participants.

Workshop participants can develop a Smart Contract that executes a specific logic which will cause the [reward-contract](./reward-contract) deployed at [sdcworkshop](https://explorer.xprnetwork.org/account/sdcworkshop?loadContract=true&tab=Tables&limit=100) account to distribute an equal share of the XPR reward pool.

Any workshop participant can register for the homework task by creating an issue using [this form](../../issues/new?assignees=marc0olo&labels=registration&projects=&template=register-for-reward.yaml&title=%5BREGISTER%5D%3A+<xpr+account>) and providing their XPR account.

The solution needs to be implemented, deployed and executed within 30 days after the workshop. Eligibility to claim ends exactly at unix timestamp `1713180600` (Monday, 15 April 2024, 13:30:00).

Following steps are required in order to allow participants to claim the XPR reward:
1. Developer [registers](../../issues/new?assignees=marc0olo&labels=registration&projects=&template=register-for-reward.yaml&title=%5BREGISTER%5D%3A+<xpr+account>) for the reward task.
1. Workshop facilitator adds the XPR account of the developer to the list of eligible developers in the [reward-contract](./reward-contract) deployed at the [sdcworkshop](https://explorer.xprnetwork.org/account/sdcworkshop?loadContract=true&tab=Tables&limit=100) account.
1. (Optional, recommended) Developer provides a separate account where the homework contract which is used to claim the reward will be deployed at.
    - This can be done by calling the [`setctacc`](https://explorer.xprnetwork.org/account/sdcworkshop?loadContract=true&tab=Actions&limit=100&action=setctacc) action
1. Developer forks this repository and implements the missing logic in the [homework-contract](./homework-contract) which is required to claim the share of the reward pool.
1. Developer deploys the homework-contract at the registered (or separate, self-defined) account which should be used to claim the reward.
1. Developer performs a transaction with the homework-contract action that will trigger the claim and distribute the XPR to the account of the homework-contract.

#### Note
- Join the [Developer Chat](https://t.me/XPRNetwork/935158) on Telegram to ask questions related to Smart Contract development.
- Unclaimed shares of the reward pool will be returned to the [xprgrants](https://explorer.xprnetwork.org/account/xprgrants) account after 30 days.

#### Example XPR distribution
- 20 developers register
    - each developer can claim `900000.0000 XPR / 20 = 45000.0000 XPR`
- 10 developers successfully claim the reward by solving the homework task
    - `10 * 45000.0000 XPR = 450000.0000 XPR` will be returned to [xprgrants](https://explorer.xprnetwork.org/account/xprgrants)

## Links & Resources
- [Workshop Slides](./resources/20240316_sc-development-typescript-xpr-network.pdf)
- [XPR Network Development](https://xprnetwork.org)
    - [Discussion (Telegram)](https://t.me/XPRNetwork/935158)
    - [GitHub](https://github.com/XPRNetwork)
    - [Documentation](https://docs.xprnetwork.org/introduction/overview.html)
    - [Network Resources](https://resources.xprnetwork.org/storage)
    - [Blockchain Explorer](https://explorer.xprnetwork.org/)
    - [CLI](https://github.com/XPRNetwork/proton-cli)
    - [Blockchain Testing Library (VeRT)](https://github.com/XPRNetwork/vert)
    - [TypeScript Smart Contracts](https://github.com/XPRNetwork/ts-smart-contracts)
- [WebAuth Wallet](https://wauth.co) - Your Gateway to all dApps
- [Governance Dashboard](https://gov.xprnetwork.org)
- Ecosystem dApps
    - [Metal X](https://metalx.com) - DeFi platform
        - [Trading Bot](https://github.com/XPRNetwork/dex-bot)
    - [Metal Dollar](https://dollar.metalx.com) - Basket of bank reserve-backed stablecoins
    - [Metal Identity](https://identity.metallicus.com) - KYC process required to access compliance focused dApps
    - [BlastPad.io](https://snipverse.com) - Launch & Airdrop of Tokens
    - [Snipverse](https://snipverse.com) - Social Network
    - [Soon.Market](https://soon.market) - NFT marketplace
    - [Storex](https://storex.io) - E-Commerce platform