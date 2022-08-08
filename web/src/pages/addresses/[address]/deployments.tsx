import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material/styles";
import Layout from "@src/components/layout/Layout";
import { BASE_API_URL } from "@src/utils/constants";
import axios from "axios";
import Error from "@src/components/shared/Error";
import { AddressDetail } from "@src/types/address";
import AddressLayout from "@src/components/layout/AddressLayout";
import { Title } from "@src/components/shared/Title";
import { ComingSoon } from "@src/components/ComingSoon";

type Props = {
  errors?: string;
  address: string;
  addressDetail: AddressDetail;
};

const AddressDeploymentsPage: React.FunctionComponent<Props> = ({ address, addressDetail, errors }) => {
  if (errors) return <Error errors={errors} />;

  const theme = useTheme();

  return (
    <Layout title={`Account ${address} deployments`} appendGenericTitle>
      <AddressLayout page="deployments" address={address}>
        <Box sx={{ mt: "1rem" }}>
          <Title value="Deployments" subTitle sx={{ marginBottom: "1rem" }} />

          <ComingSoon />
        </Box>
      </AddressLayout>
    </Layout>
  );
};

export default AddressDeploymentsPage;

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
