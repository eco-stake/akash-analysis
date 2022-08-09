import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import Layout from "@src/components/layout/Layout";
import { BASE_API_URL } from "@src/utils/constants";
import axios from "axios";
import { AddressDetail } from "@src/types/address";
import AddressLayout from "@src/components/layout/AddressLayout";
import { Title } from "@src/components/shared/Title";
import { ComingSoon } from "@src/components/ComingSoon";
import { NextSeo } from "next-seo";

type Props = {
  address: string;
  addressDetail: AddressDetail;
};

const AddressDetailPage: React.FunctionComponent<Props> = ({ address, addressDetail }) => {
  const theme = useTheme();

  return (
    <Layout>
      <NextSeo title={`Account ${address} transactions`} />

      <AddressLayout page="transactions" address={address}>
        <Box sx={{ mt: "1rem" }}>
          <Title value="Transactions" subTitle sx={{ marginBottom: "1rem" }} />

          <ComingSoon />
        </Box>
      </AddressLayout>
    </Layout>
  );
};

export default AddressDetailPage;

export async function getServerSideProps({ params }) {
  try {
    const addressDetail = await fetchAddressData(params?.address);

    return {
      props: {
        address: params?.address,
        addressDetail
      }
    };
  } catch (error) {
    if (error.response.status === 404) {
      return {
        notFound: true
      };
    } else {
      throw error;
    }
  }
}

async function fetchAddressData(address: string) {
  const response = await axios.get(`${BASE_API_URL}/api/addresses/${address}`);
  return response.data;
}
