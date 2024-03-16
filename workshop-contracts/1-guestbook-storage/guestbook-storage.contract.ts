import { Contract, Name, Singleton, TableStore } from 'proton-tsc';
import { GuestbookGlobal, GuestbookEntry } from './guestbook-storage.tables';

@contract
class GuestbookStorage extends Contract {
    // only admin can delete entries
    admin: Name = Name.fromString('admin');

    // tables
    globalSingleton: Singleton<GuestbookGlobal> = new Singleton<GuestbookGlobal>(this.receiver);
    entries: TableStore<GuestbookEntry> = new TableStore<GuestbookEntry>(this.receiver);

    /**
     * Adds a new entry to the guestbook
     * @param {Name} guest - account that provides a message
     * @param {string} message - the message
     */
    @action('add')
    addEntry(guest: Name, message: string): void {
        // TODOs
        // 1. require authorization of guest account, see https://docs.xprnetwork.org/contract-sdk/api/authentication.html#requireauth
        // see https://docs.xprnetwork.org/contract-sdk/storage.html#overview
        // 2. get row from "GuestbookGlobal" singleton
        // 3. increase global entryId to determine entryId
        // 4. update GuestbookGlobal row
        // 5. create GuestbookEntry with current timestamp
        // 6. store a new entry (payed by the guest)
    }

    /**
     * Deletes an entry from the guestbook
     * @param {u64} id - id of the message to delete
     */
    @action('delete')
    deleteEntry(id: u64): void {
        // TODO
        // 1. require authorization of admin account, see https://docs.xprnetwork.org/contract-sdk/api/authentication.html#requireauth
        // see https://docs.xprnetwork.org/contract-sdk/storage.html#overview
        // 2. get entry from table
        // 3. remove entry from table
    }
}
