export type DeploymentMode = "full" | "marketing";

export function getDeploymentMode(): DeploymentMode {
  return process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === "marketing" ? "marketing" : "full";
}

export function isMarketingDeployment(): boolean {
  return getDeploymentMode() === "marketing";
}
