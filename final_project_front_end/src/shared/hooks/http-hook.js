import { useState, useCallback, useRef, useEffect } from "react";
//use callback is used here to prevent the function from being recalled when the component re-renders, thus preventing an infinite loop

export const useHttp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const activeHttpRequests = useRef([]);

  const getRequest = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      setIsLoading(true);
      //abort controller is a modern functionality built into modern browsers, it isn't React specific
      const httpAbort = new AbortController();
      activeHttpRequests.current.push(httpAbort);
      try {
        const response = await fetch(url, {
          method,
          body,
          headers,
          //the signal here links the abort controller to the request
          signal: httpAbort.signal,
        });
        console.log(`here is response ${JSON.stringify(response)}`);
        const data = await response.json();
        console.log(`here is data ${JSON.stringify(data)}`);

        activeHttpRequests.current = activeHttpRequests.current.filter(
          (controller) => controller !== httpAbort
        );
        if (!response.ok) {
          throw new Error(data.message);
        }
        setIsLoading(false);

        return data;
      } catch (err) {
        setError(err.message);
        setIsLoading(false);

        throw err;
      }
    },
    []
  );

  const clearError = () => {
    setError(null);
  };
  useEffect(() => {
    //this is executed as a clean up function
    return () => {
      activeHttpRequests.current.forEach((httpAbort) => httpAbort.abort());
    };
  }, []);
  return { isLoading, error, getRequest, clearError };
};
