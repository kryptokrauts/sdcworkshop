import { Asset, EMPTY_NAME, Name, Table } from 'proton-tsc';

@table('global', singleton)
export class Global extends Table {
    constructor(
        public totalReward: Asset = Asset.fromString('900000.0000 XPR'),
        public devCount: u8 = 0,
        public claimCount: u8 = 0,
        public claimEnabled: boolean = false,
        public claimPeriodEnd: u64 = 1713180600, // Monday, 15 April 2024, 13:30:00 (CET)
        public fundsReturned: boolean = false,
    ) {
        super();
    }
}

@table('developers')
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
