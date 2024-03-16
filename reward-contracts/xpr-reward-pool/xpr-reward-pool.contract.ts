import {
    Asset,
    Contract,
    Name,
    Singleton,
    TableStore,
    check,
    currentTimeSec,
    getSender,
    requireAuth,
    requireRecipient,
} from 'proton-tsc';
import { Developer, Global } from './xpr-reward-pool.tables';
import { sendTransferToken } from 'proton-tsc/token';
import { XPR_CONTRACT, XPR_SYMBOL } from 'proton-tsc/system';
import { sendCanClaim } from './xpr-reward-pool.inline';

@contract
class XprRewardPool extends Contract {
    contract: Name = this.receiver;

    developers: TableStore<Developer> = new TableStore<Developer>(this.receiver);
    globalSingleton: Singleton<Global> = new Singleton<Global>(this.receiver);

    @action('regdev')
    registerDev(account: Name): void {
        requireAuth(this.contract);
        const global = this.globalSingleton.get();
        check(!global.claimEnabled, 'claiming period started, cannot add more devs');
        global.devCount++;
        this.globalSingleton.set(global, this.contract);
        this.developers.store(new Developer(account), this.contract);
    }

    @action('removedev')
    removeDev(account: Name): void {
        requireAuth(this.contract);
        const global = this.globalSingleton.get();
        check(!global.claimEnabled, 'claiming period started, cannot remove devs');
        const dev = this.developers.requireGet(account.N, 'unknown dev');
        global.devCount--;
        this.globalSingleton.set(global, this.contract);
        this.developers.remove(dev);
    }

    // every developer MUST define the claim contract which is used to trigger the claim
    @action('setcontract')
    setContract(account: Name, claimContract: Name): void {
        requireAuth(account);
        const global = this.globalSingleton.get();
        check(currentTimeSec() <= global.claimPeriodEnd, 'claim period expired');
        const dev = this.developers.requireGet(account.N, 'unknown dev');
        check(!dev.rewardClaimed, 'not allowed, reward already claimed');
        dev.claimContract = claimContract;
        this.developers.set(dev, this.contract);
    }

    @action('enableclaim')
    enableClaimPeriod(): void {
        requireAuth(this.contract);
        const global = this.globalSingleton.get();
        global.claimEnabled = true;
        this.globalSingleton.set(global, this.contract);
    }

    // entrypoint for homework contract to be called via InlineAction
    @action('initclaim')
    initClaim(account: Name): void {
        const global = this.globalSingleton.get();
        check(global.claimEnabled, 'claim period not started');
        check(currentTimeSec() <= global.claimPeriodEnd, 'claim period expired');
        const dev = this.developers.requireGet(account.N, 'unknown dev');
        check(dev.claimContract == getSender(), 'invalid sender contract');
        // store timestamp in dev table
        dev.timestamp = currentTimeSec();
        this.developers.set(dev, this.contract);
        // InlineAction to send notification to calling contract
        sendCanClaim(this.contract, account, getSender());
    }

    // action to send notification to claimContract
    @action('canclaim')
    canClaim(account: Name, claimContract: Name): void {
        requireAuth(this.contract);
        requireRecipient(claimContract);
    }

    @action('claimreward', notify)
    onClaimReward(account: Name, timestamp: u64): void {
        const dev = this.developers.requireGet(account.N, 'unknown dev');
        check(!dev.rewardClaimed, 'reward already claimed');
        check(dev.claimContract == this.firstReceiver, 'invalid notifier contract');
        check(timestamp == dev.timestamp && timestamp == currentTimeSec(), 'invalid timestamp');
        const global = this.globalSingleton.get();
        const equalSharePerDev = global.totalReward.amount / global.devCount;
        dev.rewardClaimed = true;
        this.developers.set(dev, this.contract);
        global.claimCount++;
        this.globalSingleton.set(global, this.contract);
        sendTransferToken(
            XPR_CONTRACT,
            this.contract,
            dev.account,
            new Asset(equalSharePerDev, XPR_SYMBOL),
            'SDC 2024 Workshop Homework Reward',
        );
    }

    // return unclaimed funds of reward pool back to "xprgrants" contract
    // can be called by anybody once the 30 days claim period is over
    @action('returnxpr')
    returnXpr(): void {
        const global = this.globalSingleton.get();
        check(currentTimeSec() > global.claimPeriodEnd, '30 day claim period still running');
        check(!global.fundsReturned, 'funds already returned to xprgrants');
        const equalSharePerDev = global.totalReward.amount / global.devCount;
        const remainingAmount = global.totalReward.amount - equalSharePerDev * global.claimCount;
        global.fundsReturned = true;
        this.globalSingleton.set(global, this.contract);
        sendTransferToken(
            XPR_CONTRACT,
            this.contract,
            Name.fromString('xprgrants'),
            new Asset(remainingAmount, XPR_SYMBOL),
            'SDC 2024 Workshop: Return Unclaimed Funds',
        );
    }
}
