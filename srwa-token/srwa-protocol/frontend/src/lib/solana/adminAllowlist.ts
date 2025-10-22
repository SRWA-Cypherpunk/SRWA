import { AnchorProvider, Program, web3 } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

export interface AdminAllowlistService {
  initializeAdminRegistry(): Promise<string>;
  addPlatformAdmin(newAdmin: PublicKey): Promise<string>;
  removePlatformAdmin(adminToRemove: PublicKey): Promise<string>;
  getAdminRegistry(): Promise<any>;
  isAdminAuthorized(admin: PublicKey): Promise<boolean>;
}

export class AdminAllowlistServiceImpl implements AdminAllowlistService {
  constructor(
    private program: Program,
    private provider: AnchorProvider
  ) {}

  async initializeAdminRegistry(): Promise<string> {
    const [adminRegistry] = PublicKey.findProgramAddressSync(
      [Buffer.from("admin_registry")],
      this.program.programId
    );

    const tx = await this.program.methods
      .initializeAdminRegistry()
      .accounts({
        superAdmin: this.provider.wallet.publicKey,
        adminRegistry,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  async addPlatformAdmin(newAdmin: PublicKey): Promise<string> {
    const [adminRegistry] = PublicKey.findProgramAddressSync(
      [Buffer.from("admin_registry")],
      this.program.programId
    );

    const tx = await this.program.methods
      .addPlatformAdmin(newAdmin)
      .accounts({
        superAdmin: this.provider.wallet.publicKey,
        adminRegistry,
      })
      .rpc();

    return tx;
  }

  async removePlatformAdmin(adminToRemove: PublicKey): Promise<string> {
    const [adminRegistry] = PublicKey.findProgramAddressSync(
      [Buffer.from("admin_registry")],
      this.program.programId
    );

    const tx = await this.program.methods
      .removePlatformAdmin(adminToRemove)
      .accounts({
        superAdmin: this.provider.wallet.publicKey,
        adminRegistry,
      })
      .rpc();

    return tx;
  }

  async getAdminRegistry(): Promise<any> {
    const [adminRegistry] = PublicKey.findProgramAddressSync(
      [Buffer.from("admin_registry")],
      this.program.programId
    );

    try {
      const accountInfo = await this.provider.connection.getAccountInfo(adminRegistry);

      if (!accountInfo) {
        return null;
      }

      if (this.program.account?.platformAdminRegistry) {
        try {
          const account = await this.program.account.platformAdminRegistry.fetch(adminRegistry);
          return account;
        } catch (e) {
          console.log("Standard fetch failed, trying manual decode...");
        }
      }

      try {
        const account = this.program.coder.accounts.decode(
          "PlatformAdminRegistry",
          accountInfo.data
        );
        return account;
      } catch (decodeError) {
        const data = accountInfo.data;
        let offset = 8;

        const superAdminBytes = data.slice(offset, offset + 32);
        const superAdmin = new PublicKey(superAdminBytes);
        offset += 32;

        const adminCountBytes = data.slice(offset, offset + 4);
        const adminCount = new DataView(adminCountBytes.buffer).getUint32(0, true);
        offset += 4;

        const authorizedAdmins = [];
        for (let i = 0; i < adminCount; i++) {
          const adminBytes = data.slice(offset, offset + 32);
          authorizedAdmins.push(new PublicKey(adminBytes));
          offset += 32;
        }

        return {
          superAdmin,
          authorizedAdmins,
          createdAt: 0,
          updatedAt: 0,
          bump: data[data.length - 1]
        };
      }
    } catch (error) {
      console.error("Admin registry not initialized:", error);
      return null;
    }
  }

  async isAdminAuthorized(admin: PublicKey): Promise<boolean> {
    const registry = await this.getAdminRegistry();
    if (!registry) return false;

    return registry.authorizedAdmins.some(
      (authorizedAdmin: PublicKey) =>
        authorizedAdmin.toString() === admin.toString()
    );
  }
}
