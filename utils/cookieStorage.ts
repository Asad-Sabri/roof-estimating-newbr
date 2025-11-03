import Cookies from "js-cookie";

const cookieStorage = {
  getItem: (key: string): Promise<string | null> => {
    return Promise.resolve(Cookies.get(key) || null);
  },
  setItem: (key: string, value: string): Promise<void> => {
    Cookies.set(key, value, {
      expires: 30,
      path: "/",
      // domain: ".esycles.com",
    });
    return Promise.resolve();
  },
  removeItem: (key: string): Promise<void> => {
    Cookies.remove(key, {
      path: "/",
      //  domain: ".esycles.com"
    });
    return Promise.resolve();
  },
};

export default cookieStorage;
