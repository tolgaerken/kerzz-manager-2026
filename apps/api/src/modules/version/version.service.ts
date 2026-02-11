import { Injectable } from "@nestjs/common";
import { readFileSync } from "fs";
import { join } from "path";

@Injectable()
export class VersionService {
  private version: string;

  constructor() {
    this.version = this.loadVersion();
  }

  private loadVersion(): string {
    try {
      const packageJsonPath = join(__dirname, "../../../package.json");
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      return packageJson.version || "0.0.0";
    } catch (error) {
      console.error("Version could not be loaded:", error);
      return "0.0.0";
    }
  }

  getVersion() {
    return {
      version: this.version,
      name: "Kerzz Manager API",
    };
  }
}
