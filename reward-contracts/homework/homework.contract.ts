import { Contract, Name } from 'proton-tsc';

const rewardPoolContract = Name.fromString('sdcworkshop');

@contract
class Homework extends Contract {
    contract: Name = this.receiver;

    // TODO init developers table of rewardPoolContract

    @action('claim')
    claim(account: Name): void {
        // TODO call "initclaim" of rewardpool contract via InlineAction
    }

    @action('canclaim', notify)
    onCanClaim(account: Name): void {
        // TODO fetch developer entry in developers table of rewardpool contract
        // TODO call "claimreward" if this contract via inline action
    }

    @action('claimreward')
    claimReward(account: Name, timestamp: u64): void {
        // TODO notify rewardpool contract
    }
}
