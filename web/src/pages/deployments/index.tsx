import { useTheme } from "@mui/material/styles";
import Layout from "@src/components/layout/Layout";
import { Title } from "@src/components/shared/Title";
import PageContainer from "@src/components/shared/PageContainer";
import { ComingSoon } from "@src/components/ComingSoon";
import { NextSeo } from "next-seo";

type Props = {};

const DeploymentsPage: React.FunctionComponent<Props> = ({}) => {
  const theme = useTheme();

  return (
    <Layout>
      <NextSeo title="Deployments" />

      <PageContainer>
        <Title value="Deployments" />

        <ComingSoon />
      </PageContainer>
    </Layout>
  );
};

export default DeploymentsPage;

export async function getServerSideProps({ params }) {
  return {
    props: {}
  };
}
