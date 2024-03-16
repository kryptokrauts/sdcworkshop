import { Asset, Contract, Name } from 'proton-tsc';
import { sendTransferToken } from 'proton-tsc/token';

@contract
class TokenReceiver extends Contract {

    // can be used as "from"
    contract: Name = this.receiver;

    /**
     * Handles an incoming transfer notification.
     */
    @action('transfer', notify)
    onTransfer(from: Name, to: Name, quantity: Asset, memo: string): void {
        // see https://docs.xprnetwork.org/contract-sdk/notifications.html#receiving-notifications
        // TODOs
        // 1. skip handling for outgoing transfers as notifications are also provided for outgoing transfers
        // 2a. check if incoming token != XSHIT and revert with message 'we do not want XSHIT, keep it in your wallet!' if not
        // 2b. forward tokens to 'fwdreceiver' in case of XUSDC via InlineAction (use "sendTransferToken")
        // 2c. keep 50% & forward 50% tokens to 'fwdreceiver' via InlineAction (use "sendTransferToken") in case of XPR
    }
}
