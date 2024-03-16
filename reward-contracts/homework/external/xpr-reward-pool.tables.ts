import { EMPTY_NAME, Name, Table } from 'proton-tsc';

// important to use noabigen for access to tables of remote contracts
@table('developers', noabigen)
export class Developer extends Table {
    constructor(
        public account: Name = EMPTY_NAME,
        public claimContract: Name = EMPTY_NAME,
        public timestamp: u64 = -1,
        public rewardClaimed: boolean = false,
    ) {
        super();
    }

    @primary
    get primary(): u64 {
        return this.account.N;
    }
}
