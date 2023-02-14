// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts@4.8.1/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts@4.8.1/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts@4.8.1/access/Ownable.sol";
import "@openzeppelin/contracts@4.8.1/utils/Counters.sol";

contract NFTHubTestnet is ERC721, ERC721Burnable, Ownable {

    string baseURI;
    uint256 maxPerWallet;
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor(string memory base_uri_url) ERC721("NFTHubTestnet", "NFTH") {

        baseURI= base_uri_url;
        maxPerWallet = 3;
    }

    function _baseURI() view internal override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory url) external onlyOwner {
        baseURI = url;
    }

 function setMaxPerWallet(uint256  nb) external onlyOwner {
        maxPerWallet = nb;
    }

    function Mint(address to) public{
        require(balanceOf(msg.sender) < maxPerWallet || msg.sender == owner() );
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }
}
