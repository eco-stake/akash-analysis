import Layout from "../components/layout/Layout";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { ReactNode } from "react";
import { makeStyles } from "tss-react/mui";
import PageContainer from "@src/components/shared/PageContainer";

type Props = {
  children?: ReactNode;
};

const useStyles = makeStyles()(theme => ({
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "1rem"
  },
  subTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "1rem"
  }
}));

const IndexPage: React.FunctionComponent<Props> = ({}) => {
  const { classes } = useStyles();

  return (
    <Layout title="Dashboard" appendGenericTitle>
      <PageContainer>
        <Box mb={4}>
          <Typography variant="h1" className={classes.title}>
            Dashboard
          </Typography>
        </Box>
      </PageContainer>
    </Layout>
  );
};

export async function getServerSideProps() {
  return {
    props: {}
    //revalidate: 20
  };
}

export default IndexPage;
