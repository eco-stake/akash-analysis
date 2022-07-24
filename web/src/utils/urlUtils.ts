export class UrlService {
  static dashboard = () => "/";
  static deploy = () => "/deploy";
  static priceCompare = () => "/price-compare";
  static faq = () => "/faq";
  static blocks = () => "/blocks";
  static block = (height: number) => `/blocks/${height}`;
  static transactions = () => "/transactions";
  static transaction = (hash: string) => `/transactions/${hash}`;
  static address = (address: string) => `/addresses/${address}`;
  static validators = () => "/validators";
  static validator = (address: string) => `/validators/${address}`;
  static proposals = () => "/proposals";
  static proposal = (id: number) => `/proposals/${id}`;
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
