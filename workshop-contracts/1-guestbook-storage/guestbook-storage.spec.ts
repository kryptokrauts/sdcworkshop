import { expect } from 'chai';
import { Blockchain, bnToBigInt, expectToThrow } from '@proton/vert';
import { TimePointSec } from '@greymass/eosio';

// create blockchain
const blockchain = new Blockchain();

// deploy contract to test
// note: contract needs to be built before!
const guestbook = blockchain.createContract('guestbook', '1-guestbook-storage/target/guestbook-storage.contract');

// create accounts
const [admin, guest, troll] = blockchain.createAccounts('admin', 'guest', 'troll');

// helpers to fetch table rows
const getGuestbookEntries = () => guestbook.tables.entries().getTableRows();
const getGuestbookEntry = (pk: bigint) => guestbook.tables.entries().getTableRow(pk);

// starts at 0
const ONE_HOUR = 3_600;
blockchain.addTime(TimePointSec.fromInteger(ONE_HOUR));

describe('Guestbook Storage', () => {
    // seconds since epoch
    const currentTimestamp = blockchain.timestamp.toMilliseconds() / 1000;

    it('add regular entry', async () => {
        const message = 'Fantastic workshop! I love it <3';

        // fails when trying to send for another account
        await expectToThrow(
            guestbook.actions.add([guest.name, message]).send(`${troll.name}@active`),
            'missing required authority guest',
        );

        // add entry to guestbook
        await guestbook.actions.add([guest.name, message]).send(`${guest.name}@active`);
        // check entry
        expect(getGuestbookEntries().length).equal(1);
        // expect timestamp to be at
        expect(currentTimestamp).equal(ONE_HOUR);
        expect(getGuestbookEntry(bnToBigInt(1))).deep.equal({
            id: 1,
            guest: guest.name.toString(),
            message,
            timestamp: currentTimestamp,
        });
    });

    it('add troll entry', async () => {
        const trollMessage = 'The absolutely worst conference experience I have ever had!';

        // add troll entry to guestbook
        await guestbook.actions.add([troll.name, trollMessage]).send(`${troll.name}@active`);
        // check troll entry
        expect(getGuestbookEntries().length).equal(2);
        expect(getGuestbookEntry(bnToBigInt(2))).deep.equal({
            id: 2,
            guest: troll.name.toString(),
            message: trollMessage,
            timestamp: currentTimestamp,
        });
    });

    it('delete troll entry', async () => {
        // get entries of troll
        const id = 2;

        // fail with missing authorization
        await expectToThrow(
            guestbook.actions.delete([id]).send(`${guest.name}@active`),
            'missing required authority admin',
        );

        // delete as admin
        await guestbook.actions.delete([id]).send(`${admin.name}@active`);

        // check length
        expect(getGuestbookEntries().length).equal(1);
        expect(getGuestbookEntry(bnToBigInt(2))).undefined;
    });
});
