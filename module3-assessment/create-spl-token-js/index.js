import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, transfer } from '@solana/spl-token';
import { readFileSync } from "fs";

(async () => {
    // Step 1: Connect to cluster and generate two new Keypairs
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    let jsonPath = "/Users/tomoaki_ando/.config/solana/devnet.json"
    const fromSecretKey = new Uint8Array(JSON.parse(readFileSync(jsonPath)))
    const fromWallet = Keypair.fromSecretKey(fromSecretKey)
    const toWalletPublicKey = new PublicKey("2TobuXEW7ghS1x8zfZPpZjWWTmZPZCW9wrtvahFTtbFU");

    // Step 2: Airdrop SOL into your from wallet
    const fromAirdropSignature = await connection.requestAirdrop(fromWallet.publicKey, LAMPORTS_PER_SOL);
    // Wait for airdrop confirmation
    await connection.confirmTransaction(fromAirdropSignature, { commitment: "confirmed" });

    // Step 3: Create new token mint and get the token account of the fromWallet address
    //If the token account does not exist, create it
    const mint = await createMint(connection, fromWallet, fromWallet.publicKey, null, 9);
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            fromWallet,
            mint,
            fromWallet.publicKey
    )

    //Step 4: Mint a new token to the from account
    let signature = await mintTo(
        connection,
        fromWallet,
        mint,
        fromTokenAccount.address,
        fromWallet.publicKey,
        100000000000,
        []
    );
    console.log('mint tx:', signature);

    //Step 5: Get the token account of the to-wallet address and if it does not exist, create it
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, toWalletPublicKey);

    //Step 6: Transfer the new token to the to-wallet's token account that was just created
    // Transfer the new token to the "toTokenAccount" we just created
    signature = await transfer(
        connection,
        fromWallet,
        fromTokenAccount.address,
        toTokenAccount.address,
        fromWallet.publicKey,
        50000000000,
        []
    );

    console.log('MintAccount', mint.toString())
    console.log('FromPubKey', fromWallet.publicKey.toString())
    console.log('ToPubKey', toWalletPublicKey.toString())
    console.log('FromTokenAccount', fromTokenAccount.address.toString())
    console.log('ToTokenAccount', toTokenAccount.address.toString())
    console.log('transfer tx:', signature);

})();