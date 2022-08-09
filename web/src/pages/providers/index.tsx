import { useTheme } from "@mui/material/styles";
import Layout from "@src/components/layout/Layout";
import { Title } from "@src/components/shared/Title";
import PageContainer from "@src/components/shared/PageContainer";
import { ComingSoon } from "@src/components/ComingSoon";
import { NextSeo } from "next-seo";

type Props = {};

const ProvidersPage: React.FunctionComponent<Props> = ({}) => {
  const theme = useTheme();

  return (
    <Layout>
      <NextSeo title="Providers" />

      <PageContainer>
        <Title value="Providers" />

        <ComingSoon />
      </PageContainer>
    </Layout>
  );
};

export default ProvidersPage;

export async function getServerSideProps({ params }) {
  return {
    props: {}
  };
}
