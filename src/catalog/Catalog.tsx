import { SmallCloseIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { GetPackagesResponse, KurtosisPackage } from "kurtosis-cloud-indexer-sdk";
import {
  AppPageLayout,
  FindCommand,
  isDefined,
  KurtosisAlert,
  KurtosisPackageCardGrid,
  KurtosisPackageCardRow,
  maybeArrayToArray,
  PageTitle,
  useKeyboardAction,
} from "kurtosis-ui-components";
import { useEffect, useMemo, useRef, useState } from "react";
import { BiSortAlt2 } from "react-icons/bi";
import { FiSearch } from "react-icons/fi";
import { HiStar } from "react-icons/hi";
import { IoPlay } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";
import { useCatalogContext } from "./CatalogContext";

type SearchState = {
  term: string;
  filter: ("saved" | "featured")[]; // TODO: Implement 'featured'
  sortBy?: "stars" | "runs";
};

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
  const [searchParams, setUrlSearchParams] = useSearchParams();
  const initialTerm = searchParams.get("t") || "";
  const initialFilter = maybeArrayToArray(searchParams.get("f")).filter(isDefined);
  const initialSortBy = searchParams.get("s") || undefined;

  const [searchState, setSearchState] = useState<SearchState>({
    term: initialTerm,
    filter: initialFilter as ("saved" | "featured")[],
    sortBy: initialSortBy as "stars" | "runs",
  });
  const isSearching = searchState.term.length > 0 || searchState.filter.length > 0 || isDefined(searchState.sortBy);

  const handlePackageRun = (kurtosisPackage: KurtosisPackage) => {
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
            setSearchState((searchTerm) => ({ ...searchTerm, term: "" }));
          }
        },
      }),
      [searchRef],
    ),
  );

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("t", searchState.term);
    searchState.filter.forEach((f) => params.set("f", f));
    if (isDefined(searchState.sortBy)) {
      params.set("s", searchState.sortBy);
    }
    const currentParts = window.location.href.split("?");
    if (currentParts.length > 1) {
      setUrlSearchParams(params, { replace: true });
    } else {
      setUrlSearchParams(params);
    }
  }, [searchState, setUrlSearchParams]);

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
              value={searchState.term}
              bgColor={"gray.850"}
              onChange={(e) => setSearchState((searchTerm) => ({ ...searchTerm, term: e.target.value }))}
              placeholder={"Search"}
            />
            <InputRightElement w={"unset"} mr={"8px"}>
              {isSearching ? (
                <Button
                  variant="ghost"
                  size={"xs"}
                  rightIcon={<SmallCloseIcon />}
                  onClick={() => setSearchState((searchTerm) => ({ filter: [], term: "" }))}
                >
                  Clear
                </Button>
              ) : (
                <FindCommand whiteSpace={"nowrap"} pr={"10px"} />
              )}
            </InputRightElement>
          </InputGroup>
        </Flex>
        {isSearching && (
          <CatalogSearchResults
            catalog={catalog}
            searchState={searchState}
            onSearchStateChanged={setSearchState}
            onPackageRunClicked={handlePackageRun}
          />
        )}
        {!isSearching && (
          <CatalogDefaultView
            catalog={catalog}
            onSearchStateChanged={setSearchState}
            onPackageRunClicked={handlePackageRun}
          />
        )}
      </Flex>
    </AppPageLayout>
  );
};

type CatalogSearchResultsProps = {
  catalog: GetPackagesResponse;
  searchState: SearchState;
  onSearchStateChanged: (updater: (oldState: SearchState) => SearchState) => void;
  onPackageRunClicked: (kurtosisPackage: KurtosisPackage) => void;
};

const CatalogSearchResults = ({
  catalog,
  searchState,
  onSearchStateChanged,
  onPackageRunClicked,
}: CatalogSearchResultsProps) => {
  const filteredCatalog = useMemo(
    () =>
      catalog.packages
        .filter((kurtosisPackage) => kurtosisPackage.name.toLowerCase().indexOf(searchState.term.toLowerCase()) > -1)
        .filter((kurtosisPackage) => {
          if (searchState.filter.length === 0) {
            return true;
          }
          // TODO: Implement 'featured' filtering
          return false;
        })
        .sort((a, b) => {
          if (searchState.sortBy === "stars") {
            return a.stars > b.stars ? -1 : a.stars === b.stars ? 0 : 1;
          }
          if (searchState.sortBy === "runs") {
            return b.runCount - a.runCount;
          }
          return 0;
        }),
    [searchState, catalog],
  );

  return (
    <Flex flexDirection={"column"} gap={"32px"} maxW={"1248px"}>
      <Flex justifyContent={"space-between"} alignItems={"center"}>
        <Heading fontSize={"lg"} fontWeight={"medium"}>
          {filteredCatalog.length} Matches
        </Heading>
        <ButtonGroup variant={"ghost"} size={"xs"}>
          <Menu>
            <MenuButton
              as={Button}
              leftIcon={<BiSortAlt2 />}
              variant={isDefined(searchState.sortBy) ? "activeFilterControl" : "ghost"}
              colorScheme={isDefined(searchState.sortBy) ? "kurtosisGreen" : "ghost"}
            >
              {isDefined(searchState.sortBy) ? `Sorted by ${searchState.sortBy}` : "Sort"}
            </MenuButton>
            <MenuList>
              <MenuItem
                icon={<HiStar />}
                onClick={() => onSearchStateChanged((searchState) => ({ ...searchState, sortBy: "stars" }))}
              >
                Stars
              </MenuItem>
              <MenuItem
                icon={<IoPlay />}
                onClick={() => onSearchStateChanged((searchState) => ({ ...searchState, sortBy: "runs" }))}
              >
                Run Count
              </MenuItem>
              <MenuDivider />
              <MenuItem onClick={() => onSearchStateChanged((searchState) => ({ ...searchState, sortBy: undefined }))}>
                Clear
              </MenuItem>
            </MenuList>
          </Menu>
        </ButtonGroup>
      </Flex>
      <KurtosisPackageCardGrid packages={filteredCatalog} onPackageRunClicked={onPackageRunClicked} />
    </Flex>
  );
};

type CatalogDefaultViewProps = {
  catalog: GetPackagesResponse;
  onSearchStateChanged: (updater: (oldState: SearchState) => SearchState) => void;
  onPackageRunClicked: (kurtosisPackage: KurtosisPackage) => void;
};

const CatalogDefaultView = ({ catalog, onPackageRunClicked, onSearchStateChanged }: CatalogDefaultViewProps) => {
  const mostStarredPackages = useMemo(
    () => [...catalog.packages].sort((a, b) => (a.stars > b.stars ? -1 : a.stars === b.stars ? 0 : 1)).slice(0, 10),
    [catalog],
  );
  const mostRanPackages = useMemo(
    () =>
      [...catalog.packages]
        .sort((a, b) => (a.runCount > b.runCount ? -1 : a.runCount === b.runCount ? 0 : 1))
        .slice(0, 10),
    [catalog],
  );

  return (
    <>
      <Box as={"section"} pb="32px" borderColor={"whiteAlpha.300"} borderBottomWidth={"1px"}>
        <KurtosisPackageCardRow
          title={"Most starred"}
          packages={mostStarredPackages}
          onPackageRunClicked={onPackageRunClicked}
          onSeeAllClicked={() => onSearchStateChanged((searchState) => ({ ...searchState, sortBy: "stars" }))}
        />
      </Box>
      <Box as={"section"} pb="32px" borderColor={"whiteAlpha.300"} borderBottomWidth={"1px"}>
        <KurtosisPackageCardRow
          title={"Most Ran"}
          packages={mostRanPackages}
          onPackageRunClicked={onPackageRunClicked}
          onSeeAllClicked={() => onSearchStateChanged((searchState) => ({ ...searchState, sortBy: "runs" }))}
        />
      </Box>
      <Heading fontSize={"lg"} fontWeight={"medium"}>
        All
      </Heading>
      <KurtosisPackageCardGrid packages={catalog.packages} onPackageRunClicked={onPackageRunClicked} />
    </>
  );
};
