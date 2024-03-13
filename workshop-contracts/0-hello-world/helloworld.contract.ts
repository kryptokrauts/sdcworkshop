import { Contract, Name } from 'proton-tsc';

@contract
class HelloWorld extends Contract {
    @action('sayhello')
    sayHello(account: Name): void {
        // TODOs
        // 1. implement logic to check authorization for provided account, see https://docs.xprnetwork.org/contract-sdk/api/authentication.html#requireauth
        // 2. define hello message "Hello, <account_name>!"
        // 3. print hello message, see https://docs.xprnetwork.org/contract-sdk/api/print.html#print
    }
}
