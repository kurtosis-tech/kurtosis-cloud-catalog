import { Flex, Heading, Spinner } from "@chakra-ui/react";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import { Result } from "true-myth";
import { GetPackagesResponse, KurtosisPackage } from "../client/packageIndexer/api/kurtosis_package_indexer_pb";
import { useKurtosisPackageIndexerClient } from "../client/packageIndexer/KurtosisPackageIndexerClientContext";
import { isDefined } from "../utils";

export type CatalogState = {
  catalog: Result<GetPackagesResponse, string>;
  refreshCatalog: () => Promise<Result<GetPackagesResponse, string>>;
};

const CatalogContext = createContext<CatalogState>(null as any);

export const CatalogContextProvider = ({ children }: PropsWithChildren) => {
  const packageIndexerClient = useKurtosisPackageIndexerClient();
  const [catalog, setCatalog] = useState<Result<GetPackagesResponse, string>>();

  const refreshCatalog = useCallback(async () => {
    setCatalog(undefined);
    const catalog = await packageIndexerClient.getPackages();
    setCatalog(catalog);
    return catalog;
  }, [packageIndexerClient]);

  useEffect(() => {
    refreshCatalog();
  }, [refreshCatalog]);

  if (!isDefined(catalog)) {
    return (
      <Flex width="100%" direction="column" alignItems={"center"} gap={"1rem"} padding={"3rem"}>
        <Spinner size={"xl"} />
        <Heading as={"h2"} fontSize={"2xl"}>
          Fetching Catalog...
        </Heading>
      </Flex>
    );
  }

  return <CatalogContext.Provider value={{ catalog, refreshCatalog }}>{children}</CatalogContext.Provider>;
};

export const useCatalogContext = () => {
  return useContext(CatalogContext);
};

export const usePackageCatalog = () => {
  const { catalog } = useCatalogContext();
  return catalog;
};

export const useKurtosisPackage = (packageId: string): Result<KurtosisPackage, string> => {
  const catalog = usePackageCatalog();
  const kurtosisPackage = catalog.map((catalog) =>
    catalog.packages.find((kurtosisPackage) => kurtosisPackage.name === packageId),
  );

  if (kurtosisPackage.isErr) {
    return kurtosisPackage.cast<KurtosisPackage>();
  } else {
    if (!isDefined(kurtosisPackage.value)) {
      return Result.err(`No package with id ${packageId} could be found.`);
    }
    return Result.ok(kurtosisPackage.value);
  }
};
