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
import { Asset, Name, TimePointSec } from '@greymass/eosio';

// create blockchain
const blockchain = new Blockchain();

// deploy contract to test
// note: contract needs to be built before!
const sdcworkshop = blockchain.createContract('sdcworkshop', 'xpr-reward-pool/target/xpr-reward-pool.contract');

// create accounts
const [developer1, developer2, unregistered, dummycontract, xprgrants] = blockchain.createAccounts(
    'developer1',
    'developer2',
    'unregistered',
    'dummycontract',
    'xprgrants',
);

// deploy contract for testing XPR
const eosioToken = blockchain.createContract('eosio.token', 'node_modules/proton-tsc/external/eosio.token/eosio.token');

// helper to get account balance for specific token
const getAccount = (contract: Account, accountName: string, symbol: string) => {
    const accountBigInt = nameToBigInt(Name.from(accountName));
    const symcodeBigInt = symbolCodeToBigInt(Asset.SymbolCode.from(symbol));
    return contract.tables.accounts(accountBigInt).getTableRow(symcodeBigInt);
};

before(async () => {
    blockchain.resetTables();
    await mintTokens(eosioToken, 'XPR', 4, 100_000_000.0, 1_000_000, [sdcworkshop]);
});

describe('XPR Reward Pool', () => {
    it('fails to register and remove devs', async () => {
        await expectToThrow(
            sdcworkshop.actions.regdev([developer1.name]).send(`${unregistered.name}@active`),
            'missing required authority sdcworkshop',
        );
        await expectToThrow(
            sdcworkshop.actions.removedev([developer1.name]).send(`${unregistered.name}@active`),
            'missing required authority sdcworkshop',
        );
    });
    it('fails to enable claiming period', async () => {
        await expectToThrow(
            sdcworkshop.actions.enableclaim([]).send(`${unregistered.name}@active`),
            'missing required authority sdcworkshop',
        );
    });
    it('fails to setcontract', async () => {
        await expectToThrow(
            sdcworkshop.actions
                .setcontract([unregistered.name, dummycontract.name])
                .send(`${unregistered.name}@active`),
            protonAssert('unknown dev'),
        );
        await expectToThrow(
            sdcworkshop.actions.setcontract([developer1.name, dummycontract.name]).send(`${unregistered.name}@active`),
            'missing required authority developer1',
        );
    });
    it('reg/remove dev and check state', async () => {
        await sdcworkshop.actions.regdev([developer1.name]).send(`${sdcworkshop.name}@active`);
        let global = sdcworkshop.tables.global().getTableRows()[0];
        expect(global.totalReward).equal(`900000.0000 XPR`);
        expect(global.devCount).equal(1);
        expect(global.claimCount).equal(0);
        expect(global.claimEnabled).false;
        expect(global.claimPeriodEnd).equal(1713180600);
        expect(global.fundsReturned).false;
        await sdcworkshop.actions.removedev([developer1.name]).send(`${sdcworkshop.name}@active`);
        global = sdcworkshop.tables.global().getTableRows()[0];
        expect(global.devCount).equal(0);
    });
    it('fails to reg/remove dev when claiming period enabled', async () => {
        await sdcworkshop.actions.regdev([developer1.name]).send(`${sdcworkshop.name}@active`);
        await sdcworkshop.actions.enableclaim([]).send(`${sdcworkshop.name}@active`);
        await expectToThrow(
            sdcworkshop.actions.regdev([developer2.name]).send(`${sdcworkshop.name}@active`),
            protonAssert('claiming period started, cannot add more devs'),
        );
        await expectToThrow(
            sdcworkshop.actions.removedev([developer1.name]).send(`${sdcworkshop.name}@active`),
            protonAssert('claiming period started, cannot remove devs'),
        );
    });
    it('fails to return funds to xprgrants', async () => {
        await expectToThrow(
            sdcworkshop.actions.returnxpr([]).send(`${unregistered.name}@active`),
            protonAssert('30 day claim period still running'),
        );
    });
    it('return funds & fails with second attempt', async () => {
        // end claiming period
        blockchain.setTime(TimePointSec.fromMilliseconds(1713180601 * 1000));
        await sdcworkshop.actions.returnxpr([]).send(`${unregistered.name}@active`);
        let global = sdcworkshop.tables.global().getTableRows()[0];
        expect(global.fundsReturned).true;
        await expectToThrow(
            sdcworkshop.actions.returnxpr([]).send(`${unregistered.name}@active`),
            protonAssert('funds already returned to xprgrants'),
        );
        const xprgrantsAcc = getAccount(eosioToken, xprgrants.name.toString(), 'XPR');
        expect(xprgrantsAcc.balance).equal('900000.0000 XPR');
    });
});
