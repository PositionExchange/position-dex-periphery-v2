// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

library DexErrors {
    string public constant DEX_ONLY_OWNER = "DEX_01";
    string public constant DEX_EMPTY_ADDRESS = "DEX_02";
    string public constant DEX_NEED_MORE_BNB = "DEX_03";
    string public constant DEX_MARKET_NOT_FULL_FILL = "DEX_04";
    string public constant DEX_MUST_NOT_TOKEN_RFI = "DEX_05";
    string public constant DEX_MUST_ORDER_BUY = "DEX_06";
    string public constant DEX_NO_LIMIT_TO_CANCEL = "DEX_07";
    string public constant DEX_ORDER_MUST_NOT_FILLED = "DEX_08";
    string public constant DEX_INVALID_ORDER_ID = "DEX_09";
    string public constant DEX_NO_AMOUNT_TO_CLAIM = "DEX_10";
    string public constant DEX_SPOT_MANGER_EXITS = "DEX_11";
    string public constant DEX_MUST_IDENTICAL_ADDRESSES = "DEX_12";
    string public constant DEX_MUST_BNB = "DEX_13";
    string public constant DEX_ONLY_COUNTER_PARTY = "DEX_14";
    string public constant DEX_INVALID_PAIR_INFO = "DEX_15";

    string public constant LQ_NOT_IMPLEMENT_YET = "LQ_01";
    string public constant LQ_EMPTY_STAKING_MANAGER = "LQ_02";
    string public constant LQ_NO_LIQUIDITY = "LQ_03";
    string public constant LQ_POOL_EXIST = "LQ_04";
    string public constant LQ_INDEX_RANGE_NOT_DIFF = "LQ_05";
    string public constant LQ_INVALID_NUMBER = "LQ_06";
    string public constant LQ_NOT_SUPPORT = "LQ_07";
}
