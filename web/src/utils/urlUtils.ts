export class UrlService {
  static dashboard = () => "/";
  static deploy = () => "/cloud-deploy";
  static priceCompare = () => "/price-compare";
  static faq = () => "/faq";
  static blocks = () => "/blocks";
  static block = (height: number) => `/blocks/${height}`;
  static transactions = () => "/transactions";
  static transaction = (hash: string) => `/transactions/${hash}`;
  static address = (address: string) => `/addresses/${address}`;
  static addressTransactions = (address: string) => `/addresses/${address}/transactions`;
  static addressDeployments = (address: string) => `/addresses/${address}/deployments`;
  static validators = () => "/validators";
  static validator = (address: string) => `/validators/${address}`;
  static proposals = () => "/proposals";
  static proposal = (id: number) => `/proposals/${id}`;
  static providers = () => "/providers";
  static deployments = () => "/deployments";
  static deployment = (owner: string, dseq: string) => `/deployments/${owner}/${dseq}`;
}

export function appendSearchParams(params) {
  const urlParams = new URLSearchParams("");
  Object.keys(params).forEach(p => {
    if (params[p]) {
      urlParams.set(p, params[p]);
    }
  });

  const res = urlParams.toString();

  return !!res ? `?${res}` : res;
}
