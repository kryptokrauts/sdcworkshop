import { expect } from 'chai';
import {
    Account,
    Blockchain,
    expectToThrow,
    mintTokens,
    nameToBigInt,
    protonAssert,
    symbolCodeToBigInt,
} from '@proton/vert';
import { Asset, Name } from '@greymass/eosio';

// create blockchain
const blockchain = new Blockchain();

// deploy token contracts
const eosioToken = blockchain.createContract('eosio.token', 'node_modules/proton-tsc/external/eosio.token/eosio.token');
const xtokens = blockchain.createContract('xtokens', 'node_modules/proton-tsc/external/xtokens/xtokens');

// deploy contract to test
// note: contract needs to be built before!
const tknreceiver = blockchain.createContract('tknreceiver', '2-token-receiver/target/token-receiver.contract');

// create accounts
const [xprholder, usdcholder, shitholder, fwdreceiver] = blockchain.createAccounts(
    'xprholder',
    'usdcholder',
    'shitholder',
    'fwdreceiver',
);

// helper to get account balance for specific token
const getAccountBalance = (contract: Account, accountName: string, symbol: string) => {
    const accountBigInt = nameToBigInt(Name.from(accountName));
    const symcodeBigInt = symbolCodeToBigInt(Asset.SymbolCode.from(symbol));
    return contract.tables.accounts(accountBigInt).getTableRow(symcodeBigInt).balance;
};

before(async () => {
    // mint tokens
    await mintTokens(xtokens, 'XSHIT', 4, 1_000_000, 500_000, [shitholder]);
    await mintTokens(eosioToken, 'XPR', 4, 100_000_000.0, 10_000_000, [xprholder]);
    await mintTokens(xtokens, 'XUSDC', 6, 2_588_268_654.84833, 20_000, [usdcholder]);
});

describe('Token Receiver', () => {
    it('block XSHIT tokens', async () => {
        await expectToThrow(
            xtokens.actions
                .transfer([shitholder.name, tknreceiver.name, `250000.0000 XSHIT`, 'test revert/throw'])
                .send(`${shitholder.name}@active`),
            protonAssert('we do not want XSHIT, keep it in your wallet!'),
        );
    });

    it('forward all XUSDC tokens', async () => {
        await xtokens.actions
            .transfer([usdcholder.name, tknreceiver.name, `10000.000000 XUSDC`, 'test forwarding'])
            .send(`${usdcholder.name}@active`);
        const usdcholderBalance = getAccountBalance(xtokens, usdcholder.name.toString(), 'XUSDC');
        const tknReceiverBalance = getAccountBalance(xtokens, tknreceiver.name.toString(), 'XUSDC');
        const fwdreceiverBalance = getAccountBalance(xtokens, fwdreceiver.name.toString(), 'XUSDC');
        expect(usdcholderBalance).equal(`10000.000000 XUSDC`);
        expect(tknReceiverBalance).equal(`0.000000 XUSDC`);
        expect(fwdreceiverBalance).equal(`10000.000000 XUSDC`);
    });

    it('foward 50% and keep 50% XPR tokens', async () => {
        await eosioToken.actions
            .transfer([xprholder.name, tknreceiver.name, `5000000.0000 XPR`, 'test keeping'])
            .send(`${xprholder.name}@active`);
        const xprholderBalance = getAccountBalance(eosioToken, xprholder.name.toString(), 'XPR');
        const tknReceiverBalance = getAccountBalance(eosioToken, tknreceiver.name.toString(), 'XPR');
        const fwdreceiverBalance = getAccountBalance(eosioToken, fwdreceiver.name.toString(), 'XPR');
        expect(xprholderBalance).equal(`5000000.0000 XPR`);
        expect(tknReceiverBalance).equal(`2500000.0000 XPR`);
        expect(fwdreceiverBalance).equal(`2500000.0000 XPR`);
    });
});
