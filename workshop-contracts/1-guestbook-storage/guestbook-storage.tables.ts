import { Table } from 'proton-tsc';

@table('global', singleton)
export class GuestbookGlobal extends Table {
    constructor(
        // used as primary key for new entries
        // increment for each new entry
        public entryId: u64 = 0,
    ) {
        super();
    }
}

@table('entries')
export class GuestbookEntry extends Table {
    // see https://docs.xprnetwork.org/contract-sdk/storage.html
    // TODO constructor for properties: id (u64), guest (Name), message (string), timestamp (u64)
    // TODO primary key (id)
}
