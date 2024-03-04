import Result "mo:base/Result";
import Trie "mo:base/Trie";
import Nat "mo:base/Nat";
import List "mo:base/List";
import Principal "mo:base/Principal";

module {
  public type Result<T, E> = Result.Result<T, E>;
  public type Account = { owner : Principal; tokens : Tokens };
  public type Tokens = { amount_e8s : Nat };
  public type TransferArgs = { to : Principal; amount : Tokens };
  public type UpdateSystemParamsPayload = {
    transfer_fee : ?Tokens;
    proposal_vote_threshold : ?Tokens;
    proposal_submission_deposit : ?Tokens;
  };

  public type SystemParams = {
    transfer_fee: Tokens;
  };
  public type BasicDaoStableStorage = {
    accounts: [Account];
    system_params: SystemParams;
  };

  public func account_key(t: Principal) : Trie.Key<Principal> = { key = t; hash = Principal.hash t };
  public func accounts_fromArray(arr: [Account]) : Trie.Trie<Principal, Tokens> {
      var s = Trie.empty<Principal, Tokens>();
      for (account in arr.vals()) {
          s := Trie.put(s, account_key(account.owner), Principal.equal, account.tokens).0;
      };
      s
  };
  public let oneToken = { amount_e8s = 10_000_000 };
  public let zeroToken = { amount_e8s = 0 };  
}