import { useMemo } from "react";
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from "react-router-dom";
import { KurtosisPackageIndexerProvider } from "../client/packageIndexer/KurtosisPackageIndexerClientContext";
import { AppLayout } from "../components/AppLayout";
import { KurtosisThemeProvider } from "../components/KurtosisThemeProvider";
import { CatalogContextProvider } from "./CatalogContext";
import { catalogRoutes } from "./CatalogRoutes";

const logLogo = (t: string) => console.log(`%c ${t}`, "background: black; color: #00C223");
logLogo(`                                                                               
                                                ///////////////////             
                    //////////                 ///////////////////              
                 .////     ,///             /////          ////*                
               /////        ///           /////         /////                   
            ,////        ,////         *////          ////*                     
             //        /////         /////         /////                        
                    *////         *////          ////*                          
                  /////         /////         /////                             
               *////         /////          /////                               
             .////         /////         /////                                  
            .///        /////          ////*        //                          
            ///.      /////         //////          /////                       
            ////                  ////*.////          *////                     
             ////              /////      /////          /////                  
              /////         *////*          .////          *////                
                 //////////////                ////////////////////             
                                                                                
`);

console.log(`Kurtosis catalog UI`);

export const CatalogUIApp = () => {
  return (
    <KurtosisThemeProvider>
      <KurtosisPackageIndexerProvider>
        <CatalogContextProvider>
          <KurtosisCatalogRouter />
        </CatalogContextProvider>
      </KurtosisPackageIndexerProvider>
    </KurtosisThemeProvider>
  );
};

const KurtosisCatalogRouter = () => {
  const router = useMemo(
    () =>
      createBrowserRouter(
        [
          {
            element: (
              <AppLayout>
                <Outlet />
              </AppLayout>
            ),
            children: [
              {
                path: "/catalog",
                element: <Outlet />,
                children: catalogRoutes(),
              },
              { path: "*", element: <Navigate to={"/catalog"} /> },
            ],
          },
        ],
        { basename: "/" },
      ),
    [],
  );

  return <RouterProvider router={router} />;
};
