// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract RestaurantMembership is ERC721 {

    struct Membership {
        address vendor;
        string membershipType;
        string benefits;
        uint256 expiry;
    }

    struct MembershipOffering {
        string title;
        string benefits;
        uint256 price;
        uint256 duration;
        uint256 maxSupply;
        uint256 sold;
        bool isActive;
        uint256 createdAt;
    }

    uint256 public tokenIdCounter;

    mapping(uint256 => Membership) public memberships;

    mapping(uint256 => string) public membershipPictures;
    mapping(address => string) public profilePicURI;

    // store membership offerings per vendor + type
    mapping(address => mapping(string => MembershipOffering)) public membershipOfferings;
    mapping(address => string[]) public vendorMembershipTypes;

    // Track all vendors who have created memberships
    address[] public allVendors;
    mapping(address => bool) private vendorExists;

    mapping(address => uint256) public lastLogin;

    event MembershipOfferingCreated(address indexed vendor, string membershipType, uint256 price, uint256 duration, uint256 maxSupply);
    event MembershipOfferingUpdated(address indexed vendor, string membershipType, uint256 price, bool isActive);
    event MembershipPurchased(uint256 indexed tokenId, address indexed buyer, address indexed vendor, string membershipType, uint256 expiry);
    event ProfilePicUpdated(address indexed account, string uri);
    event MembershipPicUpdated(uint256 indexed tokenId, string uri);
    event MembershipLoggedIn(address indexed user, address indexed vendor, uint256 timestamp);

    constructor() ERC721("RestaurantMembership", "RMEM") {}

    // Merchant creates a membership offering
    function createMembership(
        string memory title,
        string memory benefits,
        uint256 price,
        uint256 duration,
        uint256 maxSupply
    ) public {
        require(price > 0, "Price must be greater than 0");
        require(maxSupply > 0, "Max supply must be greater than 0");
        require(bytes(title).length > 0, "Title cannot be empty");

        membershipOfferings[msg.sender][title] = MembershipOffering(
            title,
            benefits,
            price,
            duration,
            maxSupply,
            0,
            true,
            block.timestamp
        );

        // Add to vendor's membership types list if not already present
        bool exists = false;
        for (uint i = 0; i < vendorMembershipTypes[msg.sender].length; i++) {
            if (keccak256(abi.encodePacked(vendorMembershipTypes[msg.sender][i])) == keccak256(abi.encodePacked(title))) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            vendorMembershipTypes[msg.sender].push(title);
        }

        // Add vendor to allVendors list if not already present
        if (!vendorExists[msg.sender]) {
            allVendors.push(msg.sender);
            vendorExists[msg.sender] = true;
        }

        emit MembershipOfferingCreated(msg.sender, title, price, duration, maxSupply);
    }

    // Merchant updates membership offering (price, active status)
    function updateMembership(
        string memory title,
        uint256 price,
        bool isActive
    ) public {
        require(membershipOfferings[msg.sender][title].createdAt != 0, "Membership not found");
        require(price > 0, "Price must be greater than 0");

        membershipOfferings[msg.sender][title].price = price;
        membershipOfferings[msg.sender][title].isActive = isActive;

        emit MembershipOfferingUpdated(msg.sender, title, price, isActive);
    }

    // Get vendor's membership types
    function getVendorMemberships(address vendor) external view returns (string[] memory) {
        return vendorMembershipTypes[vendor];
    }

    // Get membership offering details
    function getMembershipOffering(address vendor, string memory title)
        external
        view
        returns (MembershipOffering memory)
    {
        return membershipOfferings[vendor][title];
    }

    function setProfilePic(string calldata uri) external {
        profilePicURI[msg.sender] = uri;
        emit ProfilePicUpdated(msg.sender, uri);
    }

    function setMembershipPic(uint256 tokenId, string calldata uri) external {
        require(memberships[tokenId].vendor == msg.sender, "Only vendor can set membership picture");

        membershipPictures[tokenId] = uri;
        emit MembershipPicUpdated(tokenId, uri);
    }

    function getMembershipPic(uint256 tokenId) external view returns (string memory) {
        return membershipPictures[tokenId];
    }

    // Get all vendors who have created memberships
    function getAllVendors() external view returns (address[] memory) {
        return allVendors;
    }

    // Get all membership offerings (with vendor address)
    struct MembershipOfferingWithVendor {
        address vendor;
        string title;
        string benefits;
        uint256 price;
        uint256 duration;
        uint256 maxSupply;
        uint256 sold;
        bool isActive;
        uint256 createdAt;
    }

    function getAllMembershipOfferings() external view returns (MembershipOfferingWithVendor[] memory) {
        uint256 totalCount = 0;

        // Count total offerings
        for (uint v = 0; v < allVendors.length; v++) {
            totalCount += vendorMembershipTypes[allVendors[v]].length;
        }

        MembershipOfferingWithVendor[] memory offerings = new MembershipOfferingWithVendor[](totalCount);
        uint256 index = 0;

        // Collect all offerings
        for (uint v = 0; v < allVendors.length; v++) {
            address vendor = allVendors[v];
            string[] memory types = vendorMembershipTypes[vendor];

            for (uint t = 0; t < types.length; t++) {
                MembershipOffering memory offering = membershipOfferings[vendor][types[t]];
                offerings[index] = MembershipOfferingWithVendor(
                    vendor,
                    offering.title,
                    offering.benefits,
                    offering.price,
                    offering.duration,
                    offering.maxSupply,
                    offering.sold,
                    offering.isActive,
                    offering.createdAt
                );
                index++;
            }
        }

        return offerings;
    }

    //  Customer buys membership
    function buyMembership(
        address vendor,
        string memory membershipType,
        string memory benefits,
        uint256 /*duration*/,
        uint256 /*price*/
    ) public payable {

        // Check if membership offering exists
        require(membershipOfferings[vendor][membershipType].createdAt != 0, "Membership offering not found");

        MembershipOffering storage offering = membershipOfferings[vendor][membershipType];
        require(offering.isActive, "Membership offering is not active");
        require(offering.sold < offering.maxSupply, "Membership offering is sold out");
        require(msg.value >= offering.price, "Insufficient payment");

        uint256 tokenId = tokenIdCounter++;

        memberships[tokenId] = Membership(
            vendor,
            membershipType,
            benefits,
            block.timestamp + offering.duration
        );

        _mint(msg.sender, tokenId);

        // Increment sold count
        offering.sold++;

        //  Transfer payment to vendor
        (bool success, ) = payable(vendor).call{value: msg.value}("");
        require(success, "Transfer failed");

        emit MembershipPurchased(tokenId, msg.sender, vendor, membershipType, block.timestamp + offering.duration);
    }

    function verifyMembership(address user, address vendor)
        public view returns (bool)
    {
        for (uint i = 0; i < tokenIdCounter; i++) {
            if (
                ownerOf(i) == user &&
                memberships[i].vendor == vendor &&
                memberships[i].expiry > block.timestamp
            ) {
                return true;
            }
        }
        return false;
    }

    function loginMembership(address vendor) external returns (bool) {
        bool valid = verifyMembership(msg.sender, vendor);
        require(valid, "No active membership for this vendor");

        lastLogin[msg.sender] = block.timestamp;
        emit MembershipLoggedIn(msg.sender, vendor, block.timestamp);
        return true;
    }

    // Get all memberships owned by a customer
    struct OwnedMembershipInfo {
        uint256 tokenId;
        address vendor;
        string membershipType;
        string benefits;
        uint256 expiry;
        bool isValid;
    }

    function getOwnedMemberships(address customer) external view returns (OwnedMembershipInfo[] memory) {
        uint256 balance = balanceOf(customer);
        OwnedMembershipInfo[] memory owned = new OwnedMembershipInfo[](balance);
        uint256 index = 0;

        for (uint i = 0; i < tokenIdCounter; i++) {
            try this.ownerOf(i) returns (address owner) {
                if (owner == customer) {
                    Membership memory membership = memberships[i];
                    owned[index] = OwnedMembershipInfo(
                        i,
                        membership.vendor,
                        membership.membershipType,
                        membership.benefits,
                        membership.expiry,
                        membership.expiry > block.timestamp
                    );
                    index++;
                }
            } catch {}
        }

        return owned;
    }
}
