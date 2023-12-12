import { RouteObject } from "react-router-dom";
import { KurtosisCatalogBreadcrumbsHandle } from "./components/KurtosisCatalogBreadcrumbs";

export type KurtosisCatalogRouteObject = RouteObject & {
  handle?: KurtosisCatalogBreadcrumbsHandle;
  children?: KurtosisCatalogRouteObject[];
};
