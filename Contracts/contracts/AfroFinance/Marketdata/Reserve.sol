// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ITokenMintable {
    function mint(address _to, uint256 _amount) external;
}

contract Reserve is Ownable {
    using ECDSA for bytes32;

    // Enclave signer for settlement authorization
    address public enclaveSigner;

    // Prevent replay per commitment
    mapping(bytes32 => bool) public commitmentConsumed;

    // Optional on-chain snapshot of reserves (scaled)
    uint256 public totalReserves;
    
    // RWA token contract address (ERC3643 or ERC20 with mint capability)
    address public rwaToken;

    event EnclaveSignerUpdated(address indexed newSigner);
    event RwaTokenUpdated(address indexed newToken);
    event SettlementAccepted(
        bytes32 indexed orderCommitment,
        address indexed user,
        string ticker,
        address token,
        uint256 price,
        uint256 usdcAmount,
        uint256 tokenAmount,
        uint256 hcsSequence
    );
    event ReservesUpdated(uint256 totalReserves);

    constructor(address _owner) {
        _transferOwnership(_owner);
    }

    function setEnclaveSigner(address newSigner) external onlyOwner {
        enclaveSigner = newSigner;
        emit EnclaveSignerUpdated(newSigner);
    }

    function setRwaToken(address newToken) external onlyOwner {
        rwaToken = newToken;
        emit RwaTokenUpdated(newToken);
    }

    // Settlement payload is verified and applied; amounts are informational here.
    // The backend/enclave is responsible for transfers/mints via appropriate contracts.
    function settle(
        bytes32 orderCommitment,
        address user,
        string calldata ticker,
        address token,
        uint256 price,
        uint256 usdcAmount,
        uint256 tokenAmount,
        uint256 expiry,
        uint256 hcsSequence,
        bytes calldata signature
    ) external {
        require(enclaveSigner != address(0), "Signer not set");
        require(block.timestamp <= expiry, "Expired");
        require(!commitmentConsumed[orderCommitment], "Already settled");

        bytes32 payloadHash = keccak256(
            abi.encode(
                orderCommitment,
                user,
                keccak256(bytes(ticker)),
                token,
                price,
                usdcAmount,
                tokenAmount,
                expiry,
                hcsSequence
            )
        );

        // EIP-191 signed message
        address recovered = payloadHash.toEthSignedMessageHash().recover(signature);
        require(recovered == enclaveSigner, "Bad signature");

        commitmentConsumed[orderCommitment] = true;

        // Mint tokens to user if token contract is set and amount > 0
        if (rwaToken != address(0) && tokenAmount > 0) {
            try ITokenMintable(rwaToken).mint(user, tokenAmount) {
                // Mint successful
            } catch {
                // If mint fails (e.g., not agent, compliance fails), emit event but don't revert
                // Backend should handle retry or alternative settlement
            }
        }

        emit SettlementAccepted(
            orderCommitment,
            user,
            ticker,
            token,
            price,
            usdcAmount,
            tokenAmount,
            hcsSequence
        );
    }

    // Optional PoR update (called by enclave/owner as needed)
    function updateReserves(uint256 newTotal) external onlyOwner {
        totalReserves = newTotal;
        emit ReservesUpdated(newTotal);
    }
}
