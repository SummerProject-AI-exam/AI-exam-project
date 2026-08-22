Gaze Tracking

Researching different libraries and options
At the beginning of the project we researched different options for face recognition and gaze tracking. Our restriction was to use an open source and universal library that would work on all computers independent of operating systems. 

WebGazer.js
WebGazer is a browser based ML model that needs calibration to learn from. The model does not need a server and therefor protects the user’s privacy. Additionally is does self-calibration and learns user-specific gaze between eye and screen. It works with a normal webcam. Because the model runs in the browser, students would not need to install a separate app. 
Official active maintenance has ended although the code remains as open source on GitHub. As we needed a future proof system, WebGazer was selected out. In addition, WebGazer has several disadvantages for exam monitoring. Recent researches (MIT Press Direct)  found low accuracy and low signal-to noise ratio which make conclusions about where a student is looking unreliable. It also has weakness in short gaze changes. One study using WebGazer found an approximately 300 ms delay in the measured time course of eye movements. This makes timing-based alert logging difficult (National Library of Medicine). AS the model requires calibration, the results depend entirely of the calibration quality and might lack accuracy with un-cooperate student. WebGazer guide itself notes that calibration is not robust to substantial head movement. A student shifting position during a long exam could therefore reduce accuracy. WebGazer is also sensitive to camera quality and lightning conditions. It consumes a lot CPU which is a problem for low-end laptops (jspsych).
WebGazer was the only alternative that offered real gaze direction, but its instability and calibration requirements made it unsuitable for exam monitoring.
https://webgazer.cs.brown.edu/
https://github.com/brownhci/webgazer
MIT Press Direct: https://direct.mit.edu/opmi/article/doi/10.1162/opmi_a_00171/125551/Webcams-as-Windows-to-the-Mind-A-Direct-Comparison
National Library of Medicine: https://pubmed.ncbi.nlm.nih.gov/36323996/
https://github.com/jspsych/jsPsych/blob/main/docs/overview/eye-tracking.md

MediaPipe Face Landmarker
Face Landmarker works different from WebGazer. It detects facial landmarks and facial outputs and can be used for webcam-based exam monitoring. But it is not an eye-tracking system. Looking away from the screen is not measured by eye movement, but computed from head signals, pose, eye-openness and eye direction. But instead of WebGazer that answers where on a screen the student is looking, Face Landmarker can estimate and measure where a student is looking which makes looking away from screen easier detectable. 
Face Landmarker is currently maintained and supported. It works with normal webcams and is easy to integrate into a browser-based monitoring system. Face Landmarker returns 478 landmarks per detected face, including 3D landmark coordinates. The provided landmarks can be used to estimate changes in face orientation and therefor support looking away in exam monitoring. The landmarks include eye-related information to help interpret looking away from screen. Face detection, face presence, and tracking all have configurable minimum confidence thresholds.
Additionally Face Landmarker is already used in our project’s camera alerts and readiness check as the face-related information it provides gives reliable information about no face visible, multiple faces or eyes covered and could be integrated in gaze related fraud events without architectural changes. 
Disadvantages of Face Landmarker include webcam quality. Poor lighting, low-resolution cameras, motion blur, partial occlusion, or unusual camera angles can reduce the quality of the landmarks, MediaPipe's itself describes challenges. Also a turned head does not necessarily mean the student's eyes are looking away, and eyes can move while the head remains facing forward. MediaPipe documentation says that increasing the minimum tracking confidence can give better results, but increase also CPU usage. 
Earlier versions of MediaPipe FaceMesh included iris tracking, but this feature was removed from the modern pipeline. This meant real eye based gaze tracking was no longer available, and we had to rely on head pose based gaze instead.
https://developers.google.cn/edge/mediapipe/solutions/vision/face_landmarker/web_js
https://github.com/google-ai-edge/mediapipe/blob/master/docs/solutions/face_mesh.md


DeepGaze
An open source ML model for gaze estimation. It is trained on large datasets and available on GitHub. Two projects are available. DeepGaze which is a visual saliency / fixation prediction model. It predicts where people are likely to look in an image. It does not track eyes from a webcam, and therefor we did not research it further. Deepgaze which is a computer-vision library that includes head-pose and gaze-direction estimation. We research this one as it was potentially usable for exam monitoring. 
Head-pose estimates are supporting fraud detection when a student is turning/looking away from the screen. The project itself mentions that pose can be used when eyes are covered or the face is too far from the camera for a reliable analysis. 
The library includes face detection, head-pose estimation, motion detection/tracking. 
Deepgaze does not include gaze tracking, fraud alerts would be entirely based on head position. The last updated on GitHub are from 2020, so the model is not anymore maintenances. 
Deepgaze is not browser based and requires Python, which made it incompatible with our requirement of running fully in the browser.
https://github.com/matthias-k/DeepGaze
https://github.com/mpatacchiola/deepgaze


OpenFace
An open source library available on GitHub that is designed to work in real time using a normal webcam. It is similar to Face Landmarker, providing facial landmarks, head-pose estimation and eye-gaze estimations. 
Unlike MediaPipe Face Landmarker, OpenFace explicitly includes eye-gaze estimation as one of its core functions. Also head pose can be estimated, OpenFace supports facial landmark and head-pose tracking. 
The project on GitHub describes itself as a research code, not as fully developed product. It is also not browser based but has to be added by the students before exam what makes it unusable for our project. 
OpenFace is computationally heavy and would likely cause high CPU usage on student laptops, similar to WebGazer.
https://github.com/TadasBaltrusaitis/OpenFace/blob/master/README.md
Conclusion
After evaluating different models and libraries, we decided to use Face Landmarker because it was the only option that met all project constraints. It runs fully in the browser, does not require calibration, does not require installation, and is actively maintained. It also integrates directly with our existing camera alerts (no face, multiple faces, eyes covered), which made it possible to build a wider exam monitoring system without changing the architecture.
Our exam monitoring does not need to know where on the screen the student is looking, only whether they are looking at the screen at all. Face Landmarker provides stable face landmarks, head pose information, and eye related signals that support this. Other libraries were either outdated, incomplete, not browser compatible, or required calibration and heavy CPU usage. Face Landmarker was therefore the best and only viable choice.


What we tested
We tested several approaches with different results. During development we created many branches and prototypes, trying different gaze and pose methods. Some approaches were abandoned early, others were tested longer. Below is a reconstruction of the main approaches we tested

1.	Iris-based gaze tracking (attempted, abandoned)
At the beginning of the project we planned to use MediaPipe FaceMesh with iris tracking. This would have given real eye based gaze direction. However, MediaPipe removed iris tracking from the modern FaceMesh pipeline. The documentation online was outdated, and many tutorials still referenced the old iris model.
We searched for alternatives, but replacing iris tracking would have required major architectural changes (Python, GPU, server inference, or calibration based models). This was not realistic in the time given, so iris based gaze tracking was abandoned

2.	Eye-based gaze tracking using Face Landmarker (attempted, abandoned)
After iris tracking was removed, we attempted to derive gaze direction from the eye related landmarks that FaceLandmarker still provides (eye openness, eye contour, eye direction vectors). We tried multiple approaches, including computing dx/dy from eye landmarks, comparing left/right eye vectors, using eye direction and openness, smoothing eye direction. 
Eye direction flickered, blinking interrupted the signal, and lighting conditions changed the results. The direction flipped constantly and could not be stabilized. This approach was abandoned.

3.	Pose-based gaze tracking (attempted, abandoned)
We tested using head pose (yaw/pitch) as the main gaze direction. Pose values were easy to compute from FaceLandmarker’s 3D landmarks. In theory, pose should indicate whether the student is turning away. Problems were that small head movements caused large pose changes, normal posture shifts triggered false alerts, pose drifted, looking slightly left/right produced exaggerated pose values. 
We abandoned pose tracking and marked it as “nice to have but too unstable.”


4.	Hybrid gaze (eye + pose) (attempted, abandoned)
We briefly tested combining eye direction with head pose with eye directions for small movements, head pose for large movements. 
This approach was too complex and did not improve stability. Eye direction was too noisy, and pose was too unstable. The logic became complicated and did not produce reliable results. We abandoned hybrid gaze early.

5.	Head-posed-based gaze tracking (final approach)
In this approach head pose is recognized and measured. It uses 3D facial landmarks to estimate yaw/pitch and calculate a gaze direction. The MediaPipe FaceLandmarker we used in the project already supports this.
The advantages are that the approach works with glasses, blinking and different lighting. The detection is rather stable because horizontal and vertical values (dx/dy) are bigger and easier to classify than eye based gaze.
Weaknesses are micro movements of the head which produce drift in dx/dy values. It is difficult to distinguish between looking away from the screen and looking at the edge of the screen. Slight off screen looking sits directly on the threshold and causes direction to flip.
Head pose was stable enough to build direction alerts on for clear cases, so we chose this approach. It works universally across users and can be customized to a certain user by gaze calibration, which we built in order to get more reliable monitoring results.
However, even with calibration, the boundary between “screen” and “slightly off screen” remains unstable.


Final result
The system now includes several fully working components.
Camera alerts are stable and detect: 
– no face visible 
– multiple faces
 – face covered or occluded
 – face too far from camera 
– sudden appearance of another person

Readiness check is fully implemented and verifies before the exam: 
– camera works 
– face is visible 
– lighting is acceptable
 – student is centered 
– no multiple faces 
– no occlusion

Calibration is implemented and works. The system performs individualized gaze calibration for each student. Calibration collects baseline dx/dy values for CENTER, LEFT, RIGHT, UP and DOWN. This allows the system to adapt to different users, different webcams, and different seating positions.

Gaze alerts exist as a prototype. The system can detect clear head turn events (looking away left, right, up, down) after a persistent period and logs these events to Supabase. For clear cases, the alerts work reliably.
However, short gaze movements around the calibration boundary remain unreliable. Slight off screen looking produces jitter in dx/dy values, which can cause false positives. The system cannot reliably distinguish “looking at the edge of the screen” from “looking away.” More development time would be needed to stabilize this behavior, but this was not available.
A keyboard safe zone was considered, but thresholds are difficult to adjust because keyboard position varies between computers, setups, and student posture. This would have required an additional calibration step, which was not possible within the project time.
Eyes covered was also considered as a fraud event, but the system currently cannot distinguish between eyes covered and eyes closed. A new detection layer would have been needed.
Overall, the system provides a working camera monitoring solution with readiness check, camera alerts, calibration, and a prototype gaze alert system that works for clear cases but is not reliable enough for production use in borderline cases.


Architecture
The system is built in layers. FaceLandmarker provides all raw data. The readiness check verifies the environment. Camera alerts run continuously and detect basic fraud signals. Calibration builds a personalized gaze profile. The gaze alert prototype uses calibration and head pose to detect looking away. All alerts are logged to Supabase. If an earlier layer fails (no face, multiple faces, calibration missing), the later layers pause automatically.

The project contains many files because each part was developed and tested separately. The system is built in layers: FaceLandmarker → readiness → camera alerts → calibration → gaze alerts → logging. Each folder represents one part of this pipeline. The training room will show how all parts work together in one place.
1.	src/landmarker/alerts/ - Camera alerts
Camera alerts are the base layer. They detect no face, multiple faces, face and eyes covered, camera off and camera blocked. 
The files here convert raw Face Landmarker output into alerts and stabilize alerts. 
2.	src/landmarker/analysis/ - Readiness and camera quality
These files analyze the camera feed and environment. Readiness check uses these hooks. If readiness fails, exam does not start.
The files check if the camera is working, if the face is stable, lightning is enough, if frame freezes, if camera blocked or off. 
3.	src/components/ - UI
These files show what the system does. 
They draw facial landmarks, show directions, show calibration boundaries, help debug
4.	src/gaze/ - gaze features
These files compute gaze vectors and features.
The files are used by calibration, gaze alerts and gaze monitoring. They compute dx/dy from head pose, extract eye features, smooth vectors and classify direction (right, left up, down, center)
5.	src/gazeAlerts/ -gaze alert logic
These files are the prototype gaze alert system. 
Gaze alerts depend calibration, camera alerts  (face visible) and gaze features. They detect looking away, apply timers, apply calibration thresholds and log alerts to supabase
6.	src/hooks/ -shared hooks
The pipeline that connects all the parts. 
They manage the webcam, run Face Landmarker, compute dx /dy, run calibration, run monitoring, connect alerts to the UI
7.	src/pages/ - Testing pages
These pages are used for development and debugging
8.	src/utils/ - utilities
Those files draw landmarks on canvas and send the alerts to supabase
The folders and files are not isolated, they form a pipeline. 
src/hooks is the center of the system. It connects everything:
 – it starts the webcam
 – it runs FaceLandmarker 
– it sends raw data to analysis (readiness)
 – it sends raw data to alerts (camera alerts)
 – it sends raw data to gaze (feature extraction)
 – it sends processed gaze data to gazeAlerts (prototype alerts) 
– it sends all alert events to utils/supabaseClient 
– it sends UI ready data to components
src/pages load the hooks and show the results.

This means the folders work together like this:
FaceLandmarker → analysis → alerts → calibration → gaze → gazeAlerts → utils → components → pages


