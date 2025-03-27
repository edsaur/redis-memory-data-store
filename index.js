import InMemoryStore from './store.js';

const store = new InMemoryStore();

// TEST CASES
store.set('key', 'value'); // This set the key as 'key' and value as 'value'
console.log(store.get('key')); // This will return the value of the 'key'
// console.log(store.remove('key')); // This will remove the 'key'
console.log(store.has('key')); // This checks if the 'key' exists