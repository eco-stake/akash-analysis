import React, { ReactNode } from "react";
import Head from "next/head";
import { DefaultSeo } from "next-seo";

type Props = {
  children?: ReactNode;
};

const PageHead: React.FunctionComponent<Props> = ({}) => {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <DefaultSeo
        titleTemplate="%s | Cloudmos Block Explorer"
        description="Explore everything about the Akash Network blockchain through Cloudmos Explorer. Analytics, blocks, transactions, validators, governance, deployments, providers and much more!"
        // openGraph={{
        //   type: "website",
        //   locale: "en_IE",
        //   url: "https://www.url.ie/",
        //   site_name: "SiteName"
        // }}
        // twitter={{
        //   handle: "@handle",
        //   site: "@site",
        //   cardType: "summary_large_image"
        // }}
      />
    </>
  );
};
export default PageHead;
