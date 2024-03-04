import Trie "mo:base/Trie";
import Principal "mo:base/Principal";
import Option "mo:base/Option";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Result "mo:base/Result";
import List "mo:base/List";
import Text "mo:base/Text";
import Types "./types";

shared actor class DAO(init : Types.BasicDaoStableStorage) = Self {
    stable var accounts = Types.accounts_fromArray(init.accounts);
    stable var system_params : Types.SystemParams = init.system_params;

    func account_get(id : Principal) : ?Types.Tokens = Trie.get(accounts, Types.account_key(id), Principal.equal);
    func account_put(id : Principal, tokens : Types.Tokens) {
        accounts := Trie.put(accounts, Types.account_key(id), Principal.equal, tokens).0;
    };

    /// Transfer tokens from the caller's account to another account
    public shared ({ caller }) func transfer(transfer : Types.TransferArgs) : async Types.Result<(), Text> {
        switch (account_get caller) {
            case null { #err "Caller needs an account to transfer funds" };
            case (?from_tokens) {
                let fee = system_params.transfer_fee.amount_e8s;
                let amount = transfer.amount.amount_e8s;
                if (from_tokens.amount_e8s < amount + fee) {
                    #err("Caller's account has insufficient funds to transfer " # debug_show (amount));
                } else {
                    let from_amount : Nat = from_tokens.amount_e8s - amount - fee;
                    account_put(caller, { amount_e8s = from_amount });
                    let to_amount = Option.get(account_get(transfer.to), Types.zeroToken).amount_e8s + amount;
                    account_put(transfer.to, { amount_e8s = to_amount });
                    #ok;
                };
            };
        };
    };

    /// Return the account balance of the caller
    public query ({ caller }) func account_balance() : async Types.Tokens {
        Option.get(account_get(caller), Types.zeroToken);
    };

    /// Lists all accounts
    public query func list_accounts() : async [Types.Account] {
        Iter.toArray(
            Iter.map(
                Trie.iter(accounts),
                func((owner : Principal, tokens : Types.Tokens)) : Types.Account = {
                    owner;
                    tokens;
                },
            )
        );
    };

    public shared ({ caller }) func create_account() : async Types.Result<(), Text> {
        if (account_get(caller) != null) {
            #err("Account already exists for caller");
        } else {
            // Generate a unique identifier for the new account
            let newAccount : Types.Account = {
                owner = caller;
                tokens = Types.zeroToken;
            };
            // Add the new account to your accounts storage
            accounts := Trie.put(accounts, Types.account_key(caller), Principal.equal, newAccount.tokens).0;
            #ok;
        };
    };

    public shared ({ caller }) func free_money() : async Types.Result<(), Text> {
        if (account_get(caller) == null) {
            #err("Account does not exist for caller");
        } else {
            let tokens = Option.get(account_get(caller), Types.zeroToken);
            account_put(caller, { amount_e8s = tokens.amount_e8s + 10000 });
            #ok;
        };
    };

    /// Get the current system params
    public query func get_system_params() : async Types.SystemParams {
        system_params;
    };

    public shared ({caller}) func delete_account(id: Text) : async Types.Result<(), Text> {
        // Remove account with principal id
        accounts := Trie.remove(accounts, Types.account_key(Principal.fromText(id)), Principal.equal).0;
        #ok;
    };
};
