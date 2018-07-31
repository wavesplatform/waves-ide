window.Helpers = {
    TX_EXAMPLES: {
        TRANSFER: {
            // An arbitrary address; mine, in this example
            recipient: '3PMgh8ra7v9USWUJxUCxKQKr6PM3MgqNVR8',
            // ID of a token, or WAVES
            assetId: 'WAVES',
            // The real amount is the given number divided by 10^(precision of the token)
            amount: 10000000,
            // The same rules for these two fields
            feeAssetId: 'WAVES',
            fee: 100000,
            // 140 bytes of data (it's allowed to use Uint8Array here)
            attachment: '',
            timestamp: Date.now()
        },
        ISSUE: {
            name: 'Your token name',
            description: 'Some words about it',
            // With given options you'll have 100000.00000 tokens
            quantity: 10000000000,
            precision: 5,
            // This flag defines whether additional emission is possible
            reissuable: false,
            fee: 100000000,
            timestamp: Date.now()
        },
        REISSUE: {
            // Asset ID which is to be additionnaly emitted
            assetId: '5xN8XPkKi7RoYUAT5hNKC26FKCcX6Rj6epASpgFEYZss',
            // Additional quantity is the given number divided by 10^(precision of the token)
            quantity: 100000000,
            reissuable: false,
            fee: 100000000,
            timestamp: Date.now()
        },
        BURN: {
            // Asset ID and its quantity to be burned
            assetId: '5xN8XPkKi7RoYUAT5hNKC26FKCcX6Rj6epASpgFEYZss',
            quantity: 20000000000,
            
            fee: 100000,
            timestamp: Date.now()
        },
        LEASE: {
            recipient: '5xN8XPkKi7RoYUAT5hNKC26FKCcX6Rj6epASpgFEYZss',
            
            // Both amount and fee may be presented as divided by 10^8 (8 is Waves precision)
            amount: 1000000000, // 10 Waves
            fee: 100000, // 0.001 Waves
            
            timestamp: Date.now()
        },
        CANCEL_LEASING: {
            // Related Lease transaction ID
            transactionId: '2kPvxtAit2nsumxBL7xYjvaWYmvmMfDL5oPgs4nZsHvZ',
            fee: 100000,
            timestamp: Date.now()
        },
        ALIAS: {
            // That's a kind of a nickname you attach to your address
            alias: 'xenohunter',
            fee: 100000,
            timestamp: Date.now()
        },
        DATA: {
            data: [
                {
                    "key": "int",
                    "type": "integer",
                    "value": 24
                },
                {
                    "key": "bool",
                    "type": "boolean",
                    "value": true
                },
                {
                    "key": "blob",
                    "type": "binary",
                    "value": new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])
                },
                {
                    "key": "My poem",
                    "type": "string",
                    "value": "Oh waves!"
                }
            
            ],
            fee: 100000,
            
        },
        SET_SCRIPT: {
            fee: 100000,
            senderPublicKey: "66xdGznqt2AVLMZRHme9vFPC6cvN4yV95wRWPfTus3Qe",
            sender: "3N7H4jTBMKtZfNCY86K2ND1rWcvFsGjDT3X",
            script: 'base64:AQa3b8tH'
        }
    }
};