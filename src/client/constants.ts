// Configurable:
export const KURTOSIS_CLOUD_PROTOCOL = "https";
export const KURTOSIS_CLOUD_HOST = "cloud.kurtosis.com";

// Cloud
export const KURTOSIS_PACKAGE_INDEXER_URL =
  process.env.REACT_APP_KURTOSIS_PACKAGE_INDEXER_URL || `${KURTOSIS_CLOUD_PROTOCOL}://${KURTOSIS_CLOUD_HOST}:9770`;
