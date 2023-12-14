import { SmallCloseIcon } from "@chakra-ui/icons";
import {
  Flex,
  Heading,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from "@chakra-ui/react";
import { GetPackagesResponse, KurtosisPackage } from "kurtosis-cloud-indexer-sdk";
import {
  AppPageLayout,
  FindCommand,
  isDefined,
  KurtosisAlert,
  KurtosisPackageCardGrid,
  PageTitle,
  useKeyboardAction,
} from "kurtosis-ui-components";
import { useMemo, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useCatalogContext } from "./CatalogContext";

export const Catalog = () => {
  const { catalog } = useCatalogContext();

  if (catalog.isErr) {
    return (
      <AppPageLayout>
        <KurtosisAlert message={catalog.error} />
      </AppPageLayout>
    );
  }

  return <CatalogImpl catalog={catalog.value} />;
};

type CatalogImplProps = {
  catalog: GetPackagesResponse;
};

const CatalogImpl = ({ catalog }: CatalogImplProps) => {
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const isSearching = searchTerm.length > 0;
  const filteredCatalog = useMemo(
    () => catalog.packages.filter((kurtosisPackage) => kurtosisPackage.name.toLowerCase().indexOf(searchTerm) > -1),
    [searchTerm, catalog],
  );

  const handlePackageRunClicked = (kurtosisPackage: KurtosisPackage) => {
    window.open(`https://cloud.kurtosis.com/enclave-manager?package-id=${encodeURIComponent(kurtosisPackage.name)}`);
  };

  useKeyboardAction(
    useMemo(
      () => ({
        find: () => {
          if (isDefined(searchRef.current) && searchRef.current !== document.activeElement) {
            searchRef.current.focus();
          }
        },
        escape: () => {
          if (isDefined(searchRef.current) && searchRef.current === document.activeElement) {
            setSearchTerm("");
          }
        },
      }),
      [searchRef],
    ),
  );

  return (
    <AppPageLayout>
      <Flex p={"17px 0"}>
        <PageTitle>Package Catalog</PageTitle>
      </Flex>
      <Flex flexDirection={"column"} gap={"32px"}>
        <Flex flex={"1"} justifyContent={"center"}>
          <InputGroup variant={"solid"} width={"1192px"} color={"gray.150"}>
            <InputLeftElement>
              <Icon as={FiSearch} />
            </InputLeftElement>
            <Input
              ref={searchRef}
              value={searchTerm}
              bgColor={"gray.850"}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={"Search"}
            />
            <InputRightElement w={"unset"}>
              {isSearching ? (
                <IconButton
                  aria-label={"Clear search"}
                  variant="ghost"
                  size={"sm"}
                  icon={<SmallCloseIcon />}
                  onClick={() => setSearchTerm("")}
                />
              ) : (
                <FindCommand whiteSpace={"nowrap"} pr={"10px"} />
              )}
            </InputRightElement>
          </InputGroup>
        </Flex>
        {isSearching && (
          <>
            <Heading fontSize={"lg"} fontWeight={"medium"}>
              {filteredCatalog.length} Matches
            </Heading>
            <KurtosisPackageCardGrid packages={filteredCatalog} onPackageRunClicked={handlePackageRunClicked} />
          </>
        )}
        {!isSearching && (
          <>
            <Heading fontSize={"lg"} fontWeight={"medium"}>
              All
            </Heading>
            <KurtosisPackageCardGrid packages={catalog.packages} onPackageRunClicked={handlePackageRunClicked} />
          </>
        )}
      </Flex>
    </AppPageLayout>
  );
};
