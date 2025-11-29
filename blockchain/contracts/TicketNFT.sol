// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TicketNFT
 * @dev NFT 티켓 컨트랙트 - P2P 전송 차단으로 스캘핑 방지
 *
 * 핵심 기능:
 * 1. P2P 전송 차단: 개인 간 직접 양도 불가능
 * 2. 환불만 가능: 오직 플랫폼(owner)에게만 반환 가능
 * 3. 플랫폼이 재판매: 환불된 티켓은 플랫폼이 다른 사용자에게 재판매
 */
contract TicketNFT is ERC721, Ownable {
    uint256 private _nextTokenId;

    // 티켓 정보
    struct TicketInfo {
        string eventName;
        uint256 eventDate;
        uint256 price;
        bool isUsed;
    }

    // tokenId => TicketInfo
    mapping(uint256 => TicketInfo) public tickets;

    // 이벤트
    event TicketMinted(address indexed to, uint256 indexed tokenId, string eventName);
    event TicketRefunded(address indexed from, uint256 indexed tokenId);
    event TicketUsed(uint256 indexed tokenId);

    constructor() ERC721("TicketGuard NFT", "TICKET") Ownable(msg.sender) {}

    /**
     * @dev 티켓 발행 (오직 플랫폼만 가능)
     * @param to 티켓을 받을 사용자 주소
     * @param eventName 공연/이벤트 이름
     * @param eventDate 공연 날짜 (Unix timestamp)
     * @param price 티켓 가격 (Wei 단위)
     */
    function mintTicket(
        address to,
        string memory eventName,
        uint256 eventDate,
        uint256 price
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);

        tickets[tokenId] = TicketInfo({
            eventName: eventName,
            eventDate: eventDate,
            price: price,
            isUsed: false
        });

        emit TicketMinted(to, tokenId, eventName);
        return tokenId;
    }

    /**
     * @dev 티켓 정보 조회
     */
    function getTicketInfo(uint256 tokenId) public view returns (TicketInfo memory) {
        require(_ownerOf(tokenId) != address(0), "Ticket does not exist");
        return tickets[tokenId];
    }

    /**
     * @dev 티켓 사용 처리 (입장 시)
     */
    function useTicket(uint256 tokenId) public onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Ticket does not exist");
        require(!tickets[tokenId].isUsed, "Ticket already used");

        tickets[tokenId].isUsed = true;
        emit TicketUsed(tokenId);
    }

    /**
     * @dev 티켓 전송 제한 로직 - 핵심 스캘핑 방지 기능!
     *
     * 허용되는 경우:
     * 1. Minting (from == address(0))
     * 2. Burning (to == address(0))
     * 3. 환불 (to == owner) - 플랫폼으로 반환
     * 4. 재판매 (from == owner) - 플랫폼에서 사용자로 판매
     *
     * 차단되는 경우:
     * - 모든 P2P 전송 (사용자 간 직접 양도)
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);

        // 1. Minting 허용
        if (from == address(0)) {
            return super._update(to, tokenId, auth);
        }

        // 2. Burning 허용
        if (to == address(0)) {
            return super._update(to, tokenId, auth);
        }

        // 3. 환불 (플랫폼으로 반환) 허용
        if (to == owner()) {
            emit TicketRefunded(from, tokenId);
            return super._update(to, tokenId, auth);
        }

        // 4. 재판매 (플랫폼에서 사용자로 판매) 허용
        if (from == owner()) {
            return super._update(to, tokenId, auth);
        }

        // 5. 그 외 모든 P2P 전송 차단!
        revert("Transfer not allowed. Only refund to platform is permitted.");
    }

    /**
     * @dev transferFrom 오버라이드 - P2P 전송 차단
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        // 플랫폼(owner)이 관련된 전송만 허용
        require(
            to == owner() || from == owner(),
            "Direct transfer not allowed. Use refund."
        );
        super.transferFrom(from, to, tokenId);
    }

    /**
     * @dev safeTransferFrom 오버라이드 - P2P 전송 차단
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override {
        require(
            to == owner() || from == owner(),
            "Direct transfer not allowed. Use refund."
        );
        super.safeTransferFrom(from, to, tokenId, data);
    }
}
