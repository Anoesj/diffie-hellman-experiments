import { Communication } from './Communication.ts';
import { Actor } from './Actor.ts';
import { Interceptor } from './Interceptor.ts';

const alice = new Actor('Alice', 3);
const bob = new Actor('Bob', 5);

const tom = new Interceptor('Tom', 2);

new Communication(alice, bob, [tom]);

await alice.sendData('Hi Bob! How are you?', bob);
await bob.sendData('Hey Alice, good good. Wanna chill?', alice);
