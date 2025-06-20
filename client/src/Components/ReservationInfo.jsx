import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ReservationInfo = () => {
  const { resid: reservationID } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadReservationInfo = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/v1/user/fetchReservationData?resid=${reservationID}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        console.log("Reservation data fetched successfully:", data);
      } catch (error) {
        console.error("Error fetching reservation data:", error);
        navigate("/reservations"); // Redirect to reservations page on error
      }
    };
    loadReservationInfo();
  }, [reservationID, navigate]);

  return (
    <div>
      ReservationInfo
      <div>
        {reservationID
          ? `Reservation ID: ${reservationID}`
          : "No reservation ID found in URL."}
      </div>
    </div>
  );
};

export default ReservationInfo;
