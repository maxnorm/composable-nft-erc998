import { expect } from "chai";
import { ethers } from "hardhat";

describe("ERC998 contract", function () {
  let erc998: any;
  let erc998_address: any;
  let erc998_2: any;
  let erc998_2_address: any;
  let erc721_1: any;
  let erc721_1_address: any;
  let erc721_2: any;
  let erc721_2_address: any;

  let owner: any;
  let alice: any;
  let bob: any;

  before(async function () {
    [owner, alice, bob] = await ethers.getSigners();
  });

  beforeEach(async function () {
    // Deploy contracts before each test
    erc998 = await ethers.deployContract("SampleERC998");
    await erc998.waitForDeployment();
    erc998_address = await erc998.getAddress();
    erc998_2 = await ethers.deployContract("SampleERC998");
    await erc998_2.waitForDeployment();
    erc998_2_address = await erc998_2.getAddress();
    erc721_1 = await ethers.deployContract("SampleERC721");
    await erc721_1.waitForDeployment();
    erc721_1_address = await erc721_1.getAddress();
    erc721_2 = await ethers.deployContract("SampleERC721");
    await erc721_2.waitForDeployment();
    erc721_2_address = await erc721_2.getAddress();
  });

  // Helper function to convert bytes32 to address
  function bytes32ToAddress(bytes32Value: string): string {
    return ethers.getAddress(ethers.dataSlice(bytes32Value, 12, 32));
}

  async function mintERC998Token(to: any) {
    const tx = await erc998.mint(to);
    const receipt = await tx.wait();
    // Transfer event: [from, to, tokenId] (ERC721 Event)
    return receipt.logs[0].args[2];
  }

  async function mintERC998Token_2(to: any) {
    const tx = await erc998_2.mint(to);
    const receipt = await tx.wait();
    // Transfer event: [from, to, tokenId] (ERC721 Event)
    return receipt.logs[0].args[2];
  }

  async function mintERC721Token_1(to: any) {
    const tx = await erc721_1.mint(to);
    const receipt = await tx.wait();
    // Transfer event: [from, to, tokenId] (ERC721 Event)
    return receipt.logs[0].args[2];
  }

  async function mintERC721Token_2(to: any) {
    const tx = await erc721_2.mint(to);
    const receipt = await tx.wait();
    // Transfer event: [from, to, tokenId] (ERC721 Event)
    return receipt.logs[0].args[2];
  }

  async function mintFixture() {
    const ERC998TokenId = await mintERC998Token(owner.address);
    const ERC721TokenId_1 = await mintERC721Token_1(alice.address);
    const ERC721TokenId_2 = await mintERC721Token_2(bob.address);

    return { ERC998TokenId, ERC721TokenId_1, ERC721TokenId_2 };
  }

  async function mint2SetsOfTokens() {
    const { ERC998TokenId, ERC721TokenId_1, ERC721TokenId_2 } = await mintFixture();
    const ERC998TokenId_2 = await mintERC998Token(alice.address);
    return { ERC998TokenId, ERC721TokenId_1, ERC721TokenId_2, ERC998TokenId_2 };
  }

  async function mint2ERC998Tokens() {
    const ERC998TokenId_1_1 = await mintERC998Token(owner.address);
    const ERC998TokenId_1_2 = await mintERC998Token(owner.address);
    return { ERC998TokenId_1_1, ERC998TokenId_1_2 };
  }

  async function mintERC998TokenFromDifferentContract() {
    const ERC998TokenId_1_1 = await mintERC998Token(owner.address);
    const ERC998TokenId_2_1 = await mintERC998Token_2(owner.address);
    return { ERC998TokenId_1_1, ERC998TokenId_2_1 };
  }


  describe("Deployement", function () {
    it("Should deploy the SampleERC998 contract", async function () {
      const unmintedTokenId = 1;

      expect(await erc998.name()).to.equal("SampleERC998");
      expect(await erc998.symbol()).to.equal("S-ERC998");

      await expect(erc998.ownerOf(unmintedTokenId))
        .to.be.revertedWithCustomError(erc998, "ERC721NonexistentToken");

      expect(await erc998.totalChildContracts(unmintedTokenId)).to.equal(0);
      
      expect(await erc998.childExists(unmintedTokenId, erc721_1_address, 1)).to.be.false;

      await expect(erc998.getApproved(unmintedTokenId))
        .to.be.revertedWithCustomError(erc998, "ERC721NonexistentToken");
    });
  });

  describe("Basic Minting", function () {
    it("Should mint ERC998 token to the owner", async function () {
      const tokenId = await mintERC998Token(owner.address);

      expect(await erc998.ownerOf(tokenId)).to.equal(owner.address);
      expect(await erc998.totalChildContracts(tokenId)).to.equal(0);
      expect(await erc998.childExists(tokenId, erc721_1_address, 1)).to.be.false;
      expect(await erc998.getApproved(tokenId)).to.equal(ethers.ZeroAddress);
    });

    it("Should mint ERC721 token to the alice", async function () {
      const tokenId = await mintERC721Token_1(alice.address);

      expect(await erc721_1.ownerOf(tokenId)).to.equal(alice.address);
      expect(await erc721_1.getApproved(tokenId)).to.equal(ethers.ZeroAddress);
    });

    it("should mint second composable token with unique ID", async function () {
      const { ERC998TokenId } = await mintFixture();
      const ERC998TokenId_2 = await mintERC998Token(alice.address);
  
      expect(ERC998TokenId_2).to.not.equal(ERC998TokenId)
      expect(await erc998.ownerOf(ERC998TokenId)).to.equal(owner.address);
      expect(await erc998.ownerOf(ERC998TokenId_2)).to.equal(alice.address);
      expect(await erc998.totalChildContracts(ERC998TokenId_2)).to.equal(0);
  });

    it("should mint multiple ERC721 tokens to different owners", async function () {
      const { ERC721TokenId_1 } = await mintFixture();
      const ERC721TokenId_2 = await mintERC721Token_1(bob.address);
  
      expect(ERC721TokenId_2).to.not.equal(ERC721TokenId_1);
      expect(await erc721_1.ownerOf(ERC721TokenId_1)).to.equal(alice.address);
      expect(await erc721_1.ownerOf(ERC721TokenId_2)).to.equal(bob.address);
  });
  });

  describe("ERC721 Child Token Management", function () {
    describe("Transfer to Composable", function () {
      let ERC998TokenId: any;
      let ERC721TokenId_1: any;

      beforeEach(async function () {
        const { ERC998TokenId: _ERC998TokenId, ERC721TokenId_1: _ERC721TokenId_1 } = await mintFixture();
        ERC998TokenId = _ERC998TokenId;
        ERC721TokenId_1 = _ERC721TokenId_1;

        const data = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [ERC998TokenId]);
        await erc721_1.connect(alice)["safeTransferFrom(address,address,uint256,bytes)"](
            alice.address,
            erc998_address,
            ERC721TokenId_1,
            data
        );
      });

      it("should transfer ERC721 to ERC998 using safeTransferFrom", async function () {
        expect(await erc721_1.ownerOf(ERC721TokenId_1)).to.equal(erc998_address);
      });

      it("should verify child token exists in composable", async function () {
        expect(await erc998.childExists(ERC998TokenId, erc721_1_address, ERC721TokenId_1)).to.be.true;
      });

      it("should have correct root owner", async function () {
        const [rootOwnerBytes32, parentTokenId] = await erc998.ownerOfChild(erc721_1_address, ERC721TokenId_1);
        const rootOwner = bytes32ToAddress(rootOwnerBytes32);
        expect(rootOwner).to.equal(owner.address);
        expect(parentTokenId).to.equal(ERC998TokenId);
      });

      it("should have correct child contract in array", async function () {
        expect(await erc998.totalChildContracts(ERC998TokenId)).to.equal(1);
        expect(await erc998.childContractByIndex(ERC998TokenId, 0)).to.equal(erc721_1_address);
      });

      it("should have correct child token in array", async function () {
        expect(await erc998.totalChildTokens(ERC998TokenId, erc721_1_address)).to.equal(1);
        expect(await erc998.childTokenByIndex(ERC998TokenId, erc721_1_address, 0)).to.equal(ERC721TokenId_1);
      });
    });

    describe("Transfer from Composable", function () { 
      let ERC998TokenId: any;
      let ERC721TokenId_1: any;

      beforeEach(async function () {
        const { ERC998TokenId: _ERC998TokenId, ERC721TokenId_1: _ERC721TokenId_1 } = await mintFixture();
        ERC998TokenId = _ERC998TokenId;
        ERC721TokenId_1 = _ERC721TokenId_1;

        const data = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [ERC998TokenId]);
        await erc721_1.connect(alice)["safeTransferFrom(address,address,uint256,bytes)"](
            alice.address,
            erc998_address,
            ERC721TokenId_1,
            data
        );
      });

      it("should transfer composable to bob", async function () {
        await erc998.transferFrom(owner.address, bob.address, ERC998TokenId);
        expect(await erc998.ownerOf(ERC998TokenId)).to.equal(bob.address);

        const rootOwnerBytes32 = await erc998.rootOwnerOf(ERC998TokenId);
        const rootOwner = bytes32ToAddress(rootOwnerBytes32);
        expect(rootOwner).to.equal(bob.address);

        const [childRootOwnerBytes32] = await erc998.ownerOfChild(erc721_1_address, ERC721TokenId_1);
        const childRootOwner = bytes32ToAddress(childRootOwnerBytes32);
        expect(childRootOwner).to.equal(bob.address);
      });

      it("should transfer child to alice", async function () {
        await erc998.transferChild(ERC998TokenId, alice.address, erc721_1_address, ERC721TokenId_1);
        expect(await erc721_1.ownerOf(ERC721TokenId_1)).to.equal(alice.address);
        expect(await erc998.childExists(ERC998TokenId, erc721_1_address, ERC721TokenId_1)).to.be.false;
        await expect(erc998.ownerOfChild(
          erc721_1_address, ERC721TokenId_1)
        ).to.be.revertedWithCustomError(erc998, "ERC998_ChildTokenNotFound");
      });

      it("should remove child token from enumeration after transfer", async function () {
        expect(await erc998.totalChildTokens(ERC998TokenId, erc721_1_address)).to.equal(1);
        expect(await erc998.childTokenByIndex(ERC998TokenId, erc721_1_address, 0)).to.equal(ERC721TokenId_1);

        await erc998.transferChild(ERC998TokenId, alice.address, erc721_1_address, ERC721TokenId_1);

        expect(await erc998.totalChildTokens(ERC998TokenId, erc721_1_address)).to.equal(0);
      });

      it("should remove child contract from enumeration when last child token is transferred", async function () {
        expect(await erc998.totalChildContracts(ERC998TokenId)).to.equal(1);
        expect(await erc998.childContractByIndex(ERC998TokenId, 0)).to.equal(erc721_1_address);
        expect(await erc998.totalChildTokens(ERC998TokenId, erc721_1_address)).to.equal(1);
    
        await erc998.transferChild(ERC998TokenId, alice.address, erc721_1_address, ERC721TokenId_1);

        expect(await erc998.totalChildContracts(ERC998TokenId)).to.equal(0);
        
        await expect(
            erc998.childContractByIndex(ERC998TokenId, 0)
        ).to.be.revertedWithCustomError(
            erc998,
            "ERC998Enumerable_InvalidContractIndex"
        );
    
        expect(await erc998.totalChildTokens(ERC998TokenId, erc721_1_address)).to.equal(0);
      });
    });
  });

  describe("Child Transfer Between Composables", function () {
    let ERC998TokenId: any;
    let ERC721TokenId_1: any;
    let ERC721TokenId_2: any;
    let ERC998TokenId_2: any;

    beforeEach(async function () {
      const {ERC998TokenId: _ERC998TokenId , ERC721TokenId_1: _ERC721TokenId_1, ERC721TokenId_2: _ERC721TokenId_2, ERC998TokenId_2: _ERC998TokenId_2} = await mint2SetsOfTokens();
      ERC998TokenId = _ERC998TokenId;
      ERC721TokenId_1 = _ERC721TokenId_1;
      ERC721TokenId_2 = _ERC721TokenId_2;
      ERC998TokenId_2 = _ERC998TokenId_2;

      const data1 = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [ERC998TokenId]);
      await erc721_1.connect(alice)["safeTransferFrom(address,address,uint256,bytes)"](
        alice.address,
        erc998_address,
        ERC721TokenId_1,
        data1
      );

      const data2 = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [ERC998TokenId_2]);
      await erc721_2.connect(bob)["safeTransferFrom(address,address,uint256,bytes)"](
        bob.address,
        erc998_address,
        ERC721TokenId_2,
        data2
      );
      
    });

    it("should transfer second ERC721 to second composable", async function () {
      expect(await erc721_2.ownerOf(ERC721TokenId_2)).to.equal(erc998_address);
      expect(await erc998.totalChildContracts(ERC998TokenId_2)).to.equal(1);
      expect(await erc998.childExists(ERC998TokenId_2, erc721_2_address, ERC721TokenId_2)).to.be.true;

      const [rootOwnerBytes32] = await erc998.ownerOfChild(erc721_2_address, ERC721TokenId_2);
      const rootOwner = bytes32ToAddress(rootOwnerBytes32);
      expect(rootOwner).to.equal(alice.address);
    });
    it("should verify child exists in second composable", async function () {
      expect(await erc998.childExists(ERC998TokenId_2, erc721_2_address, ERC721TokenId_2)).to.be.true;
    });
    it("should transfer child between composables", async function () {
      // First verify initial state
      expect(await erc998.childExists(ERC998TokenId_2, erc721_2_address, ERC721TokenId_2)).to.be.true;
      expect(await erc998.childExists(ERC998TokenId, erc721_2_address, ERC721TokenId_2)).to.be.false;

      await erc998.connect(alice).transferChildToParent(
          ERC998TokenId_2,      // from token
          erc998_address,       // to contract
          ERC998TokenId,        // to token
          erc721_2_address,     // child contract
          ERC721TokenId_2,      // child token
      );

      expect(await erc998.childExists(ERC998TokenId_2, erc721_2_address, ERC721TokenId_2)).to.be.false;
      expect(await erc998.childExists(ERC998TokenId, erc721_2_address, ERC721TokenId_2)).to.be.true;

      const [rootOwnerBytes32] = await erc998.ownerOfChild(erc721_2_address, ERC721TokenId_2);
      const rootOwner = bytes32ToAddress(rootOwnerBytes32);
      expect(rootOwner).to.equal(owner.address);
    });
    it("should verify child contract arrays are updated", async function () {
      await erc998.connect(alice).transferChildToParent(
        ERC998TokenId_2,      // from token
        erc998_address,       // to contract
        ERC998TokenId,        // to token
        erc721_2_address,     // child contract
        ERC721TokenId_2,      // child token
      );

      const totalChildContracts_2 = await erc998.totalChildContracts(ERC998TokenId_2);
      const totalChildContracts_1 = await erc998.totalChildContracts(ERC998TokenId);
      expect(totalChildContracts_2).to.equal(0);
      expect(totalChildContracts_1).to.equal(2);

      expect(await erc998.childExists(ERC998TokenId_2, erc721_2_address, ERC721TokenId_2)).to.be.false;
      expect(await erc998.childExists(ERC998TokenId, erc721_2_address, ERC721TokenId_2)).to.be.true;

      expect(await erc998.totalChildTokens(ERC998TokenId, erc721_2_address)).to.equal(1);
      expect(await erc998.totalChildTokens(ERC998TokenId_2, erc721_2_address)).to.equal(0);

      expect(await erc998.childTokenByIndex(ERC998TokenId, erc721_2_address, 0)).to.equal(ERC721TokenId_2);
    });
    it("should verify ownership changes", async function () {
      await erc998.connect(alice).transferChildToParent(
        ERC998TokenId_2,      // from token
        erc998_address,       // to contract
        ERC998TokenId,        // to token
        erc721_2_address,     // child contract
        ERC721TokenId_2,      // child token
      );
      const [rootOwnerBytes32] = await erc998.ownerOfChild(erc721_2_address, ERC721TokenId_2);
      const rootOwner = bytes32ToAddress(rootOwnerBytes32);
      expect(rootOwner).to.equal(owner.address);
    });
  });

  describe("Child Retrieval & Safe Transfer", function () {
    it('should getChild when caller owns the ERC721', async function () {
      const { ERC998TokenId, ERC721TokenId_1 } = await mintFixture();
      
      await erc721_1.connect(alice).approve(erc998_address, ERC721TokenId_1);
      
      await erc998.connect(alice).getChild(
        alice.address,        // from: alice owns the ERC721
        ERC998TokenId,        // tokenId
        erc721_1_address,     // childContract
        ERC721TokenId_1       // childTokenId
      );
      
      expect(await erc998.childExists(ERC998TokenId, erc721_1_address, ERC721TokenId_1)).to.be.true;
      
      expect(await erc721_1.ownerOf(ERC721TokenId_1)).to.equal(erc998_address);
      
      const [rootOwnerBytes32] = await erc998.ownerOfChild(erc721_1_address, ERC721TokenId_1);
      const rootOwner = bytes32ToAddress(rootOwnerBytes32);
      expect(rootOwner).to.equal(owner.address);
    });
  });

  describe("Child Removal", function () {})

  describe("Approval", function () {
    it("should approve and revoke spender on ERC998", async function () {
      const { ERC998TokenId } = await mintFixture();
      
      expect(await erc998.getApproved(ERC998TokenId)).to.equal(ethers.ZeroAddress);
      
      await erc998.approve(bob.address, ERC998TokenId);
      expect(await erc998.getApproved(ERC998TokenId)).to.equal(bob.address);
      
      await erc998.connect(bob).transferFrom(owner.address, bob.address, ERC998TokenId);
      expect(await erc998.ownerOf(ERC998TokenId)).to.equal(bob.address);
    });
    
    it("should allow operator to approve child transfer", async function () {
      // Setup: mint tokens and transfer child to parent
      const { ERC998TokenId, ERC721TokenId_1 } = await mintFixture();
      const data = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [ERC998TokenId]);
      
      // Transfer ERC721 to the ERC998 token
      await erc721_1.connect(alice)["safeTransferFrom(address,address,uint256,bytes)"](
        alice.address,
        erc998_address,
        ERC721TokenId_1,
        data
      );

      await erc998.setApprovalForAll(bob.address, true);

      await erc998.connect(bob).transferChild(
        ERC998TokenId,
        alice.address,
        erc721_1_address,
        ERC721TokenId_1
      );

      expect(await erc721_1.ownerOf(ERC721TokenId_1)).to.equal(alice.address);
      expect(await erc998.childExists(ERC998TokenId, erc721_1_address, ERC721TokenId_1)).to.be.false;
    });
  });

  describe("Error Cases", function () {
    describe("ERC721 Operations", function () {
      it("should revert when transferring to zero address", async function () {
        const { ERC998TokenId } = await mintFixture();
        
        await expect(erc998.transferFrom(owner.address, ethers.ZeroAddress, ERC998TokenId))
          .to.be.revertedWithCustomError(erc998, "ERC721InvalidReceiver");
      });

      it("should revert when caller is not owner or approved", async function () {
        const { ERC998TokenId } = await mintFixture();
        
        await expect(erc998.connect(alice).transferFrom(owner.address, bob.address, ERC998TokenId))
          .to.be.revertedWithCustomError(erc998, "ERC721InsufficientApproval");
      });

      it("should revert when approving current owner", async function () {
        const { ERC998TokenId } = await mintFixture();
        await expect(erc998.approve(owner.address, ERC998TokenId))
          .to.be.revertedWithCustomError(erc998, "ERC998_ApprovalToCurrentOwner");
      });
    });

    describe("Root Owner Operations", function () {
      it("should revert when caller is not owner nor approved", async function () {
        const { ERC998TokenId } = await mintFixture();
    
        await expect(
          erc998.connect(alice).approve(bob.address, ERC998TokenId)
        ).to.be.revertedWithCustomError(erc998, "ERC998_CallerIsNotOwnerNorApprovedOperator")
          .withArgs(ERC998TokenId);
      });
    });

    describe("Child Operations", function () {
      it("transferChild should revert when caller is not authorized", async function () {
        const parentTokenId = await mintERC998Token(owner.address);
        const childTokenId = await mintERC998Token(owner.address);
        
        const data = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [parentTokenId]);
        await erc998.connect(owner)["safeTransferFrom(address,address,uint256,bytes)"](
          owner.address,
          erc998_address,
          childTokenId,
          data
        );

        await expect(
          erc998.connect(alice).transferChild(
            parentTokenId,
            owner.address,
            erc998_address,
            childTokenId
          )
        ).to.be.revertedWithCustomError(erc998, "ERC998_CallerIsNotOwnerNorApprovedOperator");
      })
      it("safeTransferChild should revert when childContract is not ERC721", async function () {
        const parentTokenId = await mintERC998Token(owner.address);
        const mockContract = await ethers.getContractFactory("MockContract");
        const mockContractInstance = await mockContract.deploy();

        await expect(
          erc998.connect(owner).safeTransferChild(
            parentTokenId,
            alice.address,
            await mockContractInstance.getAddress(),
            1
          )
        ).to.be.revertedWithCustomError(erc998, "ERC998_InvalidFromTokenId");
      });
      it("getChild revert when child already owned by parent", async function () {
        const parentTokenId = await mintERC998Token(owner.address);
        const childTokenId = await mintERC998Token(owner.address);
        
        const data = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [parentTokenId]);
        await erc998.connect(owner)["safeTransferFrom(address,address,uint256,bytes)"](
          owner.address,
          erc998_address,
          childTokenId,
          data
        );

        const anotherParentTokenId = await mintERC998Token(owner.address);
        await expect(
          erc998.connect(owner).getChild(
            owner.address,
            anotherParentTokenId,
            erc998_address,
            childTokenId
          )
        ).to.be.revertedWithCustomError(erc998, "ERC998_ChildTokenAlreadyExists");
      })

      it("getChild should revert when 'from' is not owner of the child token", async function () {
        const parentTokenId = await mintERC998Token(owner.address);
        const childTokenId = await mintERC721Token_1(alice.address);

        await expect(
          erc998.connect(bob).getChild(
            bob.address,
            parentTokenId,
            erc721_1_address,
            childTokenId
          )
        ).to.be.revertedWithCustomError(erc998, "ERC721InsufficientApproval");
      })
      it("childExists should return false when token index mapping is zero", async function () {
        const parentTokenId = await mintERC998Token(owner.address);
        const childTokenId = await mintERC721Token_1(owner.address);

        expect(await erc998.childExists(parentTokenId, erc721_1_address, childTokenId)).to.be.false;
      })
      it("childContractByIndex(0) should revert after last child contract is removed", async function () {
        const parentTokenId = await mintERC998Token(owner.address);
        const childTokenId = await mintERC721Token_1(owner.address);
        
        const data = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [parentTokenId]);
        await erc721_1.connect(owner)["safeTransferFrom(address,address,uint256,bytes)"](
          owner.address,
          erc998_address,
          childTokenId,
          data
        );

        expect(await erc998.childContractByIndex(parentTokenId, 0)).to.equal(erc721_1_address);

        await erc998.transferChild(parentTokenId, owner.address, erc721_1_address, childTokenId);

        await expect(
          erc998.childContractByIndex(parentTokenId, 0)
        ).to.be.revertedWithCustomError(erc998, "ERC998Enumerable_InvalidContractIndex");
      })
    });
  });



  describe("Events", function () {
    it("should emit ReceivedChild event", async function () {
      const { ERC998TokenId, ERC721TokenId_1 } = await mintFixture();
      const data = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [ERC998TokenId]);
  
      await expect(
        erc721_1.connect(alice)["safeTransferFrom(address,address,uint256,bytes)"](
        alice.address,
        erc998_address,
        ERC721TokenId_1,
        data
      )).to.emit(erc998, "ReceivedChild")
      .withArgs(
        alice.address,
        ERC998TokenId,
        erc721_1_address,
        ERC721TokenId_1
      );
    });

    it("should emit TransferChild event", async function () {
      const { ERC998TokenId, ERC721TokenId_1 } = await mintFixture();
      const data = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [ERC998TokenId]);
      await erc721_1.connect(alice)["safeTransferFrom(address,address,uint256,bytes)"](
        alice.address,
        erc998_address,
        ERC721TokenId_1,
        data
      );

      await expect(
        erc998.transferChild(
          ERC998TokenId,        
          bob.address,
          erc721_1_address,
          ERC721TokenId_1
        )
      ).to.emit(erc998, "TransferChild")
       .withArgs(
         ERC998TokenId,         // parentTokenId
         bob.address,           // to
         erc721_1_address,      // childContract
         ERC721TokenId_1        // childTokenId
       );
    });

    it("should emit correct Transfer events", async function () {
      const { ERC998TokenId } = await mintFixture();
      
      await expect(erc998.transferFrom(owner.address, alice.address, ERC998TokenId))
        .to.emit(erc998, "Transfer")
        .withArgs(owner.address, alice.address, ERC998TokenId);
    });
  });

  describe("Enumeration", function () {
      it("should enumerate child contracts correctly", async function () {
        const { ERC998TokenId, ERC721TokenId_1, ERC721TokenId_2 } = await mint2SetsOfTokens();
        const data = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [ERC998TokenId]);
        await erc721_1.connect(alice)["safeTransferFrom(address,address,uint256,bytes)"](
          alice.address,
          erc998_address,
          ERC721TokenId_1,
          data
        );

        expect(await erc998.totalChildContracts(ERC998TokenId)).to.equal(1);
        expect(await erc998.childContractByIndex(ERC998TokenId, 0)).to.equal(erc721_1_address);

        await erc721_2.connect(bob)["safeTransferFrom(address,address,uint256,bytes)"](
          bob.address,
          erc998_address,
          ERC721TokenId_2,
          data
        );

        expect(await erc998.totalChildContracts(ERC998TokenId)).to.equal(2);
        expect(await erc998.childContractByIndex(ERC998TokenId, 1)).to.equal(erc721_2_address);
      });
      it("should return correct contract by index", async function () {
        const { ERC998TokenId, ERC721TokenId_1 } = await mint2SetsOfTokens();
        const data = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [ERC998TokenId]);
        await erc721_1.connect(alice)["safeTransferFrom(address,address,uint256,bytes)"](
          alice.address,
          erc998_address,
          ERC721TokenId_1,
          data
        );

        expect(await erc998.childContractByIndex(ERC998TokenId, 0)).to.equal(erc721_1_address);
        expect(await erc998.childTokenByIndex(ERC998TokenId, erc721_1_address, 0)).to.equal(ERC721TokenId_1);
      });
      it("should revert for invalid contract index", async function () {
        const { ERC998TokenId, ERC721TokenId_1 } = await mint2SetsOfTokens();
        const data = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [ERC998TokenId]);
        await erc721_1.connect(alice)["safeTransferFrom(address,address,uint256,bytes)"](
          alice.address,
          erc998_address,
          ERC721TokenId_1,
          data
        );

        await expect(erc998.childContractByIndex(ERC998TokenId, 100))
          .to.be.revertedWithCustomError(erc998, "ERC998Enumerable_InvalidContractIndex");
        await expect(erc998.childTokenByIndex(ERC998TokenId, erc721_1_address, 3))
          .to.be.revertedWithCustomError(erc998, "ERC998Enumerable_InvalidTokenIndex");
      });
  });

  describe("Root Owner Management", function () {
    it("should get correct root owner", async function () {
      const { ERC998TokenId, ERC721TokenId_1, ERC721TokenId_2, ERC998TokenId_2 } = await mint2SetsOfTokens();

      let rootOwnerBytes = await erc998.rootOwnerOf(ERC998TokenId);
      let rootOwner = bytes32ToAddress(rootOwnerBytes);
      expect(rootOwner).to.equal(owner.address);

      const data = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [ERC998TokenId]);
      await erc721_1.connect(alice)["safeTransferFrom(address,address,uint256,bytes)"](
        alice.address,
        erc998_address,
        ERC721TokenId_1,
        data
      );

      const data2 = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [ERC998TokenId_2]);
      await erc998.connect(owner)["safeTransferFrom(address,address,uint256,bytes)"](
        owner.address,
        erc998_address,
        ERC998TokenId,
        data2
      );

      rootOwnerBytes = await erc998.rootOwnerOf(ERC998TokenId_2);
      rootOwner = bytes32ToAddress(rootOwnerBytes);
      expect(rootOwner).to.equal(alice.address);

      rootOwnerBytes = await erc998.rootOwnerOf(ERC998TokenId);
      rootOwner = bytes32ToAddress(rootOwnerBytes);
      expect(rootOwner).to.equal(alice.address);

      rootOwnerBytes = await erc998.rootOwnerOfChild(erc721_1_address, ERC721TokenId_1);
      rootOwner = bytes32ToAddress(rootOwnerBytes);
      expect(rootOwner).to.equal(alice.address);
    });

    it("should get correct root owner through 3-level same-contract hierarchy", async function () {
      const tokenA = await mintERC998Token(owner.address);
      const tokenB = await mintERC998Token(owner.address);
      const tokenC = await mintERC998Token(owner.address); 

      // First transfer: Make tokenA own tokenB
      const dataB = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [tokenA]);
      await erc998.connect(owner)["safeTransferFrom(address,address,uint256,bytes)"](
        owner.address,
        erc998_address,
        tokenB,
        dataB
      );

      // Second transfer: Make tokenB own tokenC
      const dataC = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [tokenB]);
      await erc998.connect(owner)["safeTransferFrom(address,address,uint256,bytes)"](
        owner.address,
        erc998_address,
        tokenC,
        dataC
      );

      // Verify the ownership chain
      expect(await erc998.ownerOf(tokenA)).to.equal(owner.address);
      expect(await erc998.ownerOf(tokenB)).to.equal(erc998_address);
      expect(await erc998.ownerOf(tokenC)).to.equal(erc998_address);

      const rootOwnerA = bytes32ToAddress(await erc998.rootOwnerOf(tokenA));
      const rootOwnerB = bytes32ToAddress(await erc998.rootOwnerOf(tokenB));
      const rootOwnerC = bytes32ToAddress(await erc998.rootOwnerOf(tokenC));

      expect(rootOwnerA).to.equal(owner.address);
      expect(rootOwnerB).to.equal(owner.address);
      expect(rootOwnerC).to.equal(owner.address);
    })
    
    it("should get correct root owner through 3-level cross-contract hierarchy", async function () {
      const tokenA = await mintERC998Token(owner.address);
      const tokenB = await mintERC998Token_2(owner.address);
      const tokenC = await mintERC998Token(owner.address);

      // First transfer: Make tokenA (from contract 1) own tokenB (from contract 2)
      const dataB = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [tokenA]);
      await erc998_2.connect(owner)["safeTransferFrom(address,address,uint256,bytes)"](
        owner.address,
        erc998_address,
        tokenB,
        dataB
      );

      // Second transfer: Make tokenB (from contract 2) own tokenC (from contract 1)
      const dataC = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [tokenB]);
      await erc998.connect(owner)["safeTransferFrom(address,address,uint256,bytes)"](
        owner.address,
        erc998_2_address,
        tokenC,
        dataC
      );

      const res = await erc998_2.rootOwnerOf(tokenB);
      const rootOwnerB = bytes32ToAddress(res);

      expect(rootOwnerB).to.equal(owner.address);


      const res2 = await erc998.rootOwnerOf(tokenC);
      const rootOwnerC = bytes32ToAddress(res2);
      expect(rootOwnerC).to.equal(owner.address);
    })
    it("should get direct owner of child in 2-level same-contract hierarchy", async function () {
      const tokenA = await mintERC998Token(owner.address);
      const tokenB = await mintERC998Token(owner.address);

      const dataB = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [tokenA]);
      await erc998.connect(owner)["safeTransferFrom(address,address,uint256,bytes)"](
        owner.address,
        erc998_address,
        tokenB,
        dataB
      );

      expect(await erc998.ownerOf(tokenA)).to.equal(owner.address);
      expect(await erc998.ownerOf(tokenB)).to.equal(erc998_address);
    })
    it("should get direct owner of child in 2-level cross-contract hierarchy", async function () {
      const tokenA = await mintERC998Token(owner.address);
      const tokenB = await mintERC998Token_2(owner.address);

      const dataB = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [tokenA]);
      await erc998_2.connect(owner)["safeTransferFrom(address,address,uint256,bytes)"](
        owner.address,
        erc998_address,
        tokenB,
        dataB
      );

      expect(await erc998.ownerOf(tokenA)).to.equal(owner.address);
      expect(await erc998_2.ownerOf(tokenB)).to.equal(erc998_address);
    })
  });

  describe("Complex Scenarios", function () {
    describe("Circularity & Depth", function () {
      it("should revert to create direct circularity (A -> A)", async function () {
        const { ERC998TokenId } = await mintFixture();

        const data = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [ERC998TokenId]);
        await expect(
          erc998.connect(owner)["safeTransferFrom(address,address,uint256,bytes)"](
            owner.address,
            erc998_address,
            ERC998TokenId,
            data
          )
        ).to.be.revertedWithCustomError(erc998, "ERC998_CircularOwnership")
      });

      it("should revert to create indirect circularity (A -> B -> A)", async function () {
        const { ERC998TokenId_1_1, ERC998TokenId_1_2 } = await mint2ERC998Tokens();

        const data = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [ERC998TokenId_1_1]);
        await erc998.connect(owner)["safeTransferFrom(address,address,uint256,bytes)"](
          owner.address,
          erc998_address,
          ERC998TokenId_1_2 ,
          data
        );

        const data2 = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [ERC998TokenId_1_2]);
        await expect(
        erc998.connect(owner)["safeTransferFrom(address,address,uint256,bytes)"](
          owner.address,
          erc998_address,
          ERC998TokenId_1_1,
          data2
        )).to.be.revertedWithCustomError(erc998, "ERC998_CircularOwnership")
      });

      // ------------------------------------------------------------
      // Commented it in local testing because it's long to run
      // ALWAYS LEAVE UNCOMMENTED FOR THE CI
      // ------------------------------------------------------------
      it("should create deep nested composables up to MAX_DEPTH", async function () {
        this.timeout(1000000000);

        const MAX_DEPTH = Number(await erc998.MAX_DEPTH());

        let parentTokenId = await mintERC998Token(owner.address);

        // Create MAX_DEPTH - 1 nested composables since we already have one
        for (let i = 0; i < MAX_DEPTH - 1; i++) {
          const childTokenId = await mintERC998Token(owner.address);
          const data = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [parentTokenId]);
          await erc998.connect(owner)["safeTransferFrom(address,address,uint256,bytes)"](
            owner.address,
            erc998_address,
            childTokenId,
            data
          );
          parentTokenId = childTokenId;
        }
      });


      it("should revert to create deep nested composables beyond MAX_DEPTH", async function () {
        this.timeout(1000000000);

        const MAX_DEPTH = Number(await erc998.MAX_DEPTH());

        let parentTokenId = await mintERC998Token(owner.address);

        for (let i = 0; i < MAX_DEPTH - 1; i++) {
          const childTokenId = await mintERC998Token(owner.address);
          const data = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [parentTokenId]);
          await erc998.connect(owner)["safeTransferFrom(address,address,uint256,bytes)"](
            owner.address,
            erc998_address,
            childTokenId,
            data
          );
          parentTokenId = childTokenId;
        }

        // Create the MAX_DEPTHth token
        const childTokenId = await mintERC998Token(owner.address);
        const data = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [parentTokenId]);
        await expect(
          erc998.connect(owner)["safeTransferFrom(address,address,uint256,bytes)"](
            owner.address,
            erc998_address,
            childTokenId,
            data
          )
        ).to.be.revertedWithCustomError(erc998, "ERC998_TooDeepComposable");
      })
      // ------------------------------------------------------------
    });

    describe("Cross-Contract Composability", function () {
      it("should revert when creating a cross-contract circular composable", async function () {
        const { ERC998TokenId_1_1, ERC998TokenId_2_1 } = await mintERC998TokenFromDifferentContract();

        const data1 = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [ERC998TokenId_2_1]);
        await erc998.connect(owner)["safeTransferFrom(address,address,uint256,bytes)"](
          owner.address,
          erc998_2_address,
          ERC998TokenId_1_1,
          data1
        );

        const data2 = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [ERC998TokenId_1_1]);
        await expect(
          erc998_2.connect(owner)["safeTransferFrom(address,address,uint256,bytes)"](
            owner.address,
            erc998_address,
            ERC998TokenId_2_1,
            data2
          )
        ).to.be.revertedWithCustomError(erc998_2, "ERC998_CircularOwnership");
      });

      // ------------------------------------------------------------
      // Commented it in local testing because it's long to run
      // AlWAYS LEAVE UNCOMMENTED FOR THE CI
      // ------------------------------------------------------------
      it("should build a deep cross-contract hierarchy up to MAX_DEPTH", async function () {
        this.timeout(1_000_000_000);

        const MAX_DEPTH = Number(await erc998.MAX_DEPTH());

        let parentTokenId     = await mintERC998Token(owner.address);
        let parentContract    = erc998;
        let childContract     = erc998_2;

        for (let depth = 1; depth < MAX_DEPTH; depth++) {
          const childTokenId =
            childContract === erc998 ? await mintERC998Token(owner.address)
                                     : await mintERC998Token_2(owner.address);

          const data = ethers.AbiCoder.defaultAbiCoder().encode(
            ['uint256'],
            [parentTokenId]
          );

          await childContract
            .connect(owner)
            ["safeTransferFrom(address,address,uint256,bytes)"](
              owner.address,
              await parentContract.getAddress(),
              childTokenId,
              data
            );

          parentTokenId  = childTokenId;
          [parentContract, childContract] = [childContract, parentContract];
        }
      });

      it("should revert when the cross-contract hierarchy exceeds MAX_DEPTH", async function () {
        this.timeout(1_000_000_000);

        const MAX_DEPTH = Number(await erc998.MAX_DEPTH());

        let parentTokenId  = await mintERC998Token(owner.address);
        let parentContract = erc998;
        let childContract  = erc998_2;

        for (let depth = 1; depth < MAX_DEPTH; depth++) {
          const childTokenId =
            childContract === erc998 ? await mintERC998Token(owner.address)
                                     : await mintERC998Token_2(owner.address);

          const data = ethers.AbiCoder.defaultAbiCoder().encode(
            ['uint256'],
            [parentTokenId]
          );

          await childContract
            .connect(owner)
            ["safeTransferFrom(address,address,uint256,bytes)"](
              owner.address,
              await parentContract.getAddress(),
              childTokenId,
              data
            );

          parentTokenId = childTokenId;
          [parentContract, childContract] = [childContract, parentContract];
        }

        // now try to add one more level (depth == MAX_DEPTH + 1)
        const extraChildId =
          childContract === erc998 ? await mintERC998Token(owner.address)
                                   : await mintERC998Token_2(owner.address);

        const data = ethers.AbiCoder.defaultAbiCoder().encode(
          ['uint256'],
          [parentTokenId]
        );

        await expect(
          childContract
            .connect(owner)
            ["safeTransferFrom(address,address,uint256,bytes)"](
              owner.address,
              await parentContract.getAddress(),
              extraChildId,
              data
            )
        ).to.be.revertedWithCustomError(
          childContract,
          "ERC998_TooDeepComposable"
        );
      });
      // ------------------------------------------------------------
    }); 
  });

  describe("ERC20 Support", function () {
  });
});