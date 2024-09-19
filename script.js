// إعدادات تهيئة 
const firebaseConfig = {
  apiKey: "AIzaSyBXXCR2jN8SOP_AamRaE0vkEliR_cnpLqY",
  authDomain: "backy-123.firebaseapp.com",
  projectId: "backy-123",
  storageBucket: "backy-123.appspot.com",
  messagingSenderId: "763792380953",
  appId: "1:763792380953:web:74e509e70ca36b94f80688",
  measurementId: "G-YP8852THBW"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);

// مراجع Firebase
const storage = firebase.storage();
const firestore = firebase.firestore();

document.getElementById('videoForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const videoInput = document.getElementById('videoInput');
    const messageInput = document.getElementById('messageInput');
    const videoList = document.getElementById('videoList');

    if (videoInput.files.length > 0) {
        const videoFile = videoInput.files[0];
        const message = messageInput.value;

        // رفع الفيديو إلى Firebase Storage
        const storageRef = storage.ref('videos/' + videoFile.name);
        const uploadTask = storageRef.put(videoFile);

        uploadTask.on('state_changed', 
            function(snapshot) {
                // متابعة حالة الرفع (اختياري)
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            }, 
            function(error) {
                console.error('حدث خطأ أثناء رفع الفيديو:', error);
            }, 
            async function() {
                // الحصول على رابط الفيديو بعد الرفع
                const videoURL = await uploadTask.snapshot.ref.getDownloadURL();

                // حفظ معلومات الفيديو في Firestore
                await firestore.collection('videos').add({
                    url: videoURL,
                    message: message,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });

                // عرض الفيديو المرفوع
                displayVideo(videoURL, message);

                // إعادة تعيين النموذج
                videoInput.value = '';
                messageInput.value = '';
            }
        );
    }
});

// عرض الفيديوهات المرفوعة
async function displayVideo(url, message) {
    const videoList = document.getElementById('videoList');

    const videoItem = document.createElement('div');
    videoItem.classList.add('video-item');

    const videoElement = document.createElement('video');
    videoElement.src = url;
    videoElement.controls = true;
    videoElement.width = 300;

    const messageElement = document.createElement('p');
    messageElement.textContent = message;

    videoItem.appendChild(videoElement);
    videoItem.appendChild(messageElement);

    videoList.appendChild(videoItem);
}

// جلب الفيديوهات المرفوعة عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', async function() {
    const querySnapshot = await firestore.collection('videos').orderBy('timestamp', 'desc').get();
    querySnapshot.forEach((doc) => {
        const videoData = doc.data();
        displayVideo(videoData.url, videoData.message);
    });
});