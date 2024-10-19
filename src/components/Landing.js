import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as handpose from '@tensorflow-models/handpose';
import '@tensorflow/tfjs-backend-webgl';
import KalmanFilter from 'kalmanjs';
import './Landing.css';
import piece1 from '../images/piece1.jpg';
import piece2 from '../images/piece2.jpg';
import piece3 from '../images/piece3.jpg';
import { getAuth, signOut } from 'firebase/auth';

const products = [
  {
    id: 1,
    name: "Art Piece 1",
    image: piece1,
    price: "$100",
  },
  {
    id: 2,
    name: "Art Piece 2",
    image: piece2,
    price: "$150",
  },
  {
    id: 3,
    name: "Art Piece 3",
    image: piece3,
    price: "$200",
  },
];

function Landing() {
  const videoRef = useRef(null);
  const [model, setModel] = useState(null);
  const [gestureMode, setGestureMode] = useState(false);
  const [cursorX, setCursorX] = useState(window.innerWidth / 2);
  const [cursorY, setCursorY] = useState(window.innerHeight / 2);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();
  const [isClicking, setIsClicking] = useState(false);
  const [detectionCount, setDetectionCount] = useState(0);
  const detectionThreshold = 5; // Number of frames to detect V gesture
  const [lastGestureTime, setLastGestureTime] = useState(0);
  const [userName] = useState("John Doe"); // User's name

  // Kalman Filters for smoothing cursor movement
  const kalmanX = new KalmanFilter({ R: 0.01, Q: 0.1, x: 0, P: 1 });
  const kalmanY = new KalmanFilter({ R: 0.01, Q: 0.1, x: 0, P: 1 });

  useEffect(() => {
    const loadModel = async () => {
      try {
        const handposeModel = await handpose.load();
        setModel(handposeModel);
      } catch (error) {
        console.error('Error loading Handpose model:', error);
      }
    };
    loadModel();
  }, []);

  useEffect(() => {
    const setupCamera = async () => {
      const video = videoRef.current;
      if (video) {
        video.width = 640;
        video.height = 480;

        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            video.play();
            detectHandGesture();
          };
        } catch (error) {
          console.error('Error accessing webcam:', error);
          setConfirmationMessage('Error accessing webcam. Please check your camera permissions.');
        }
      }
    };

    const detectHandGesture = async () => {
      const video = videoRef.current;
      if (video) {
        const detect = async () => {
          if (video.readyState >= 2 && gestureMode && !isClicking) {
            try {
              const predictions = await model.estimateHands(video);

              if (predictions.length > 0) {
                const hand = predictions[0].landmarks;
                const indexTip = hand[8];    // Index finger tip
                const middleTip = hand[12];   // Middle finger tip
                const wrist = hand[0];        // Palm base or wrist

                const rawX = indexTip[0];
                const rawY = indexTip[1];

                // Apply Kalman filter for smoothing
                const smoothedX = kalmanX.filter(rawX);
                const smoothedY = kalmanY.filter(rawY);

                let newCursorX = (smoothedX / video.width) * window.innerWidth;
                let newCursorY = (smoothedY / video.height) * window.innerHeight;

                setCursorX(newCursorX);
                setCursorY(newCursorY);

                const distanceBetweenFingers = Math.sqrt(
                  Math.pow(middleTip[0] - indexTip[0], 2) + Math.pow(middleTip[1] - indexTip[1], 2)
                );

                const indexAngle = Math.atan2(indexTip[1] - wrist[1], indexTip[0] - wrist[0]) * (180 / Math.PI);
                const middleAngle = Math.atan2(middleTip[1] - wrist[1], middleTip[0] - wrist[0]) * (180 / Math.PI);

                // Check for V gesture
                if (isVGesture(indexAngle, middleAngle, distanceBetweenFingers)) {
                  setDetectionCount(prevCount => prevCount + 1);

                  if (detectionCount + 1 >= detectionThreshold) {
                    handleVGesture(); // Trigger the V gesture handler
                    setDetectionCount(0); // Reset the count after gesture is recognized
                  }
                } else if (distanceBetweenFingers < 30) {
                  handleClickGesture(); // Handle click gesture
                } else {
                  setDetectionCount(0); // Reset count if gesture is not detected
                }
              }
            } catch (error) {
              console.error('Error during gesture detection:', error);
            }
          }
          requestAnimationFrame(detect);
        };
        detect();
      }
    };
            
    setupCamera();
  }, [model, gestureMode, isClicking, detectionCount]);

  useEffect(() => {
    const handleClick = () => {
      setIsClicking(true);
      // Reset isClicking after a short delay
      setTimeout(() => setIsClicking(false), 300);
    };

    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, []);

  const isVGesture = (indexAngle, middleAngle, distance) => {
    const indexAngleThreshold = [-110, -90];  // Example values
    const middleAngleThreshold = [-100, -80];  // Example values
    const distanceThreshold = [40, 100];        // Example values

    const isIndexAngleValid = indexAngle >= indexAngleThreshold[0] && indexAngle <= indexAngleThreshold[1];
    const isMiddleAngleValid = middleAngle >= middleAngleThreshold[0] && middleAngle <= middleAngleThreshold[1];
    const isDistanceValid = distance >= distanceThreshold[0] && distance <= distanceThreshold[1];

    return isIndexAngleValid && isMiddleAngleValid && isDistanceValid;
  };

  const handleVGesture = () => {
    const currentTime = new Date().getTime();
    if (currentTime - lastGestureTime > 300) { // Prevent rapid re-triggering
      setConfirmationMessage('V gesture detected! Navigating to settings...');
      setTimeout(() => {
        setConfirmationMessage('');
        navigate('/settings');
      }, 2000);
      setLastGestureTime(currentTime); // Update last gesture time
    }
  };

  const handleClickGesture = () => {
    // Functionality for click gesture
    setConfirmationMessage('Click gesture detected!');
    setTimeout(() => setConfirmationMessage(''), 2000); // Display message briefly
  };

  const toggleGestureMode = () => {
    setGestureMode((prevMode) => !prevMode);
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate('/'); // Redirect to the home page after logging out
      })
      .catch((error) => {
        console.error('Error during logout:', error);
      });
  };

  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="logo">GestEasy Art Gallery</div>
        <div className="navbar-buttons">
          <span className="welcome-message">Welcome, {userName}</span>
          <button className="nav-button" onClick={handleLogout}>
            Logout
          </button>
          <button className="nav-button">Order</button>
          <button className="nav-button">Cart</button>
          <button className="nav-button" onClick={toggleGestureMode}>
            {gestureMode ? 'Disable Gesture Mode' : 'Enable Gesture Mode'}
          </button>
        </div>
      </nav>

      <h1 className="products-title">Our Products</h1>

      {confirmationMessage && (
        <div className="confirmation-message">{confirmationMessage}</div>
      )}

      <video ref={videoRef} style={{ display: 'none' }}></video>

      {/* Conditionally render the cursor only when gesture mode is active */}
      {gestureMode && (
        <div className="cursor" style={{ left: `${cursorX}px`, top: `${cursorY}px` }}></div>
      )}

      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} className="product-image" />
            <h2 className="product-name">{product.name}</h2>
            <p className="product-price">{product.price}</p>
          </div>
        ))}
      </div>

      <footer className="footer">
        <p>&copy; 2024 GestEasy Art Gallery. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default Landing;
