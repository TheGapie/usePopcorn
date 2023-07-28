import React from "react";
import ReactDOM from "react-dom/client";
import { useState } from "react";
import "./index.css";
import App from "./App";
import StarRating from "./StarRating";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    {/* <StarRating maxRating={10} />
    <Test />
    <StarRating
      color="red"
      defaultRating={2}
      messages={["Terrible", "Bad", "Ok", "Good", "Excellent"]}
    />
    <StarRating color="blue" size={25} className="test" /> */}
  </React.StrictMode>
);

// function Test() {
//   const [rating, setRating] = useState(0);

//   return (
//     <div>
//       <StarRating onSetRate={setRating} />
//       <p>You rated the movie {rating} rating</p>
//     </div>
//   );
// }
