"use client";

import React from "react";
import PopupPost from "@/components/PopupPost";
import { useState } from "react";

const PopTest = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <div>
      <button onClick={openPopup}>Show Post</button>

      {isPopupOpen && (
        <PopupPost
          userID="8Fjs1pHyb3ZmqT23aithantU9Aw2"
          postID="8Fjs1pHyb3ZmqT23aithantU9Aw2-1726374361225266847"
          onClose={closePopup}
        />
      )}
    </div>
  );
};

export default PopTest;
