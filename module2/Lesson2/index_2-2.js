// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    // sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

// secret key below causes internal error in JSONRPCError (code: -32603)
// maybe because of me doing so many trial and error...
// const DEMO_FROM_SECRET_KEY = new Uint8Array(
//     [
//         160,  20, 189, 212, 129, 188, 171, 124,  20, 179,  80,
//          27, 166,  17, 179, 198, 234,  36, 113,  87,   0,  46,
//         186, 250, 152, 137, 244,  15,  86, 127,  77,  97, 170,
//          44,  57, 126, 115, 253,  11,  60,  90,  36, 135, 177,
//         185, 231,  46, 155,  62, 164, 128, 225, 101,  79,  69,
//         101, 154,  24,  58, 214, 219, 238, 149,  86
//       ]
// );

const DEMO_FROM_SECRET_KEY = new Uint8Array(
    [
       63, 246, 153, 174, 171, 107, 178,  67, 135, 241, 244,
       38,  95,  39, 109, 205,  81, 208, 117, 234, 116, 229,
      102, 177, 112, 156, 218,   5,  72, 122, 124,  55, 140,
       25, 173, 226,  60, 254, 188, 155,  56, 153,  59, 194,
      231,   7,  68, 106, 155, 156, 162,   2, 178, 116, 202,
      190, 255,   9, 220, 171, 156,   9, 110, 150
    ]
);


const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const getWalletBalance = async (publicKey, return_flag=false) => {
    var walletBalance = await connection.getBalance(new PublicKey(publicKey));

    console.log(`Wallet balance (${publicKey}): ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`);
    return walletBalance;
};


const airDropSol = async (publicKey) => {
    // Request airdrop of 2 SOL to the wallet
    console.log("Airdropping some SOL to my wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(publicKey),
        2 * LAMPORTS_PER_SOL
    );

    let latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });
};


const transferSol = async (from, to, amount) => {
    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: amount
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('Signature is ', signature);
}


const mainFunction = async (privateKey) => {
    const from = Keypair.fromSecretKey(privateKey);
    const to = Keypair.generate();

    await getWalletBalance(from.publicKey);
    await getWalletBalance(to.publicKey);

    await airDropSol(from.publicKey);
    fromWalletBalance = await getWalletBalance(from.publicKey);

    await transferSol(from, to, fromWalletBalance / 2);

    await getWalletBalance(from.publicKey);
    await getWalletBalance(to.publicKey);
}

mainFunction(DEMO_FROM_SECRET_KEY);


