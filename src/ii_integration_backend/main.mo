import Map "mo:base/HashMap";
import List "mo:base/List";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Option "mo:base/Option";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import Array "mo:base/Array";

import En "types";

shared ({ caller = initializer }) actor class () {

    // Constant Settings
    private let MAX_USERS = 1_000;
    private let MAX_FACTS_PER_USER = 500;
    private let MAX_DEVICES_PER_USER = 6;
    private let MAX_FACT_CHARS = 500;
    private let MAX_DEVICE_ALIAS_LENGTH = 200;
    private let MAX_PUBLIC_KEY_LENGTH = 500;
    private let MAX_CYPHERTEXT_LENGTH = 40_000;

    // Types
    private type PrincipalName = Text;
    public type EncryptedFact = {
        encrypted_text : Text;
        id : Nat;
    };

    // Make sure that each fact has a different ID.
    private stable var nextFactId : Nat = 1;

    // Each user has a list of facts.
    private var factsByUser = Map.HashMap<PrincipalName, List.List<EncryptedFact>>(0, Text.equal, Text.hash);

    // While accessing data via [factsByUser] is more efficient, we use the following stable array
    // as a buffer to preserve user facts across canister upgrades.
    // See also: [preupgrade], [postupgrade]
    private stable var stable_factsByUser : [(PrincipalName, List.List<EncryptedFact>)] = [];

    // Each user has a list of devices and associated public keys. (i.e. a UserStore)
    private var users = Map.HashMap<Principal, En.UserStore>(10, Principal.equal, Principal.hash);

    // While accessing data via hashed structures (e.g., [users]) may be more efficient, we use
    // the following stable array as a buffer to preserve registered users and user devices across
    // canister upgrades.
    // See also: [pre_upgrade], [post_upgrade]
    private stable var stable_users : [En.StableUserStoreEntry] = [];

    private func users_invariant() : Bool {
        factsByUser.size() == users.size();
    };

    private func is_user_registered(principal : Principal) : Bool {
        Option.isSome(users.get(principal));
    };

    private func user_count() : Nat {
        assert users_invariant();
        factsByUser.size();
    };

    // Make sure our ID is within bounds.
    private func is_id_sane(id : Int) : Bool {
        0 <= id and id < MAX_FACTS_PER_USER * user_count()
    };

    // Returns `true` iff [store.device_list] contains the provided public key [pk].
    private func is_known_public_key(store : En.UserStore, pk : En.PublicKey) : Bool {
        assert store.device_list.size() <= MAX_DEVICES_PER_USER;
        assert pk.size() <= MAX_PUBLIC_KEY_LENGTH;

        var found = false;
        for (x in store.device_list.entries()) {
            if (x.1 == pk) {
                return true;
            };
        };
        false;
    };

    // Utility function that helps writing assertion-driven code more concisely.
    private func expect<T>(opt : ?T, violation_msg : Text) : T {
        switch (opt) {
            case (null) {
                Debug.trap(violation_msg);
            };
            case (?x) {
                x;
            };
        };
    };

    // Who am i?
    public shared ({ caller }) func whoami() : async Text {
        return Principal.toText(caller);
    };

    // Add a new fact to the list of users facts. Return the new fact
    public shared ({ caller }) func add_fact(encrypted_text : Text) : async EncryptedFact {
        assert not Principal.isAnonymous(caller);
        assert is_user_registered(caller);
        assert encrypted_text.size() <= MAX_FACT_CHARS;

        Debug.print("Adding fact...");

        let principalName = Principal.toText(caller);
        let userFacts : List.List<EncryptedFact> = Option.get(factsByUser.get(principalName), List.nil<EncryptedFact>());

        // check that user is not going to exceed limits
        assert List.size(userFacts) < MAX_FACTS_PER_USER;

        let newFact : EncryptedFact = {
            id = nextFactId;
            encrypted_text = encrypted_text;
        };
        nextFactId += 1;
        factsByUser.put(principalName, List.push(newFact, userFacts));
        newFact;
    };

    // Get a list of all facts for this user.
    public shared ({ caller }) func get_facts() : async [EncryptedFact] {
        assert not Principal.isAnonymous(caller);
        assert is_user_registered(caller);

        let principalName = Principal.toText(caller);
        let userFacts = Option.get(factsByUser.get(principalName), List.nil());
        return List.toArray(userFacts);
    };

    // Update this [caller]'s fact (by replacing an existing with
    // the same id). If none of the existing facts have this id,
    // do nothing.
    public shared ({ caller }) func update_fact(encrypted_fact : EncryptedFact) : async () {
        assert not Principal.isAnonymous(caller);
        assert is_user_registered(caller);
        assert encrypted_fact.encrypted_text.size() <= MAX_FACT_CHARS;
        assert is_id_sane(encrypted_fact.id);

        let principalName = Principal.toText(caller);
        var existingFacts = expect(
            factsByUser.get(principalName),
            "registered user (principal " # principalName # ") w/o allocated facts",
        );

        var updatedFacts = List.map(
            existingFacts,
            func(fact : EncryptedFact) : EncryptedFact {
                if (fact.id == encrypted_fact.id) {
                    encrypted_fact;
                } else {
                    fact;
                };
            },
        );
        factsByUser.put(principalName, updatedFacts);
    };

    // Delete this [caller]'s fact with given id. If none of the
    // existing facts have this id, do nothing.
    public shared ({ caller }) func delete_fact(id : Int) : async () {
        assert not Principal.isAnonymous(caller);
        assert is_user_registered(caller);
        assert is_id_sane(id);

        let principalName = Principal.toText(caller);
        var factsOfUser = Option.get(factsByUser.get(principalName), List.nil());

        factsByUser.put(
            principalName,
            List.filter(factsOfUser, func(fact : EncryptedFact) : Bool { fact.id != id }),
        );
    };

    // Associate a public key with a device ID, for a given user.
    public shared ({ caller }) func register_device(
        alias : En.DeviceAlias,
        pk : En.PublicKey,
    ) : async Bool {

        assert not Principal.isAnonymous(caller);
        assert alias.size() <= MAX_DEVICE_ALIAS_LENGTH;
        assert pk.size() <= MAX_PUBLIC_KEY_LENGTH;

        // get caller's device list and add
        switch (users.get(caller)) {
            case null {
                // caller unknown ==> check invariants
                // A. can we add a new user?
                assert user_count() < MAX_USERS;
                // B. this caller does not have facts
                let principalName = Principal.toText(caller);
                assert factsByUser.get(principalName) == null;

                // ... then initialize the following:
                // 1) a new [UserStore] instance in [users]
                let new_store = En.UserStore(caller, 10);
                new_store.device_list.put(alias, pk);
                users.put(caller, new_store);
                // 2) a new [[Encryptedfact]] list in [factsByUser]
                factsByUser.put(principalName, List.nil());

                // finally, indicate accept
                true;
            };
            case (?store) {
                if (Option.isSome(store.device_list.get(alias))) {
                    // device alias already registered ==> indicate reject
                    false;
                } else {
                    // device not yet registered ==> check that user did not exceed limits
                    assert store.device_list.size() < MAX_DEVICES_PER_USER;
                    // all good ==> register device
                    store.device_list.put(alias, pk);
                    // indicate accept
                    true;
                };
            };
        };
    };

    // Remove this user's device with given [alias]
    public shared ({ caller }) func remove_device(alias : En.DeviceAlias) : () {
        assert not Principal.isAnonymous(caller);
        assert is_user_registered(caller);
        assert alias.size() <= MAX_DEVICE_ALIAS_LENGTH;

        let store = expect(
            users.get(caller),
            "registered user (principal " # Principal.toText(caller) # ") w/o allocated facts",
        );

        assert store.device_list.size() > 1;

        Option.iterate(
            store.device_list.get(alias),
            func(k : En.PublicKey) {
                store.ciphertext_list.delete(k);
            },
        );
        store.device_list.delete(alias);
    };

    // Get all devices, and their associated public keys, for this user.
    public shared ({ caller }) func get_devices() : async [(En.DeviceAlias, En.PublicKey)] {
        assert not Principal.isAnonymous(caller);
        assert is_user_registered(caller);

        let store = switch (users.get(caller)) {
            case (?s) { s };
            case null { return [] };
        };
        Iter.toArray(store.device_list.entries());
    };

    // Returns all public keys that are not already associated with a device.
    public shared ({ caller }) func get_unsynced_pubkeys() : async [En.PublicKey] {
        assert not Principal.isAnonymous(caller);
        assert is_user_registered(caller);

        let store = switch (users.get(caller)) {
            case (?s) { s };
            case null { return [] };
        };
        let entries = Iter.toArray(store.device_list.entries());

        Array.mapFilter(
            entries,
            func((alias, key) : (En.DeviceAlias, En.PublicKey)) : ?En.PublicKey {
                if (Option.isNull(store.ciphertext_list.get(key))) {
                    ?key;
                } else {
                    null;
                };
            },
        );
    };

    // Returns true iff the user has at least one public key.
    public shared ({ caller }) func is_seeded() : async Bool {
        assert not Principal.isAnonymous(caller);
        assert is_user_registered(caller);

        switch (users.get(caller)) {
            case null { false };
            case (?store) { store.ciphertext_list.size() > 0 };
        };
    };

    // Fetch the private key associated with this public key.
    public shared ({ caller }) func get_ciphertext(
        pk : En.PublicKey
    ) : async Result.Result<En.Ciphertext, En.GetCiphertextError> {

        assert not Principal.isAnonymous(caller);
        assert is_user_registered(caller);
        assert pk.size() <= MAX_PUBLIC_KEY_LENGTH;

        let store = switch (users.get(caller)) {
            case null { return #err(#notFound) };
            case (?s) { s };
        };
        if (not is_known_public_key(store, pk)) {
            return #err(#notFound) // pk unknown
        };
        switch (store.ciphertext_list.get(pk)) {
            case null { #err(#notSynced) };
            case (?ciphertext) { #ok(ciphertext) };
        };
    };

    // Store a list of public keys and associated private keys.
    // Considers only public keys matching those of a registered device.
    // Does not overwrite key-value pairs that already exist.
    public shared ({ caller }) func submit_ciphertexts(ciphertexts : [(En.PublicKey, En.Ciphertext)]) : () {
        assert not Principal.isAnonymous(caller);
        assert is_user_registered(caller);
        assert ciphertexts.size() <= MAX_DEVICES_PER_USER;

        let store = switch (users.get(caller)) {
            case null { return };
            case (?s) { s };
        };
        for ((pk, text) in ciphertexts.vals()) {
            if (
                is_known_public_key(store, pk) and Option.isNull(store.ciphertext_list.get(pk))
            ) {

                assert text.size() <= MAX_CYPHERTEXT_LENGTH;
                store.ciphertext_list.put(pk, text);
            };
        };
    };

    // Store a public key and associated private key in an empty user store.
    // This function is a no-op if the user already has at least one public key stored.
    public shared ({ caller }) func seed(pk : En.PublicKey, ctext : En.Ciphertext) : () {
        assert not Principal.isAnonymous(caller);
        assert is_user_registered(caller);
        assert pk.size() <= MAX_PUBLIC_KEY_LENGTH;
        assert ctext.size() <= MAX_CYPHERTEXT_LENGTH;

        let store = switch (users.get(caller)) {
            case null { return };
            case (?s) { s };
        };
        if (is_known_public_key(store, pk) and store.ciphertext_list.size() == 0) {
            store.ciphertext_list.put(pk, ctext);
        };
    };

    // The work required before a canister upgrade begins.
    // See [nextfactId], [stable_factsByUser], [stable_users]
    system func preupgrade() {
        Debug.print("Starting pre-upgrade hook...");
        stable_factsByUser := Iter.toArray(factsByUser.entries());
        stable_users := En.serializeAll(users);
        Debug.print("pre-upgrade finished.");
    };

    // The work required after a canister upgrade ends.
    // See [nextfactId], [stable_factsByUser], [stable_users]
    system func postupgrade() {
        Debug.print("Starting post-upgrade hook...");
        factsByUser := Map.fromIter<PrincipalName, List.List<EncryptedFact>>(
            stable_factsByUser.vals(),
            stable_factsByUser.size(),
            Text.equal,
            Text.hash,
        );

        users := En.deserialize(stable_users, stable_factsByUser.size());
        stable_factsByUser := [];
        Debug.print("post-upgrade finished.");
    };
};
