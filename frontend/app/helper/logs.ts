export function logTxnReceipt(receipt: any) {
    console.log(`TxnReceipt: ${receipt}`)
    console.log(`TxnReceipt - Status: ${receipt.status}`)
    console.log(`TxnReceipt - Hash: ${receipt.transactionHash}`)
    console.log(`TxnReceipt - Index: ${receipt.transactionIndex}`)
    console.log(`TxnReceipt - gasUsed: ${receipt.gasUsed}`)
    console.log(`TxnReceipt - From: ${receipt.from}`)
    console.log(`TxnReceipt - To: ${receipt.to}`)
    console.log(`TxnReceipt - Type: ${receipt.type}`)
    console.log(`TxnReceipt - logsBloom: ${receipt.logsBloom}`)
    console.log(`Number of Logs / Events: ${receipt.logs.length}`);
    for (let logEvent of receipt.logs) {
        console.log(logEvent.data);
        console.log(logEvent.logIndex);
    }
}