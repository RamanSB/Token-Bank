const value = Number("44as.")
console.log(value);


const num = 14242;
const balanceString = num.toString();
console.log(balanceString.slice(0, 0));
console.log(balanceString.slice(0, -1));
console.log(balanceString.slice(0, -2));
console.log(balanceString.slice(0, -3));
console.log(balanceString.slice(0, -4));
console.log(balanceString.slice(0, -5));
const v1: bigint = BigInt(5);
const v2: bigint = BigInt(42);
const v3: bigint = v1 + v2;
console.log(typeof v3);
console.log(v3);
console.log(v1 + v2);


const arr = [21];
console.log(arr.slice(-1));

const aMap = [["raman", 32]];

aMap.map(([k, v], index) => {
    console.log(`s)`);

    console.log(k);
    console.log(v);
    console.log(`q)`);
})



const bMap = new Map(aMap.map(([k, v], index) => [k, v]));
console.log(`====`)
console.log(aMap);
console.log(Array.from(aMap.keys()))
console.log(Array.from(bMap.keys()))
console.log(bMap);
console.log(Array.from(aMap.values()))
console.log(Array.from(bMap.values()))



const asyncMethod = async (): Promise<number> => {
    return new Promise((res, rej) => {
        const rnd = Math.random();
        if (rnd > 0.5) {
            res(rnd);
        }
        return 4;
    })
}


/* let arr1: number[] = [1,4,125,4,62];
arr1.forEach(async item => console.log(await asyncMethod()));
 */

const validWithdrawInput = /^\d+?.\d+$/;
let sampleA = "2.124"
let sampleB = "0.214"
let sampleC = "4215.21"
let sampleD = "214"
let sampleE = "0.00."
let sampleF = "42.1.21"
let sampleG = ".421"
/* 
let samples = [sampleA, sampleB, sampleC, sampleD, sampleE, sampleF, sampleG]
for (let sample of samples) {
    console.log(validWithdrawInput.test(sample));
}
 */


console.log(Number.MAX_VALUE);
console.log(Number.MIN_VALUE);
console.log(Number.EPSILON);
console.log(Number.MAX_SAFE_INTEGER);
console.log(Number.MIN_SAFE_INTEGER);


let numA = 0.0012;
let numB = 124120.0012;
let numC = 0.00000002112;
let numD = 0.012012;
for (let val of [numA, numB, numC, numD]) {
    console.log(val);
    console.log(Number(val) < 1)
}

let decimals = 18;

function multiplyBigInts(val: string | number, decimals: number) {
    if (Number.isNaN(val)) {
        console.log(`${val} is NaN`);
        return;
    }

    const num = Number(val);
    if (Number(val) >= 1) {
        return BigInt(val) * BigInt(10 ** decimals);
    }

    const log = Math.log10(num);
    const decimalPlaces = Math.abs(Math.floor(log));
    return BigInt(num * 10 ** decimalPlaces) * BigInt(10 ** (decimals - decimalPlaces));
}

console.log(Math.floor(-3.004));




const tickerA = "KTK";
const tickerB = "ETH";
const tickerC = "avail.org";

const tickers = [tickerA, tickerB, tickerC];
for (let ticker of tickers) {
    console.log(/\./.test(ticker));
}