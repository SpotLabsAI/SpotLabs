dfx identity new Alice --disable-encryption
dfx identity use Alice
export ALICE=$(dfx identity get-principal)
dfx identity new Bob --disable-encryption
dfx identity use Bob
export BOB=$(dfx identity get-principal)
dfx identity use default
dfx deploy
dfx deploy --argument "(record {
 accounts = vec { record { owner = principal \"$ALICE\"; tokens = record { amount_e8s = 100_000_000 }; };
                  record { owner = principal \"$BOB\"; tokens = record { amount_e8s = 100_000_000 };}; };
 system_params = record {
     transfer_fee = record { amount_e8s = 10_000 };
 };
})" ii_integration_backend