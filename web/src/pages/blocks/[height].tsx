import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";
import Layout from "@src/components/layout/Layout";
import { cx } from "@emotion/css";
import PageContainer from "@src/components/shared/PageContainer";
import { BASE_API_URL } from "@src/utils/constants";
import axios from "axios";
import Error from "@src/components/shared/Error";
import { Block } from "@src/types";

type Props = {
  errors?: string;
  height: string;
  block: Block;
};

const useStyles = makeStyles()(theme => ({
  root: {
    paddingTop: "2rem",
    paddingBottom: "2rem",
    marginLeft: "0"
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginLeft: ".5rem",
    marginBottom: "2px"
  },
  titleSmall: {
    fontSize: "1.1rem"
  }
}));

const BlocksPage: React.FunctionComponent<Props> = ({ block, errors }) => {
  if (errors) return <Error errors={errors} />;

  const { classes } = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Layout title="Blocks" appendGenericTitle>
      <PageContainer>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
          <Typography variant="h1" className={cx(classes.title, { [classes.titleSmall]: matches })}>
            Details for Block #{block.height}
          </Typography>
        </Box>

        <Paper sx={{ padding: 2 }}>TODO</Paper>
      </PageContainer>
    </Layout>
  );
};

export default BlocksPage;

export async function getServerSideProps({ params }) {
  const block = await fetchBlockData(params?.height);

  return {
    props: {
      height: params?.height,
      block
    }
  };
}

async function fetchBlockData(height: string) {
  console.log("Fetching block height " + height);
  console.log(`${BASE_API_URL}/api/blocks/${height}`);
  const response = await axios.get(`${BASE_API_URL}/api/blocks/${height}`);
  return response.data;
}
