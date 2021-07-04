import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import PlaceList from "../components/PlaceList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";

import { useHttp } from "../../shared/hooks/http-hook";

const UserPlaces = () => {
  const { isLoading, error, getRequest, clearError } = useHttp();
  const [loadedPlaces, setLoadedPlaces] = useState(undefined);

  const userId = useParams().userId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getRequest(
          `https://my-final-back-end.herokuapp.com/api/places/user/${userId}`
        );
        console.log(`here is data ${data.creator}`);
        setLoadedPlaces(data.creator);
      } catch (error) {}
    };
    fetchData();
  }, [getRequest, userId]);

  const placeDeleted = (deletedPlaceId) => {
    setLoadedPlaces((prevPlaces) =>
      prevPlaces.filter((place) => place.id !== deletedPlaceId)
    );
  };

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedPlaces && (
        <PlaceList onDeletePlace={placeDeleted} items={loadedPlaces} />
      )}
    </>
  );
};

export default UserPlaces;
