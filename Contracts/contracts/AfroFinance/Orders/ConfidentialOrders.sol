// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {FunctionAssetConsumer} from "../Marketdata/FunctionAssetConsumer.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ConfidentialOrders is Ownable, FunctionAssetConsumer {
    event BuyOrderCreated(
        address indexed user,
        string ticker,
        address token,
        bytes32 orderCommitment,
        uint256 price
    );
    event SellOrderCreated(
        address indexed user,
        string ticker,
        address token,
        bytes32 orderCommitment,
        uint256 price
    );

    event SellOrderUSDCWithdraw(address indexed user, uint256 amount);
    event Deposited(address indexed user, uint256 amount);

    // Track user deposits (escrowed HUSDC)
    mapping(address => uint256) public deposits;

    // Store pending orders
    struct PendingBuyOrder {
        address user;
        string ticker;
        address token;
        bytes32 orderCommitment;
        address orderAddr;
    }
    mapping(bytes32 => PendingBuyOrder) public pendingBuyOrders;

    // Store pending sell orders
    struct PendingSellOrder {
        address user;
        string ticker;
        address token;
        bytes32 orderCommitment;
        address orderAddr;
    }
    mapping(bytes32 => PendingSellOrder) public pendingSellOrders;
    address public immutable agent;
    IERC20 public immutable usdcToken;

    constructor(address _agent, address _usdc) Ownable() {
        usdcToken = IERC20(_usdc);
        agent = _agent;
    }

    modifier onlyAgent() {
        require(msg.sender == agent, "Only agent can call this function");
        _;
    }

    // Buy asset with USDC, requesting price from oracle
    // orderAddr is the address to receive the callback
    function buyAsset(
        string memory asset,
        string memory ticker,
        address token,
        bytes32 orderCommitment,
        uint64 subscriptionId,
        address orderAddr
    ) public {
        // Request price from inherited FunctionAssetConsumer
        bytes32 requestId = getAssetPrice(asset, subscriptionId);

        // Store pending order with callback address
        pendingBuyOrders[requestId] = PendingBuyOrder(
            msg.sender,
            ticker,
            token,
            orderCommitment,
            orderAddr
        );
    }

    // Sell asset for USDC, requesting price from oracle
    // orderAddr is the address to receive the callback (usually msg.sender, or another contract)
    function sellAsset(
        string memory asset,
        string memory ticker,
        address token,
        bytes32 orderCommitment,
        uint64 subscriptionId,
        address orderAddr
    ) public {
        // Request price from inherited FunctionAssetConsumer
        bytes32 requestId = getAssetPrice(asset, subscriptionId);
        pendingSellOrders[requestId] = PendingSellOrder(
            msg.sender,
            ticker,
            token,
            orderCommitment,
            orderAddr
        );
    }

    // This function is called by the contract itself as a callback
    function fulfillBuyOrder(bytes32 requestId, uint256 price) public {
        PendingBuyOrder memory order = pendingBuyOrders[requestId];
        require(order.user != address(0), "Order not found");
        require(price > 0, "Price not fulfilled yet");

        // Emit event with commitment and price; settlement handled off-chain
        emit BuyOrderCreated(order.user, order.ticker, order.token, order.orderCommitment, price);

        // Clean up
        delete pendingBuyOrders[requestId];
    }

    // This function is called by the contract itself
    function fulfillSellOrder(bytes32 requestId, uint256 price) public {
        PendingSellOrder memory order = pendingSellOrders[requestId];
        require(order.user != address(0), "Sell order not found");
        require(price > 0, "Price not fulfilled yet");

        // Emit event with commitment and price; settlement handled off-chain
        emit SellOrderCreated(order.user, order.ticker, order.token, order.orderCommitment, price);

        // Clean up
        delete pendingSellOrders[requestId];
    }

    // Deposit HUSDC to escrow for buy orders
    function deposit(uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        require(usdcToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        deposits[msg.sender] += amount;
        emit Deposited(msg.sender, amount);
    }

    // Withdraw deposited HUSDC (can be called by agent after order fulfillment or cancellation)
    function withdrawDeposit(uint256 amount) public onlyAgent {
        require(deposits[msg.sender] >= amount, "Insufficient deposit");
        deposits[msg.sender] -= amount;
        require(usdcToken.transfer(msg.sender, amount), "Transfer failed");
    }

    // Agent can transfer deposited funds to execute settlement
    function transferDepositToAgent(address user, uint256 amount) public onlyAgent {
        require(deposits[user] >= amount, "Insufficient user deposit");
        deposits[user] -= amount;
        require(usdcToken.transfer(agent, amount), "Transfer to agent failed");
    }

    function FulFillSellOrderUSDCWithdraw(uint256 amount) public onlyAgent {
        usdcToken.transfer(msg.sender, amount);
        emit SellOrderUSDCWithdraw(msg.sender, amount);
    }

    // Override fulfillRequest to call the callback for buy or sell orders
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal virtual override {
        string memory asset = requestIdToAsset[requestId];
        if (bytes(asset).length == 0) {
            revert UnexpectedRequestID(requestId);
        }
        requestIdToResponse[requestId] = response;
        requestIdToError[requestId] = err;
        uint256 price = abi.decode(response, (uint256));
        assetToPrice[asset] = price;
        emit Response(requestId, asset, price, response, err);
        // Only emit events for buy or sell orders stored in this contract
        PendingBuyOrder memory buyOrder = pendingBuyOrders[requestId];
        if (buyOrder.orderAddr != address(0)) {
            fulfillBuyOrder(requestId, price);
        } else {
            PendingSellOrder memory sellOrder = pendingSellOrders[requestId];
            if (sellOrder.orderAddr != address(0)) {
                fulfillSellOrder(requestId, price);
            }
        }
    }
}