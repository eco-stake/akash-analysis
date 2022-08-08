import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material/styles";
import Layout from "@src/components/layout/Layout";
import Error from "@src/components/shared/Error";
import { Title } from "@src/components/shared/Title";
import PageContainer from "@src/components/shared/PageContainer";
import { ComingSoon } from "@src/components/ComingSoon";

type Props = {
  errors?: string;
};

const DeploymentsPage: React.FunctionComponent<Props> = ({ errors }) => {
  if (errors) return <Error errors={errors} />;

  const theme = useTheme();

  return (
    <Layout title="Deployments" appendGenericTitle>
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
