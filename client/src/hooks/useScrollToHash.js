import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const useScrollToHash = () => {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;

    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);

        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          element.classList.add("highlight-flash");
          setTimeout(() => {
            element.classList.remove("highlight-flash");
          }, 2000);
        } else {
          console.log("Element not found for hash:", hash);
        }
      }, 300);
    } else {
      console.log("No hash in URL");
    }
  }, [location]);
};
