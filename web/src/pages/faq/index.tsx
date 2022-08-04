import React from "react";
import { makeStyles } from "tss-react/mui";
import Layout from "@src/components/layout/Layout";
import { Typography } from "@mui/material";
import PageContainer from "@src/components/shared/PageContainer";
import Link from "next/link";
import { UrlService } from "@src/utils/urlUtils";
import { GradientText } from "@src/components/shared/GradientText";

const useStyles = makeStyles()(theme => ({
  pageTitle: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "2rem"
  },
  subTitle: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
    fontWeight: "300"
  },
  link: {
    fontWeight: "bold",
    textDecoration: "underline"
  },
  paragraph: {
    marginBottom: "2rem"
  },
  resourcesTitle: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
    fontWeight: "300"
  }
}));

export function Faq() {
  const { classes } = useStyles();

  const howToBuyLinks = [
    { title: "ascendex.com", url: "https://ascendex.com/register?inviteCode=SQFJU1NA" },
    { title: "gate.io", url: "https://www.gate.io/signup" },
    { title: "bitmart.com", url: "https://www.bitmart.com/en?r=7QJGUG" },
    { title: "digifinex.com", url: "https://www.digifinex.com/" },
    { title: "bithumb.pro", url: "https://www.bithumb.pro/" },
    { title: "osmosis (dex)", url: "https://app.osmosis.zone/" },
    { title: "emeris (dex)", url: "https://app.emeris.com/" }
  ];

  const howToStakeLinks = [
    {
      title: "How to create your personal Akash Network(AKT) account on Cosmostation Wallet (iOS/Android/Web).",
      url: "http://bit.ly/3kACwil"
    },
    { title: "How to stake", url: "https://link.medium.com/751QRVXMrcb" },
    {
      title: "FAQ on staking",
      url: "https://johnniecosmos.medium.com/faq-on-staking-akt-6db011fb6b83"
    },
    { title: "What is staking?", url: "https://www.investopedia.com/terms/p/proof-stake-pos.asp" },
    {
      title: "Token unlock schedule",
      url: "https://docs.google.com/spreadsheets/d/1MUULetp59lgNq0z4ckVI51QdtMGvqtKOW8wRfX5R8yY"
    }
  ];

  const howToDeployLinks = [
    { title: "Official Akash Network documentation", url: "https://docs.akash.network/" },
    { title: "Akash Network - Dev & Tech Support Discord", url: "https://discord.akash.network" },
    { title: "Akash Network Github", url: "https://github.com/ovrclk" },
    { title: "Hello world example", url: "https://github.com/tombeynon/akash-hello-world" },
    { title: "Deploy ui tool", url: "https://github.com/tombeynon/akash-deploy" },
    {
      title: "Unstoppable stack (Handshake + Skynet + Akash)",
      url: "https://github.com/bcfus/unstoppable-stack"
    },
    { title: "Ssh ubuntu image on Akash", url: "https://github.com/coffeeroaster/akash-ubuntu" },
    { title: "Akash deployer", url: "https://github.com/lhennerley/akash-deployer" },
    { title: "Akash node example", url: "https://github.com/tombeynon/akash-archive-node" },
    {
      title: "How to deploy a wordpress blog",
      url: "https://medium.com/@zJ_/how-to-deploy-a-decentralized-blog-3a5a13a6a827"
    },
    {
      title: "How I hosted my personal site on Akash for $2/month",
      url: "https://teeyeeyang.medium.com/how-i-hosted-my-personal-site-on-akash-for-2-month-cf07768aa0a2"
    },
    {
      title: "A step-by-step guide to deploying a SPA to Akash Network",
      url: "https://github.com/xtrip15/akash-deploy-spa"
    },
    {
      title: "Running Sovryn Node on Decentralized Cloud",
      url: "https://www.youtube.com/watch?v=Iinsjgolmu8&t=313s"
    }
  ];

  const communitiesLinks = [
    { title: "Akash Network Telegram", url: "https://t.me/AkashNW" },
    { title: "Akashians | Price & Staking", url: "https://t.me/akashianspricingstaking" },
    { title: "Akash Network Devs", url: "https://discord.gg/W8FgHENp" },
    { title: "Twitter", url: "https://twitter.com/akashnet_" },
    { title: "Reddit", url: "https://www.reddit.com/r/akashnetwork/" },
    { title: "Facebook", url: "https://www.facebook.com/akashnw" },
    { title: "Akash Russia Telegram", url: "https://t.me/akash_ru" },
    { title: "Akash Korea", url: "https://t.me/AkashNW_KR" },
    {
      title: "Akash Chinese Community",
      url: "https://akash.network/blog/akash-network-launch-chinese-community/"
    }
  ];

  return (
    <Layout title="Proposals" appendGenericTitle>
      <PageContainer>
        {/* <Helmet title="FAQ">
        <meta name="description" content="Learn more about the akash network and get answers to the most frequently asked questions." />
      </Helmet> */}

        <Typography variant="h1" className={classes.pageTitle}>
          <GradientText>Frequently Asked Questions</GradientText>
        </Typography>

        <Typography variant="h3" className={classes.subTitle}>
          What is Akash?
        </Typography>

        <p className={classes.paragraph}>
          <a href="https://akash.network/" target="_blank" rel="noopener" className={classes.link}>
            Akash Network
          </a>{" "}
          is the world’s first decentralized open source cloud. Almost every website or app you go to are hosted on the “cloud”, meaning servers leased by big
          companies like Amazon, Google, Microsoft or others. Akash is aiming to disrupt this centralization of resources by providing a decentralized network
          of server providers, giving the possibility for anyone capable to rent their spare server capacity and earn an extra income. Think AirBnb, but for
          cloud computing! On the other hand, anyone who wants to host an app or a website can now do it at a{" "}
          <Link href={UrlService.priceCompare()}>
            <a className={classes.link}>fraction of the cost.</a>
          </Link>{" "}
          To fulfill the transactions done between the parties, Akash uses the{" "}
          <a href="https://coinmarketcap.com/currencies/akash-network/" target="_blank" rel="noopener" className={classes.link}>
            blockchain technology
          </a>{" "}
          so that all the transactions are transparent, fast, global and cheap. Akash is part of the cosmos ecosystem as it is built with the{" "}
          <a href="https://v1.cosmos.network/sdk" target="_blank" rel="noopener" className={classes.link}>
            Cosmos SDK.
          </a>
        </p>

        <Typography variant="h3" className={classes.subTitle}>
          How to deploy an app or website to Akash?
        </Typography>

        <p className={classes.paragraph}>
          Akash leverages{" "}
          <a href="https://kubernetes.io/" target="_blank" rel="noopener" className={classes.link}>
            Kubernetes's container orchestration technology
          </a>{" "}
          to provide a maximum of flexibility in terms of what applications can be deployed on it’s network. So basically, if your application is containerized
          with{" "}
          <a href="https://www.docker.com/" target="_blank" rel="noopener" className={classes.link}>
            docker
          </a>
          , it can run on Akash. The only thing you need is the currency{" "}
          <a href="https://coinmarketcap.com/currencies/akash-network/" target="_blank" rel="noopener" className={classes.link}>
            $AKT
          </a>{" "}
          to pay for the computing and then voilà, you can{" "}
          <Link
            // href="https://docs.akash.network/guides/deploy"
            href={UrlService.deploy()}
          >
            <a className={classes.link}>deploy your app in a few steps.</a>
          </Link>
        </p>

        <Typography variant="h3" className={classes.subTitle}>
          What can be deployed on Akash?
        </Typography>

        <p>Any app, website, blockchain node, video game server, etc. You name it! As long as you have a docker image ready, you can run it on Akash!</p>
        <p className={classes.paragraph}>
          <a href="https://github.com/ovrclk/awesome-akash" target="_blank" rel="noopener" className={classes.link}>
            Here’s a list of projects deployed by the community on the network during the testnet.
          </a>
        </p>

        <Typography variant="h3" className={classes.pageTitle} sx={{ marginBottom: 2, marginTop: 4 }}>
          <GradientText>Resources</GradientText>
        </Typography>
        <Typography variant="h3" className={classes.resourcesTitle} sx={{ marginBottom: 5 }}>
          Here's a list of of useful links from the community that could help to get from buying the currency to deploying an app!
        </Typography>

        <Typography variant="h5" className={classes.resourcesTitle}>
          #1: How to buy{" "}
          <a href="https://coinmarketcap.com/currencies/akash-network/" target="_blank" rel="noopener" className={classes.link}>
            $AKT
          </a>
        </Typography>

        <ul>
          {howToBuyLinks.map((link, i) => (
            <li key={i}>
              <a href={link.url} target="_blank" rel="noopener" className={classes.link}>
                {link.title}
              </a>
            </li>
          ))}
        </ul>

        <Typography variant="h5" className={classes.resourcesTitle}>
          #2: How to stake
        </Typography>

        <ul>
          {howToStakeLinks.map((link, i) => (
            <li key={i}>
              <a href={link.url} target="_blank" rel="noopener" className={classes.link}>
                {link.title}
              </a>
            </li>
          ))}
        </ul>

        <Typography variant="h5" className={classes.resourcesTitle}>
          #3: How to deploy
        </Typography>

        <ul>
          {howToDeployLinks.map((link, i) => (
            <li key={i}>
              <a href={link.url} target="_blank" rel="noopener" className={classes.link}>
                {link.title}
              </a>
            </li>
          ))}
        </ul>

        <Typography variant="h3" className={classes.pageTitle} sx={{ marginBottom: 4, marginTop: 4 }}>
          <GradientText>Community</GradientText>
        </Typography>

        <ul>
          {communitiesLinks.map((link, i) => (
            <li key={i}>
              <a href={link.url} target="_blank" rel="noopener" className={classes.link}>
                {link.title}
              </a>
            </li>
          ))}
        </ul>
      </PageContainer>
    </Layout>
  );
}

export default Faq;
