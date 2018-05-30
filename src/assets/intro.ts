export const intro = `

# Waves Smart Contracts

Smart contracts are an important mechanism for any blockchain platform and their realisation should be convenient and understandable for people.

## Benefits of Smart Contracts on Waves Platform

Smart contracts will bring new additions and added benefits to the Waves ecosystem, Figure 1:

1. Smart contracts will allow for **multisignature** wallets, which cannot be controlled by simply one person alone. For a transaction to occur, all necessary parties must provide their private keys at the same time. This is a hugely important security feature, and makes it possible for teams to manage their own finances securely and without giving control to any one individual. This will be particularly useful for token sales, since funds can be held safely pending deployment.
2. Unlike other similar blockchains, Waves smart contracts **do not use gas** for non-Turing complete smart contracts — which means that fixed costs are always known upfront. Compared to Ethereum, this makes Waves significantly more simplified, efficient, and cost-effective, while still providing essentially the same service.
3. Atomic swaps will also be added, while smart contracts on Waves will also allow for **token freezes** — meaning users will be able to introduce parameters which prevent buyers from selling or transferring tokens from their address for a specified amount of time. This involves sending a token to a user, but ensuring it remains non-transferable and unspendable for a period of time. The most obvious use case for this is as a vesting mechanism or for team/contractor payments after an ICO takes place.
4. Waves Tokens are like Waves itself, which means that they are treated exactly the same and are held in your address — while the platform still supports token creation in the core and from the standard Waves wallet. Essentially, this makes life a lot easier for end users. Furthermore, the tokens you create can immediately be distributed and traded on the Waves decentralized exchange, DEX, with no further work.
5. Decentralized applications \(DApps\) which are based on Turing-complete smart contracts will be able to complete complicated processes on the Waves blockchain, meeting a wide range of different criteria.
6. Balance management, a user might want to make regular monthly payments, but to ensure that their account does not fall below a certain balance. Or they might want to keep a fixed amount of funds in one address and move everything above that to a separate account.


## Stages of Waves Smart Contracts Implementation

There are two Stages, Figure 2:

1. Non-Turing Complete Smart Contracts which cover a large proportion of use cases, including smart accounts and smart tokens.

2. Turing Complete Smart Contracts which will allow the creation of decentralised applications on the blockchain and the possibility to send the transactions themselves.


## Smart Accounts

The idea of a smart account is the following:

Before the transaction is submitted for inclusion in the next block, the account checks if the transaction meets certain requirements, defined in a script. The script is attached to the account so the account can validate every transaction before confirming it. The main requirement for our smart accounts is that they can be run for the price of normal transactions with a predefined fee, **without** any additional **“gas”** or other costs.

Smart accounts cannot send transactions themselves or transfer funds according to given conditions, but can read data from the blockchain \(for example, the height of a block or signatures from the transaction\) and return the result of a predicate obtained on the basis of this data.

## Smart Assets

If we plan to apply constraints on all operations for a specific asset, we cannot use a smart account. In our paradigm, we have smart assets for this purpose: the script will be attached to the asset and will work in a similar way. Transactions for such assets are valid only if the script returns True. For example, a script can verify proofs from a transaction, check if a notary/escrow approves the transaction, and that operations with the asset aren’t locked for a specified time. The script for the token is invoked upon the following operations with an asset:

* Transfer Transaction
* Mass Transfer Transaction
* Reissue Transaction
* Burn Transaction

**Note.** you can find more technical details about our smart contracts implementation [**here**](/technical-details/waves-contracts-language-description.md).


`