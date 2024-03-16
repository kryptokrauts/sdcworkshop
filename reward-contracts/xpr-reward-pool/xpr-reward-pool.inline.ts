import { ActionData, InlineAction, Name, PermissionLevel } from 'proton-tsc';

@packer
export class CanClaimData extends ActionData {
    constructor(
        public account: Name,
        public claimContract: Name,
    ) {
        super();
    }
}

export function sendCanClaim(rewardContract: Name, account: Name, claimContract: Name): void {
    const CAN_CLAIM = new InlineAction<CanClaimData>('canclaim');
    const action = CAN_CLAIM.act(rewardContract, new PermissionLevel(rewardContract));
    action.send(new CanClaimData(account, claimContract));
}
