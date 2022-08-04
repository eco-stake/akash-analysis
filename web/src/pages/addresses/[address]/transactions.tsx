import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";
import Layout from "@src/components/layout/Layout";
import { BASE_API_URL } from "@src/utils/constants";
import axios from "axios";
import Error from "@src/components/shared/Error";
import { AddressDetail } from "@src/types/address";
import AddressLayout from "@src/components/layout/AddressLayout";

type Props = {
  errors?: string;
  address: string;
  addressDetail: AddressDetail;
};

const useStyles = makeStyles()(theme => ({
  title: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
    fontWeight: "bold",
    marginLeft: ".5rem"
  }
}));

const AddressDetailPage: React.FunctionComponent<Props> = ({ address, addressDetail, errors }) => {
  if (errors) return <Error errors={errors} />;

  const { classes } = useStyles();
  const theme = useTheme();

  return (
    <Layout title={`Account ${address} transactions`} appendGenericTitle>
      <AddressLayout page="transactions" address={address}>
        <Box sx={{ mt: "1rem" }}>
          <Typography variant="h3" className={classes.title}>
            Transactions
          </Typography>

          <Paper sx={{ padding: 2 }} elevation={2}>
            Coming soon!
          </Paper>
        </Box>
      </AddressLayout>
    </Layout>
  );
};

export default AddressDetailPage;

export async function getServerSideProps({ params }) {
  const addressDetail = await fetchAddressData(params?.address);

  return {
    props: {
      address: params?.address,
      addressDetail
    }
  };
}

async function fetchAddressData(address: string) {
  const response = await axios.get(`${BASE_API_URL}/api/addresses/${address}`);
  return response.data;
}
