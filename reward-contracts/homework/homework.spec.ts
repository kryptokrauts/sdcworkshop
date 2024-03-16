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
const homework = blockchain.createContract('homework', 'homework/target/homework.contract');

// create accounts
const [developer1, developer2, dummycontract] = blockchain.createAccounts('developer1', 'developer2', 'dummycontract');

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
    // register 2 devs to potentially share the pool between two devs
    await sdcworkshop.actions.regdev([developer1.name]).send(`${sdcworkshop.name}@active`);
    await sdcworkshop.actions.regdev([developer2.name]).send(`${sdcworkshop.name}@active`);
});

describe('Homework', () => {
    it('claim reward', async () => {
        // throw if claim period has not been started
        await expectToThrow(
            homework.actions.claim([developer1.name]).send(`${developer1.name}@active`),
            protonAssert('claim period not started'),
        );
        // start claim period
        await sdcworkshop.actions.enableclaim([]).send(`${sdcworkshop.name}@active`);
        // throw if contract has not been set by developer
        await expectToThrow(
            homework.actions.claim([developer1.name]).send(`${developer1.name}@active`),
            protonAssert('invalid sender contract'),
        );
        // set contract for developer1
        await sdcworkshop.actions.setcontract([developer1.name, homework.name]).send(`${developer1.name}@active`);
        // check state before claiming
        let dev = sdcworkshop.tables.developers().getTableRow(nameToBigInt(developer1.name));
        let sdworkshopAcc = getAccount(eosioToken, sdcworkshop.name.toString(), 'XPR');
        let developer1Acc = getAccount(eosioToken, developer1.name.toString(), 'XPR');
        expect(dev.rewardClaimed).false;
        expect(sdworkshopAcc.balance).equal(`1000000.0000 XPR`);
        expect(developer1Acc).undefined;
        // perform the claim
        await homework.actions.claim([developer1.name]).send(`${developer1.name}@active`);
        // check state after claiming
        dev = sdcworkshop.tables.developers().getTableRow(nameToBigInt(developer1.name));
        sdworkshopAcc = getAccount(eosioToken, sdcworkshop.name.toString(), 'XPR');
        developer1Acc = getAccount(eosioToken, developer1.name.toString(), 'XPR');
        expect(dev.rewardClaimed).true;
        expect(sdworkshopAcc.balance).equal(`550000.0000 XPR`);
        expect(developer1Acc.balance).equal(`450000.0000 XPR`);

        // changing contract after claiming fails
        await expectToThrow(
            sdcworkshop.actions.setcontract([developer1.name, dummycontract.name]).send(`${developer1.name}@active`),
            protonAssert('not allowed, reward already claimed'),
        );

        // claiming again fails
        await expectToThrow(
            homework.actions.claim([developer1.name]).send(`${developer1.name}@active`),
            protonAssert('reward already claimed'),
        );

        // set contract for developer2
        await sdcworkshop.actions.setcontract([developer2.name, homework.name]).send(`${developer2.name}@active`);

        // end claiming period
        blockchain.setTime(TimePointSec.fromMilliseconds(1713180601 * 1000));

        // set contract after claiming period ended fails
        await expectToThrow(
            sdcworkshop.actions.setcontract([developer2.name, dummycontract.name]).send(`${developer2.name}@active`),
            protonAssert('claim period expired'),
        );

        // trying to claim after claiming period ended fails
        await expectToThrow(
            homework.actions.claim([developer2.name]).send(`${developer2.name}@active`),
            protonAssert('claim period expired'),
        );

        const global = sdcworkshop.tables.global().getTableRows()[0];
        expect(global.totalReward).equal(`900000.0000 XPR`);
        expect(global.devCount).equal(2);
        expect(global.claimCount).equal(1);
        expect(global.claimEnabled).true;
        expect(global.claimPeriodEnd).equal(1713180600);
        expect(global.fundsReturned).false;
    });
});
