import { ActionData, InlineAction, Name, PermissionLevel } from 'proton-tsc';

@packer
export class InitClaimData extends ActionData {
    constructor(public account: Name) {
        super();
    }
}

@packer
export class ClaimRewardData extends ActionData {
    constructor(
        public account: Name,
        public timestamp: u64,
    ) {
        super();
    }
}

export function sendInitClaim(rewardContract: Name, homeworkContract: Name, account: Name): void {
    // TODO call "initclaim" of rewardContract
}

export function sendClaimReward(homeworkContract: Name, account: Name, timestamp: u64): void {
    // TODO call "claimreward" of homework contract
}
