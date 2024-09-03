import React, { useState, useEffect } from "react";
import { doc, collection, getDoc, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import Content from "./Content";

function Dashboard() {
  const { doctor } = useParams();
  const isDoctor = doctor === "doctor";
  const [responses, setResponses] = useState([]);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const fetchUserData = async () => {
    const user = auth.currentUser; // Get the currently logged-in user
    if (!isDoctor) {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data(); // Return the user data
      } else {
        console.log("No such document!");
        return null;
      }
    } else {
      console.log("No user is signed in");
      if (isDoctor) {
        navigate("/login/doctor");
      } else {
        navigate("/login");
      }
      return null;
    }
  };
  const fetchDoctorData = async () => {
    const user = auth.currentUser; // Get the currently logged-in user
    if (user) {
      // Check if a user is signed in
      const docRef = doc(db, "doctors", user.uid); // Use "doctors" collection
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data(); // Return the doctor's data
      } else {
        console.log("No doctor document found!");
        return null;
      }
    } else {
      console.log("No user is signed in");
      navigate("/login/doctor"); // Redirect to doctor login
      return null;
    }
  };
  useEffect(() => {
    const fetchUser = async () => {
      const data = await (isDoctor ? fetchDoctorData() : fetchUserData());
      console.log(data);
      setUserData(data);
      const quizResponsesCollectionRef = collection(db, "quizResponses");

      // Fetch all documents from the collection
      getDocs(quizResponsesCollectionRef)
        .then((snapshot) => {
          const allResponses = [];

          snapshot.docs.forEach((doc) => {
            // Get the document data
            const data = doc.data();
            allResponses.push(data);
            console.log(data);
          });
          setResponses(allResponses);
          console.log(allResponses);
        })
        .catch((error) => {
          console.error("Error getting documents: ", error);
        });
    };

    fetchUser();
  }, []); 

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <Sidebar/>
      <Content responses={responses} userData={userData} />
    </div>
  );
}

export default Dashboard;
