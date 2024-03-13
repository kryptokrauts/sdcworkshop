import { expect } from 'chai';
import { Blockchain, expectToThrow } from '@proton/vert';

// create blockchain
const blockchain = new Blockchain();

// deploy contract to test
// note: contract needs to be built before!
const helloworld = blockchain.createContract('helloworld', '0-hello-world/target/helloworld.contract');

// create accounts
const [developer1, developer2] = blockchain.createAccounts('developer1', 'developer2');

describe('HelloWorld', () => {
    it('say hello', async () => {
        // say hello to developer1
        await helloworld.actions.sayhello([developer1.name]).send(`${developer1.name}@active`);
        expect(helloworld.bc.console).equal(`Hello, ${developer1.name}!`);

        // say hello to developer2
        await helloworld.actions.sayhello([developer2.name]).send(`${developer2.name}@active`);
        expect(helloworld.bc.console).equal(`Hello, ${developer2.name}!`);
    });

    it('fail with missing auth', async () => {
        // fail with missing authorization
        await expectToThrow(
            helloworld.actions.sayhello([developer1.name]).send(`${developer2.name}@active`),
            'missing required authority developer1',
        );
    });
});
