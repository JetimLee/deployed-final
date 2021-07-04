import React, { useEffect, useState } from "react";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHttp } from "../../shared/hooks/http-hook";

import UsersList from "../components/UsersList";

const Users = () => {
  const { isLoading, error, getRequest, clearError } = useHttp();
  const [userData, setUserData] = useState();

  useEffect(() => {
    const getUsers = async () => {
      try {
        console.log("firing fetch");
        const data = await getRequest(
          `https://my-final-back-end.herokuapp.com/api/users`
        );
        console.log(data);

        setUserData(data.users);
      } catch (err) {
        console.log(`error on fetching users ${err}`);
      }
    };
    getUsers();
  }, [getRequest]);

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && userData && <UsersList items={userData} />}
    </>
  );
};

export default Users;
